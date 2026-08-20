import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { careerPaths, type CareerPath } from "@/data/careerPaths";

export interface CareerSuggestion {
  path: CareerPath;
  score: number;
  reasons: string[];
}

const norm = (s: string) => s.toLowerCase();

/**
 * Ranks careers against the student's own profile signals.
 * Purely explanatory , it never guarantees an outcome.
 */
export const useCareerSuggestions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["career_suggestions", user?.id ?? "anon"],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async (): Promise<CareerSuggestion[]> => {
      const [{ data: profile }, { data: saved }, { data: results }] = await Promise.all([
        supabase
          .from("profiles")
          .select("target_career, interests")
          .eq("id", user!.id)
          .maybeSingle(),
        supabase.from("saved_items").select("item_type, title, subtitle").eq("user_id", user!.id),
        supabase.from("wassce_results").select("subject, grade").eq("user_id", user!.id),
      ]);

      const interests = (profile?.interests ?? []).map(norm);
      const target = norm(profile?.target_career ?? "");
      const savedText = (saved ?? []).map((s) => norm(`${s.title} ${s.subtitle ?? ""}`));
      const subjects = (results ?? []).map((r) => norm(r.subject));

      const scored = careerPaths.map((path) => {
        const reasons: string[] = [];
        let score = 0;
        const hay = norm(
          [path.career_name, path.major, ...path.recommended_programmes, ...path.industries].join(" "),
        );

        if (target && (hay.includes(target) || target.includes(norm(path.major)))) {
          score += 5;
          reasons.push(`You listed “${profile?.target_career}” as your target career`);
        }
        for (const i of interests) {
          if (i && hay.includes(i)) {
            score += 2;
            reasons.push(`Matches your interest in ${i}`);
          }
        }
        for (const s of savedText) {
          if (path.recommended_programmes.some((p) => s.includes(norm(p)))) {
            score += 2;
            reasons.push("You saved a programme linked to this career");
            break;
          }
        }
        const subjectHits = path.relevant_subjects.filter((sub) =>
          subjects.some((s) => s.includes(norm(sub).split(" ")[0] ?? "")),
        );
        if (subjectHits.length >= 2) {
          score += subjectHits.length;
          reasons.push(`Your WASSCE subjects cover ${subjectHits.slice(0, 3).join(", ")}`);
        }

        return { path, score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
      });

      return scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);
    },
  });
};
