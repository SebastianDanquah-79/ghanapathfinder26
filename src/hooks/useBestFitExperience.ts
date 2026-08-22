import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { computeAggregate, type SubjectResult } from "@/lib/admissionEngine";
import { rankEmployers, type FitResult } from "@/lib/internships";
import { employersForMajor } from "@/data/employers";

export interface BestFit {
  results: FitResult[];
  aggregate: number | null;
  personalised: boolean;
}

/**
 * Ranks employers for a career path against the signed-in student's WASSCE
 * results, region and intended programme. Falls back to the generic
 * major-based list when the student is signed out or has no data yet.
 */
export const useBestFitExperience = (major: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["best_fit_experience", user?.id ?? "anon", major],
    staleTime: 60_000,
    queryFn: async (): Promise<BestFit> => {
      const generic = {
        results: employersForMajor(major).map((employer) => ({
          employer,
          score: 1,
          reasons: [`Hires students from ${major}`],
        })),
        aggregate: null,
        personalised: false,
      };

      if (!user) return generic;

      const [{ data: profile }, { data: results }] = await Promise.all([
        supabase
          .from("profiles")
          .select("region, target_career, interests, school")
          .eq("id", user.id)
          .maybeSingle(),
        supabase.from("wassce_results").select("subject, grade").eq("user_id", user.id),
      ]);

      const subjects = (results ?? []) as SubjectResult[];
      const { aggregate } = computeAggregate(subjects);

      const ranked = rankEmployers(major, {
        aggregate,
        subjects: subjects.map((s) => s.subject),
        region: profile?.region ?? null,
        programme: profile?.target_career ?? null,
        interests: profile?.interests ?? [],
      });

      if (!ranked.length) return generic;

      return {
        results: ranked,
        aggregate,
        personalised: subjects.length > 0 || !!profile?.region || !!profile?.target_career,
      };
    },
  });
};
