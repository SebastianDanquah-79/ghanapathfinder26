import { useQuery } from "@tanstack/react-query";
import { BarChart3, Globe, Users, Target, Eye, Sparkles } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";

type Analytics = {
  total_users?: number;
  active_users?: number;
  website_visits?: number;
  recommendation_runs?: number;
  countries?: number;
  countries_list?: string[];
  university_count?: number;
  programme_count?: number;
  scholarship_count?: number;
  opportunity_count?: number;
  internship_count?: number;
  international_student_count?: number;
  international_university_count?: number;
};

const number = (value?: number) => Number(value ?? 0).toLocaleString("en-GB");

export default function GlobalPlatformAnalytics() {
  const query = useQuery({
    queryKey: ["global-platform-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("platform_analytics");
      if (error) throw error;
      return (data ?? {}) as Analytics;
    },
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

  const stats = query.data;
  const cards = [
    ["Total users", stats?.total_users, Users],
    ["Active users", stats?.active_users, Target],
    ["Website visits", stats?.website_visits, Eye],
    ["AI recommendation runs", stats?.recommendation_runs, Sparkles],
  ] as const;

  return (
    <section aria-label="Live platform analytics" className="border-y border-border bg-secondary/5 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              <BarChart3 className="h-4 w-4" /> Live platform intelligence
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold">GhanaPathFinder at a glance</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Aggregate usage and catalogue measurements from the platform database. No fabricated counters.
            </p>
          </div>
          {stats?.countries_list?.length ? (
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-4 w-4" />
              {number(stats.countries)} countries represented
            </p>
          ) : null}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <div key={label} className="border border-border bg-background p-4">
              <Icon className="h-4 w-4 text-primary" />
              <p className="mt-3 text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-semibold">{number(value)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="border border-border bg-background p-4">
            <h3 className="font-semibold">Catalogue coverage</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              {[
                ["Universities", stats?.university_count],
                ["Programmes", stats?.programme_count],
                ["Scholarships", stats?.scholarship_count],
                ["Opportunities", stats?.opportunity_count],
                ["Internships", stats?.internship_count],
                ["International students", stats?.international_student_count],
                ["International universities", stats?.international_university_count],
              ].map(([label, value]) => (
                <div key={label} className="border border-border p-3">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="mt-1 font-semibold">{number(value as number)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-border bg-background p-4">
            <h3 className="flex items-center gap-2 font-semibold"><Globe className="h-4 w-4" /> Countries represented</h3>
            {stats?.countries_list?.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {stats.countries_list.map((country) => (
                  <span key={country} className="border border-border px-2.5 py-1.5 text-xs">{country}</span>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No country records are currently available.</p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Country coverage is derived from existing university records and opted-in profile data.
            </p>
          </div>
        </div>

        {query.isError && (
          <p className="mt-4 text-xs text-muted-foreground">
            Live analytics are temporarily unavailable. The rest of GhanaPathFinder remains usable.
          </p>
        )}
      </div>
    </section>
  );
}
