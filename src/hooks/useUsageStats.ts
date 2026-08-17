import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PublicUsageStats {
  metric: string;
  students: number;
  active_students: number;
  website_visits: number;
  recommendation_runs: number;
}

export const PUBLIC_METRICS: Array<{ key: string; label: string; field: keyof PublicUsageStats }> = [
  { key: "students", label: "Students using GhanaPathFinder (registered accounts)", field: "students" },
  { key: "active_students", label: "Students who have actively used GhanaPathFinder", field: "active_students" },
  { key: "website_visits", label: "Website visits (unique sessions)", field: "website_visits" },
  { key: "recommendation_runs", label: "Recommendation runs", field: "recommendation_runs" },
];

export const USAGE_STATS_KEY = ["public_usage_stats"] as const;

interface UsageCounterRow extends PublicUsageStats {
  id: string;
  updated_at: string;
}

const toStats = (row: Partial<UsageCounterRow> | null | undefined): PublicUsageStats => ({
  metric: row?.metric ?? "students",
  students: Number(row?.students ?? 0),
  active_students: Number(row?.active_students ?? 0),
  website_visits: Number(row?.website_visits ?? 0),
  recommendation_runs: Number(row?.recommendation_runs ?? 0),
});

/**
 * Live usage counter.
 *
 * The snapshot row `usage_counters.global` is recomputed by database triggers
 * whenever a visit, event or account is recorded, and streamed to every open
 * browser over the realtime WebSocket, so the number updates instantly for all
 * users without polling.
 */
export const useUsageStats = () => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: USAGE_STATS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usage_counters" as never)
        .select("*")
        .eq("id" as never, "global" as never)
        .maybeSingle();
      if (error) throw error;
      return toStats(data as unknown as UsageCounterRow | null);
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });

  useEffect(() => subscribeUsageCounters((stats) => qc.setQueryData(USAGE_STATS_KEY, stats)), [qc]);


  return query;
};




export interface PeriodMetrics {
  registered_users: number;
  unique_users: number;
  sessions: number;
  recommendation_runs: number;
  programme_views: number;
  university_views: number;
  scholarship_views: number;
  page_views: number;
  saved_universities: number;
  saved_programmes: number;
  saved_scholarships: number;
}

export type AdminAnalytics = Record<string, PeriodMetrics>;

export const useAdminAnalytics = (enabled: boolean) =>
  useQuery({
    queryKey: ["admin_analytics"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("admin_analytics" as never);
      if (error) throw error;
      return data as unknown as AdminAnalytics;
    },
  });

export const useSetPublicMetric = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (metric: string) => {
      const { error } = await supabase
        .from("app_settings" as never)
        .upsert({ key: "public_counter_metric", value: metric } as never, { onConflict: "key" } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["public_usage_stats"] });
    },
  });
};
