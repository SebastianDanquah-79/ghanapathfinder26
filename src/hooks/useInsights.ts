import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { removeCommunityImages } from "@/lib/communityImages";

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
  image_paths?: string[];
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
          "id, user_id, university_id, status, student_status, programme, year_of_study, category, rating, body, wish_i_knew, advice, image_paths, helpful_count, created_at, updated_at",
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
          "id, user_id, university_id, status, student_status, programme, year_of_study, category, rating, body, wish_i_knew, advice, image_paths, helpful_count, created_at, updated_at, universities(id, name, slug, location, website_url, logo_url)",
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as Array<
        StudentInsight & {
          universities: {
            id: string;
            name: string;
            slug: string;
            location: string | null;
            website_url: string | null;
            logo_url: string | null;
          } | null;
        }
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
        image_paths: input.image_paths ?? [],
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

/* ---------------- Author edit / delete ---------------- */

export interface InsightPatch {
  id: string;
  category?: string;
  student_status?: string;
  programme?: string | null;
  body?: string;
  image_paths?: string[];
}

/** Authors may correct their own published post (RLS scopes this to the owner). */
export const useUpdateMyInsight = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: InsightPatch) => {
      if (!user) throw new Error("Please sign in to edit your post.");
      const { error } = await supabase
        .from("student_insights")
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["community_insights"] });
      void qc.invalidateQueries({ queryKey: ["student_insights"] });
    },
  });
};

/** Authors may delete their own published post, including its photos. */
export const useDeleteMyInsight = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, imagePaths = [] }: { id: string; imagePaths?: string[] }) => {
      if (!user) throw new Error("Please sign in to delete your post.");
      const { error } = await supabase
        .from("student_insights")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      await removeCommunityImages(imagePaths);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["community_insights"] });
      void qc.invalidateQueries({ queryKey: ["student_insights"] });
    },
  });
};

/* ---------------- Missing logo requests ---------------- */

export const useRequestLogo = () => {
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: {
      university_id?: string | null;
      organisation_name: string;
      suggested_url?: string | null;
      note?: string | null;
    }) => {
      if (!user) throw new Error("Please sign in to request a logo.");
      const { error } = await supabase.from("logo_requests").insert({
        university_id: input.university_id ?? null,
        organisation_name: input.organisation_name,
        suggested_url: input.suggested_url || null,
        note: input.note || null,
        requested_by: user.id,
      });
      if (error) throw error;
    },
  });
};

/* ---------------- Helpful votes ---------------- */

/** Insight ids the signed-in student has already marked helpful. */
export const useMyHelpfulVotes = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["insight_helpful", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("insight_helpful")
        .select("insight_id")
        .eq("user_id", user!.id);
      if (error) throw error;
      return new Set((data ?? []).map((r) => r.insight_id));
    },
    staleTime: 30_000,
  });
};

export const useToggleHelpful = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (insightId: string) => {
      if (!user) throw new Error("Please sign in to mark an insight as helpful.");
      const { data, error } = await supabase.rpc("toggle_insight_helpful", {
        _insight_id: insightId,
      });
      if (error) throw error;
      return data as { voted: boolean; helpful_count: number };
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["insight_helpful"] });
      void qc.invalidateQueries({ queryKey: ["community_insights"] });
      void qc.invalidateQueries({ queryKey: ["student_insights"] });
    },
  });
};
