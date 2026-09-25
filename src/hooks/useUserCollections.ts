import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
// These tables were added after the generated Supabase types, so we declare
// their shapes locally instead of using Tables<...>.
export interface UserCollection {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  item_type: string;
  item_key: string;
  note: string | null;
  created_at: string;
}

export function useUserCollections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user_collections", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return [] as UserCollection[];
      const { data, error } = await supabase.from("user_collections").select("*").eq("user_id", user.id).order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as UserCollection[];
    },
  });
}

export function useCreateCollection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Pick<UserCollection, "name" | "description" | "visibility">) => {
      if (!user) throw new Error("Sign in to create a collection.");
      const { data, error } = await supabase.from("user_collections").insert({ ...input, user_id: user.id }).select("*").single();
      if (error) throw error;
      return data as UserCollection;
    },
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["user_collections"] }); },
  });
}

export function useDeleteCollection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (collectionId: string) => {
      if (!user) throw new Error("Sign in to manage collections.");
      const { error } = await supabase.from("user_collections").delete().eq("id", collectionId).eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["user_collections"] }); },
  });
}
