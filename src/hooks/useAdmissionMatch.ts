import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  computeAggregate,
  evaluateMatch,
  type CutoffRecord,
  type MatchResult,
  type SubjectResult,
} from "@/lib/admissionEngine";

export interface CutoffWithUniversity extends CutoffRecord {
  universities: { id: string; name: string; short_name: string | null; slug: string } | null;
}

/** The signed-in student's WASSCE results. */
export const useWassceResults = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["wassce_results", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("wassce_results").select("subject, grade");
      if (error) throw error;
      return (data ?? []) as SubjectResult[];
    },
  });
};

/** Verified, sourced cut-off records. */
export const useCutoffs = (search = "", universityId?: string) =>
  useQuery({
    queryKey: ["programme_cutoffs", search, universityId],
    queryFn: async () => {
      let q = supabase
        .from("programme_cutoffs")
        .select("*, universities(id, name, short_name, slug)")
        .eq("verification_status", "verified")
        .order("cut_off_aggregate", { ascending: true })
        .limit(500);
      if (universityId) q = q.eq("university_id", universityId);
      if (search.trim()) q = q.ilike("programme_name", `%${search.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as CutoffWithUniversity[];
    },
    staleTime: 5 * 60_000,
  });

const ORDER: Record<string, number> = {
  "Excellent Match": 0,
  "Strong Match": 1,
  Competitive: 2,
  Reach: 3,
  "Low Match": 4,
  "Not Eligible": 5,
  "Insufficient Data": 6,
};

export interface ScoredMatch extends MatchResult {
  cutoff: CutoffWithUniversity;
}

/** Score every cut-off record against the student's results. */
export const useAdmissionMatches = (search = "", universityId?: string) => {
  const { data: results = [], isLoading: loadingResults } = useWassceResults();
  const { data: cutoffs = [], isLoading, error } = useCutoffs(search, universityId);

  const breakdown = useMemo(() => computeAggregate(results), [results]);

  const matches = useMemo(() => {
    const scored = cutoffs.map(
      (c) => ({ ...evaluateMatch(c, results, breakdown), cutoff: c }) as ScoredMatch,
    );
    return scored.sort((a, b) => {
      const d = ORDER[a.category] - ORDER[b.category];
      if (d !== 0) return d;
      return (b.confidence ?? -1) - (a.confidence ?? -1);
    });
  }, [cutoffs, results, breakdown]);

  return { matches, breakdown, results, isLoading: isLoading || loadingResults, error };
};
