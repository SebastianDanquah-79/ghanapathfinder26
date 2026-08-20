import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type SavedItemType = "university" | "scholarship" | "career" | "programme" | "skill";

export interface SavedItemInput {
  item_type: SavedItemType;
  item_key: string;
  title: string;
  subtitle?: string | null;
  metadata?: Record<string, unknown>;
}

export const useSavedItems = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved_items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
};

export const useToggleSaved = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ item, saved }: { item: SavedItemInput; saved: boolean }) => {
      if (!user) throw new Error("Sign in to save items");
      if (saved) {
        const { error } = await supabase
          .from("saved_items")
          .delete()
          .eq("user_id", user.id)
          .eq("item_type", item.item_type)
          .eq("item_key", item.item_key);
        if (error) throw error;
        return "removed" as const;
      }
      const { error } = await supabase.from("saved_items").upsert(
        {
          user_id: user.id,
          item_type: item.item_type,
          item_key: item.item_key,
          title: item.title,
          subtitle: item.subtitle ?? null,
          metadata: (item.metadata ?? {}) as never,
        },
        { onConflict: "user_id,item_type,item_key" },
      );
      if (error) throw error;
      return "saved" as const;

    },
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["saved_items"] });
      toast.success(result === "saved" ? "Saved to your dashboard" : "Removed from saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
};
