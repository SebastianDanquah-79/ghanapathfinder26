import { useQuery } from "@tanstack/react-query";
import { BarChart3, Globe, Users, Target, Eye, Sparkles } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";

type CountryMetric = { country: string; users: number };
type Analytics = {
  total_users?: number;
  active_users?: number;
  website_visits?: number;
  recommendation_runs?: number;
  countries?: number;
  countries_list?: string[];
  user_country_counts?: CountryMetric[];
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
    staleTime: 30_000,
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
              Live measurements from GhanaPathFinder's database. User totals and country distribution are derived from actual platform records.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <a href="/news" className="border border-border px-3 py-2 hover:border-primary hover:text-primary">Global news</a>
            <a href="/international-students" className="border border-border px-3 py-2 hover:border-primary hover:text-primary">International students</a>
            <a href="/international-universities" className="border border-border px-3 py-2 hover:border-primary hover:text-primary">International universities</a>
          </div>
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
            <h3 className="flex items-center gap-2 font-semibold"><Globe className="h-4 w-4" /> User countries</h3>
            {stats?.user_country_counts?.length ? (
              <div className="mt-4 space-y-2">
                {stats.user_country_counts.slice(0, 12).map((item) => (
                  <div key={item.country} className="flex items-center justify-between border-b border-border py-2 text-sm">
                    <span>{item.country}</span><span className="font-semibold">{number(item.users)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No country information has been supplied by users yet.</p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">{number(stats?.countries)} user countries represented</p>
          </div>
        </div>

        {query.isError && (
          <div className="mt-4 border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm font-medium">Live analytics could not be loaded.</p>
            <p className="mt-1 text-xs text-muted-foreground">The analytics endpoint is protected and the rest of the platform remains available.</p>
          </div>
        )}
      </div>
    </section>
  );
}
