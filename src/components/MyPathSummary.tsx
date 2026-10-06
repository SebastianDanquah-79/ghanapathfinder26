import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePipeline } from "@/hooks/usePipeline";
import { useApplications } from "@/hooks/useApplications";
import { useSavedItems } from "@/hooks/useSavedItems";
import { daysLeft } from "@/lib/opportunityFormat";
import AdvisorButton from "@/components/AdvisorButton";

/** Read-only overview of the student's profile completeness, tracking and deadlines. */
const MyPathSummary = () => {
  const { user } = useAuth();
  const { data: pipeline = [] } = usePipeline();
  const { data: apps = [] } = useApplications();
  const { data: saved = [] } = useSavedItems();
  const { data: checks } = useQuery({
    queryKey: ["profile-completeness", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const [p, w, m, l] = await Promise.all([
        supabase
          .from("profiles")
          .select("full_name, school, target_career, region")
          .eq("id", user!.id)
          .maybeSingle(),
        supabase
          .from("wassce_results")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id),
        supabase
          .from("match_preferences")
          .select("user_id")
          .eq("user_id", user!.id)
          .maybeSingle(),
        supabase
          .from("life_path_items")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user!.id),
      ]);
      const prof = (p.data ?? {}) as Record<string, string | null>;
      return [
        {
          label: "Basic profile",
          done: !!(prof["full_name"] && prof["region"]),
          href: "/onboarding",
        },
        {
          label: "Target career",
          done: !!prof["target_career"],
          href: "/onboarding",
        },
        {
          label: "Results added (optional)",
          done: (w.count ?? 0) > 0,
          href: "/onboarding",
        },
        { label: "Match preferences", done: !!m.data, href: "/preferences" },
        { label: "Path steps", done: (l.count ?? 0) > 0, href: "/careers" },
      ];
    },
  });

  if (!user) return null;

  const deadlines = [
    ...apps
      .filter((a) => a.deadline)
      .map((a) => ({ title: a.scholarship_name, date: a.deadline as string })),
    ...pipeline
      .filter((p) => p.deadline_date)
      .map((p) => ({ title: p.title, date: p.deadline_date as string })),
  ]
    .map((d) => ({ ...d, left: daysLeft(d.date) ?? -1 }))
    .filter((d) => d.left >= 0)
    .sort((a, b) => a.left - b.left)
    .slice(0, 5);

  const done = checks?.filter((c) => c.done).length ?? 0;

  return (
    <section className="rounded-xl border border-border p-4 sm:p-5 grid gap-5 md:grid-cols-3">
      <div>
        <h2 className="font-semibold text-foreground text-sm">
          Profile {checks ? `${done}/${checks.length}` : ""}
        </h2>
        <ul className="mt-2 space-y-1 text-sm">
          {checks?.map((c) => (
            <li
              key={c.label}
              className="flex items-center justify-between gap-2"
            >
              <span
                className={c.done ? "text-muted-foreground" : "text-foreground"}
              >
                {c.done ? "✓ " : "○ "}
                {c.label}
              </span>
              {!c.done && (
                <Link to={c.href} className="text-xs text-primary">
                  Add
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold text-foreground text-sm">Tracking</h2>
        <p className="text-sm text-muted-foreground mt-2">
          {apps.length} scholarship{apps.length === 1 ? "" : "s"} ·{" "}
          {pipeline.length} other opportunit
          {pipeline.length === 1 ? "y" : "ies"} · {saved.length} saved
        </p>
        <Link
          to="/applications"
          className="text-xs text-primary mt-2 inline-block"
        >
          Open tracker
        </Link>
      </div>
      <div>
        <h2 className="font-semibold text-foreground text-sm">
          Next deadlines
        </h2>
        {deadlines.length ? (
          <ul className="mt-2 space-y-1 text-sm">
            {deadlines.map((d) => (
              <li
                key={`${d.title}-${d.date}`}
                className="flex justify-between gap-2"
              >
                <span className="truncate">{d.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {d.left}d
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground mt-2">
            No upcoming deadlines tracked.
          </p>
        )}
        <div className="mt-3">
          <AdvisorButton
            topic="The student is reviewing their My Path plan, tracked applications and deadlines"
            label="Ask about my plan"
          />
        </div>
      </div>
    </section>
  );
};

export default MyPathSummary;
