import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWassceResults } from "@/hooks/useAdmissionMatch";
import {
  computeAggregate,
  evaluateReference,
  type AdmissionReference,
  type ReferenceMatch,
} from "@/lib/admissionEngine";

/**
 * Every verified programme in the GhanaPath database, with either an official
 * cut-off or an evidence-based estimated range attached. Never restricted to a
 * handful of institutions.
 */
export const useAdmissionReference = (search = "", universityId?: string, limit = 400) =>
  useQuery({
    queryKey: ["admission_reference", search, universityId, limit],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admission_reference" as never, {
        _q: search,
        _university_id: universityId ?? null,
        _limit: limit,
      } as never);
      if (error) throw error;
      return (data ?? []) as unknown as AdmissionReference[];
    },
    staleTime: 5 * 60_000,
  });

/** Score a raw self-reported aggregate against the whole database. */
export const useAggregateRecommendations = (
  aggregate: number | null,
  search = "",
  enabled = true,
) => {
  const { data: references = [], isLoading, error } = useAdmissionReference(
    enabled ? search : "\u0000never",
  );

  const matches = useMemo<ReferenceMatch[]>(() => {
    if (aggregate == null) return [];
    return references
      .map((r) => evaluateReference(r, aggregate))
      .sort((a, b) => a.rank - b.rank || (b.confidence ?? -1) - (a.confidence ?? -1));
  }, [references, aggregate]);

  return { matches, isLoading, error };
};

/** Score the signed-in student's full WASSCE results against the whole database. */
export const useReferenceMatches = (search = "", universityId?: string) => {
  const { data: results = [], isLoading: loadingResults } = useWassceResults();
  const { data: references = [], isLoading, error } = useAdmissionReference(search, universityId);

  const breakdown = useMemo(() => computeAggregate(results), [results]);

  const matches = useMemo<ReferenceMatch[]>(
    () =>
      references
        .map((r) => evaluateReference(r, breakdown.aggregate, results))
        .sort((a, b) => a.rank - b.rank || (b.confidence ?? -1) - (a.confidence ?? -1)),
    [references, breakdown.aggregate, results],
  );

  return { matches, breakdown, results, isLoading: isLoading || loadingResults, error };
};
