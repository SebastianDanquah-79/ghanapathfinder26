import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useWassceResults } from "@/hooks/useAdmissionMatch";
import {
  computeAggregate,
  evaluateReference,
  type AdmissionReference,
  type ReferenceMatch,
  type SubjectResult,
} from "@/lib/admissionEngine";

/**
 * Every verified programme in the GhanaPathFinder database, with either an official
 * cut-off or an evidence-based estimated range attached. Never restricted to a
 * handful of institutions.
 */
export const useAdmissionReference = (
  search = "",
  universityId?: string,
  limit = 400,
  enabled = true,
) =>
  useQuery({
    queryKey: ["admission_reference", search, universityId, limit],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admission_reference" as never, {
        _q: search,
        _university_id: universityId ?? null,
        _limit: limit,
      } as never);
      if (error) throw error;
      return (data ?? []) as unknown as AdmissionReference[];
    },
    // Always revalidate after a previous schema-cache/network failure. The
    // admission catalogue is used for decisions, so an old error should not
    // remain on screen after the RPC has recovered.
    staleTime: 0,
    retry: 2,
    retryDelay: (attempt) => Math.min(1_000 * 2 ** attempt, 5_000),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

/** Score a raw self-reported aggregate against the whole database. */
export const useAggregateRecommendations = (
  aggregate: number | null,
  search = "",
  enabled = true,
  results: SubjectResult[] = [],
) => {
  const { data: references = [], isLoading, error } = useAdmissionReference(
    search,
    undefined,
    400,
    enabled,
  );

  const matches = useMemo<ReferenceMatch[]>(() => {
    if (aggregate == null) return [];
    return references
      .map((r) => evaluateReference(r, aggregate, results))
      .sort((a, b) => a.rank - b.rank || (b.confidence ?? -1) - (a.confidence ?? -1));
  }, [references, aggregate, results]);

  return { matches, isLoading, error };
};

/** Score the signed-in student's full WASSCE results against the whole database. */
export const useReferenceMatches = (search = "", universityId?: string) => {
  const { data: results = [], isLoading: loadingResults } = useWassceResults();
  const {
    data: references = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAdmissionReference(search, universityId);

  const breakdown = useMemo(() => computeAggregate(results), [results]);

  const matches = useMemo<ReferenceMatch[]>(
    () =>
      references
        .map((r) => evaluateReference(r, breakdown.aggregate, results))
        .sort((a, b) => a.rank - b.rank || (b.confidence ?? -1) - (a.confidence ?? -1)),
    [references, breakdown.aggregate, results],
  );

  return {
    matches,
    breakdown,
    results,
    isLoading: isLoading || loadingResults,
    error,
    refetch,
    isFetching,
  };
};
