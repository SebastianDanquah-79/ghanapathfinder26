import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type FollowEntityType = Tables<"user_follows">["entity_type"];
export type UserFollow = Tables<"user_follows">;

export function useUserFollows() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_follows", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return [] as UserFollow[];
      const { data, error } = await supabase.from("user_follows").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserFollow[];
    },
  });
}

export function useFollow(entityType: FollowEntityType, entityKey: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["user_follow", user?.id, entityType, entityKey],
    enabled: Boolean(user && entityKey),
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.from("user_follows").select("id").eq("user_id", user.id).eq("entity_type", entityType).eq("entity_key", entityKey).maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
  });
  const mutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to follow this.");
      if (query.data) {
        const { error } = await supabase.from("user_follows").delete().eq("user_id", user.id).eq("entity_type", entityType).eq("entity_key", entityKey);
        if (error) throw error;
        return false;
      }
      const { error } = await supabase.from("user_follows").insert({ user_id: user.id, entity_type: entityType, entity_key: entityKey });
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user_follow", user?.id, entityType, entityKey] });
      void queryClient.invalidateQueries({ queryKey: ["user_follows", user?.id] });
    },
  });
  return { followed: Boolean(query.data), isLoading: query.isLoading, isPending: mutation.isPending, toggle: mutation.mutateAsync };
}
