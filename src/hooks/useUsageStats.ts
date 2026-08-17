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

export const useUsageStats = () =>
  useQuery({
    queryKey: USAGE_STATS_KEY,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("public_usage_stats" as never);
      if (error) throw error;
      return data as unknown as PublicUsageStats;
    },
    // Always show a fresh count: refetch on every mount, on tab focus,
    // when the connection returns, and on a light background interval.
    staleTime: 0,
    gcTime: 5 * 60_000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    retry: 1,
  });


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
