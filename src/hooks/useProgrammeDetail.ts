import { useMemo } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useWassceResults } from "@/hooks/useAdmissionMatch";
import {
  computeAggregate,
  evaluateMatch,
  type CutoffRecord,
  type MatchResult,
} from "@/lib/admissionEngine";
import type { Programme, University } from "@/hooks/useCatalogue";

export type ProgrammeInformation = Tables<"programme_information">;
export type ProgrammeCareer = Tables<"programme_careers">;
export type ProgrammeSource = Tables<"programme_sources">;
export type ProgrammeCutoff = Tables<"programme_cutoffs">;

export interface ProgrammeDetail {
  programme: Programme;
  university: University | null;
  faculty: string | null;
  information: ProgrammeInformation | null;
  careers: ProgrammeCareer[];
  sources: ProgrammeSource[];
  cutoffs: ProgrammeCutoff[];
}

/** Everything shown on a single programme profile page. */
export const programmeDetailQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["programme_detail", slug],
    staleTime: 60_000,

    queryFn: async (): Promise<ProgrammeDetail | null> => {
      const { data: prog, error } = await supabase
        .from("programmes")
        .select("*, universities(*), faculties(name)")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      if (!prog) return null;

      const row = prog as unknown as Programme & {
        universities: University | null;
        faculties: { name: string } | null;
      };

      const [info, careers, sources, cutoffs] = await Promise.all([
        supabase.from("programme_information").select("*").eq("programme_id", row.id).maybeSingle(),
        supabase.from("programme_careers").select("*").eq("programme_id", row.id).order("occupation"),
        supabase.from("programme_sources").select("*").eq("programme_id", row.id),
        supabase
          .from("programme_cutoffs")
          .select("*")
          .eq("university_id", row.university_id)
          .or(`programme_id.eq.${row.id},programme_name.ilike.%${row.name.replace(/^(BSc|BA|BEd|BCom|BTech|BFA|Diploma in|Certificate in)\s+/i, "").slice(0, 40)}%`)
          .order("academic_year", { ascending: false })
          .limit(5),
      ]);

      return {
        programme: row,
        university: row.universities ?? null,
        faculty: row.faculties?.name ?? null,
        information: (info.data as ProgrammeInformation | null) ?? null,
        careers: (careers.data ?? []) as ProgrammeCareer[],
        sources: (sources.data ?? []) as ProgrammeSource[],
        cutoffs: (cutoffs.data ?? []) as ProgrammeCutoff[],
      };
    },
  });

/** WASSCE-based match confidence for this programme, when a verified cut-off exists. */
export const useProgrammeMatch = (cutoffs: ProgrammeCutoff[] | undefined): MatchResult | null => {
  const { data: results = [] } = useWassceResults();
  return useMemo(() => {
    const cutoff = (cutoffs ?? []).find((c) => c.verification_status === "verified") ?? cutoffs?.[0];
    if (!cutoff || results.length === 0) return null;
    return evaluateMatch(cutoff as unknown as CutoffRecord, results, computeAggregate(results));
  }, [cutoffs, results]);
};
