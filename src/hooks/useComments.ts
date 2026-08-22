import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

export type InsightComment = Tables<"insight_comments">;

/** Approved comments for one insight, oldest first (thread reading order). */
export const useInsightComments = (insightId?: string, enabled = true) =>
  useQuery({
    queryKey: ["insight_comments", insightId],
    enabled: !!insightId && enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insight_comments")
        .select("id, insight_id, parent_id, user_id, author_label, body, like_count, created_at")
        .eq("insight_id", insightId!)
        .eq("status", "approved")
        .order("created_at", { ascending: true })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Array<
        Pick<
          InsightComment,
          | "id"
          | "insight_id"
          | "parent_id"
          | "user_id"
          | "author_label"
          | "body"
          | "like_count"
          | "created_at"
        >
      >;
    },
    staleTime: 15_000,
  });

/** Comment counts for a list of insights (one round trip). */
export const useCommentCounts = (insightIds: string[]) =>
  useQuery({
    queryKey: ["insight_comment_counts", insightIds.join(",")],
    enabled: insightIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insight_comments")
        .select("insight_id")
        .eq("status", "approved")
        .in("insight_id", insightIds);
      if (error) throw error;
      const map = new Map<string, number>();
      for (const row of data ?? []) {
        map.set(row.insight_id, (map.get(row.insight_id) ?? 0) + 1);
      }
      return map;
    },
    staleTime: 15_000,
  });

/** The signed-in student's display label, used when posting. */
export const useMyAuthorLabel = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my_author_label", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user!.id)
        .maybeSingle();
      const name = data?.full_name?.trim();
      return name && name.length > 1 ? name : "Student";
    },
    staleTime: 5 * 60_000,
  });
};

export const useAddComment = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: label } = useMyAuthorLabel();
  return useMutation({
    mutationFn: async (input: { insight_id: string; body: string; parent_id?: string | null }) => {
      if (!user) throw new Error("Please sign in to join the discussion.");
      const body = input.body.trim();
      if (!body) throw new Error("Write something first.");
      const { error } = await supabase.from("insight_comments").insert({
        insight_id: input.insight_id,
        parent_id: input.parent_id ?? null,
        body,
        user_id: user.id,
        author_label: label ?? "Student",
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ["insight_comments", vars.insight_id] });
      void qc.invalidateQueries({ queryKey: ["insight_comment_counts"] });
    },
  });
};

export const useDeleteComment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id }: { id: string; insight_id: string }) => {
      const { error } = await supabase.from("insight_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ["insight_comments", vars.insight_id] });
      void qc.invalidateQueries({ queryKey: ["insight_comment_counts"] });
    },
  });
};

/** Comment ids the signed-in student has liked. */
export const useMyCommentLikes = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["comment_likes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.comment_id));
    },
    staleTime: 30_000,
  });
};

export const useToggleCommentLike = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { comment_id: string; insight_id: string }) => {
      if (!user) throw new Error("Please sign in to like a comment.");
      const { data, error } = await supabase.rpc("toggle_comment_like", {
        _comment_id: vars.comment_id,
      });
      if (error) throw error;
      return data as unknown as { liked: boolean; like_count: number };
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ["comment_likes"] });
      void qc.invalidateQueries({ queryKey: ["insight_comments", vars.insight_id] });
    },
  });
};
