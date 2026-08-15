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
  { key: "students", label: "Students using GhanaPath (registered accounts)", field: "students" },
  { key: "active_students", label: "Students who have actively used GhanaPath", field: "active_students" },
  { key: "website_visits", label: "Website visits (unique sessions)", field: "website_visits" },
  { key: "recommendation_runs", label: "Recommendation runs", field: "recommendation_runs" },
];

export const useUsageStats = () =>
  useQuery({
    queryKey: ["public_usage_stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("public_usage_stats" as never);
      if (error) throw error;
      return data as unknown as PublicUsageStats;
    },
    staleTime: 5 * 60_000,
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
