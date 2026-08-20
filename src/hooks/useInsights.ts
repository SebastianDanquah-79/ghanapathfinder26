import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";

export type StudentInsight = Tables<"student_insights">;

export const INSIGHT_CATEGORIES = [
  "General",
  "Academics & lecturers",
  "Accommodation",
  "Food",
  "Transportation",
  "Campus environment",
  "Internet & facilities",
  "Fees & cost of living",
  "Administration",
  "Workload",
  "Clubs & student life",
  "Safety",
  "Surrounding town",
] as const;

export const STUDENT_STATUSES = ["Current student", "Graduate", "Former student"] as const;

export interface InsightInput {
  university_id: string;
  student_status: string;
  category: string;
  programme?: string | null;
  year_of_study?: string | null;
  rating?: number | null;
  body: string;
  wish_i_knew?: string | null;
  advice?: string | null;
}

/** Approved, publicly visible insights for one university. */
export const useUniversityInsights = (universityId?: string) =>
  useQuery({
    queryKey: ["student_insights", universityId],
    enabled: !!universityId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_insights")
        .select(
          "id, university_id, status, student_status, programme, year_of_study, category, rating, body, wish_i_knew, advice, helpful_count, created_at, updated_at",
        )
        .eq("university_id", universityId!)
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 30_000,
  });

/** Latest approved insights across all institutions (Community feed). */
export const useCommunityInsights = (limit = 30) =>
  useQuery({
    queryKey: ["community_insights", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_insights")
        .select(
          "id, university_id, status, student_status, programme, year_of_study, category, rating, body, wish_i_knew, advice, helpful_count, created_at, updated_at, universities(name, slug, location)",
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Array<
        StudentInsight & { universities: { name: string; slug: string; location: string | null } | null }
      >;
    },
    staleTime: 30_000,
  });

export const useCreateInsight = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: InsightInput) => {
      if (!user) throw new Error("Please sign in to share your experience.");
      const { error } = await supabase.from("student_insights").insert({
        ...input,
        programme: input.programme || null,
        year_of_study: input.year_of_study || null,
        wish_i_knew: input.wish_i_knew || null,
        advice: input.advice || null,
        rating: input.rating ?? null,
        user_id: user.id,
        status: "approved",
      });
      if (error) throw error;
    },
    onSuccess: (_d, vars) => {
      void qc.invalidateQueries({ queryKey: ["student_insights", vars.university_id] });
      void qc.invalidateQueries({ queryKey: ["community_insights"] });
    },
  });
};

export const useReportInsight = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: { insight_id: string; reason: string; details?: string }) => {
      if (!user) throw new Error("Please sign in to report an insight.");
      const { error } = await supabase.from("insight_reports").insert({
        insight_id: input.insight_id,
        reason: input.reason,
        details: input.details || null,
        reporter_id: user.id,
      });
      if (error) throw error;
    },
  });
};

/* ---------------- Admin moderation ---------------- */

export const useModerationQueue = (enabled: boolean) =>
  useQuery({
    queryKey: ["moderation_insights"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_insights")
        .select("*, universities(name, slug)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Array<
        StudentInsight & { universities: { name: string; slug: string } | null }
      >;
    },
  });

export const useInsightReports = (enabled: boolean) =>
  useQuery({
    queryKey: ["insight_reports"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insight_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data ?? [];
    },
  });

export const useModerateInsight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("student_insights").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["moderation_insights"] });
      void qc.invalidateQueries({ queryKey: ["community_insights"] });
    },
  });
};

export const useDeleteInsight = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("student_insights").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["moderation_insights"] });
      void qc.invalidateQueries({ queryKey: ["community_insights"] });
    },
  });
};
