import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { ArrowLeft, BarChart3, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdminData";
import {
  PUBLIC_METRICS,
  useAdminAnalytics,
  useSetPublicMetric,
  useUsageStats,
  type PeriodMetrics,
} from "@/hooks/useUsageStats";
import { toast } from "sonner";

const PERIODS: Array<{ key: string; label: string }> = [
  { key: "today", label: "Today" },
  { key: "last_7_days", label: "7 days" },
  { key: "last_30_days", label: "30 days" },
  { key: "all_time", label: "All time" },
];

const ROWS: Array<{ key: keyof PeriodMetrics; label: string }> = [
  { key: "registered_users", label: "Total registered users" },
  { key: "unique_users", label: "Unique signed-in users" },
  { key: "sessions", label: "Total sessions" },
  { key: "page_views", label: "Page views" },
  { key: "recommendation_runs", label: "Recommendation runs" },
  { key: "programme_views", label: "Programme views" },
  { key: "university_views", label: "University views" },
  { key: "scholarship_views", label: "Scholarship views" },
  { key: "saved_universities", label: "Saved universities" },
  { key: "saved_programmes", label: "Saved programmes" },
  { key: "saved_scholarships", label: "Saved scholarships" },
];

const AdminAnalytics = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const { data, isLoading } = useAdminAnalytics(!!isAdmin);
  const { data: publicStats } = useUsageStats();
  const setMetric = useSetPublicMetric();
  const [metric, setMetricState] = useState<string | null>(null);

  if (loading || roleLoading)
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );

  if (!user || !isAdmin)
    return (
      <div className="min-h-screen bg-background grid place-items-center px-4">
        <p className="text-sm text-muted-foreground">
          This analytics area is for GhanaPath administrators only.
        </p>
      </div>
    );

  const selected = metric ?? publicStats?.metric ?? "students";

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Seo
        title="Admin Analytics | GhanaPath"
        description="Verified GhanaPath usage analytics for administrators: registered users, sessions, recommendation runs and saved items."
        path="/admin/analytics"
      />
      <Navbar />
      <div className="max-w-6xl mx-auto">
        <Link to="/admin/data" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Admin data
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Analytics</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Every figure below is counted from real stored events. Individual students are never
          identified — only aggregates are shown.
        </p>

        <div className="bg-glass rounded-xl p-5 mb-6">
          <p className="text-sm font-medium text-foreground mb-2">Public counter</p>
          <p className="text-xs text-muted-foreground mb-3">
            Choose which verified metric is displayed publicly on the site.
          </p>
          <div className="flex flex-wrap gap-2">
            {PUBLIC_METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => {
                  setMetricState(m.key);
                  setMetric.mutate(m.key, {
                    onSuccess: () => toast.success("Public counter updated"),
                    onError: (e) => toast.error((e as Error).message),
                  });
                }}
                className={`px-3 py-2 rounded-lg text-xs border ${
                  selected === m.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {m.label}
                {publicStats ? ` · ${Number(publicStats[m.field] ?? 0).toLocaleString("en-GB")}` : ""}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading analytics…
          </div>
        )}

        {data && (
          <div className="bg-glass rounded-xl p-5 overflow-x-auto hscroll">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="text-left py-2 pr-4">Metric</th>
                  {PERIODS.map((p) => (
                    <th key={p.key} className="text-right py-2 px-3">{p.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row) => (
                  <tr key={row.key} className="border-t border-border">
                    <td className="py-2 pr-4 text-muted-foreground">{row.label}</td>
                    {PERIODS.map((p) => (
                      <td key={p.key} className="py-2 px-3 text-right text-foreground font-medium">
                        {Number(data[p.key]?.[row.key] ?? 0).toLocaleString("en-GB")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
