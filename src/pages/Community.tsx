import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import {
  INSIGHT_CATEGORIES,
  useCommunityInsights,
  useMyHelpfulVotes,
  useReportInsight,
  useToggleHelpful,
} from "@/hooks/useInsights";

const Community = () => {
  const { data, isLoading } = useCommunityInsights(60);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "helpful">("recent");
  const { data: myVotes } = useMyHelpfulVotes();
  const toggleHelpful = useToggleHelpful();
  const report = useReportInsight();

  const insights = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = (data ?? []).filter(
      (i) =>
        (category === "All" || i.category === category) &&
        (!q ||
          i.body.toLowerCase().includes(q) ||
          (i.universities?.name ?? "").toLowerCase().includes(q)),
    );
    return sort === "helpful"
      ? [...rows].sort((a, b) => (b.helpful_count ?? 0) - (a.helpful_count ?? 0))
      : rows;
  }, [data, category, query, sort]);

  const onHelpful = (id: string) =>
    toggleHelpful.mutate(id, {
      onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Could not save your vote."),
    });

  const onReport = (id: string) => {
    const reason = window.prompt("Why are you reporting this insight? (e.g. abusive, false, spam)");
    if (!reason) return;
    report.mutate(
      { insight_id: id, reason },
      {
        onSuccess: () => toast.success("Thanks — our moderators will review it."),
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Could not send your report."),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-14 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Community — What students should know
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            Real experiences shared anonymously by current and former students: accommodation,
            transport, workload, cost of living, campus culture and practical tips. These are student
            perspectives, not official university information.
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search insights or a university…"
              className="flex-1 rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as "recent" | "helpful")}
              className="rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground"
              aria-label="Sort insights"
            >
              <option value="recent">Most recent</option>
              <option value="helpful">Most helpful</option>
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground"
            >
              <option value="All">All topics</option>
              {INSIGHT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground py-6">Loading community insights…</p>}

          {!isLoading && insights.length === 0 && (
            <div className="bg-glass rounded-xl p-5">
              <p className="text-sm text-muted-foreground">
                No student insights yet. Open any university profile and share your experience — it takes
                a minute and stays anonymous.
              </p>
              <Link
                to="/search?kind=university"
                className="inline-block mt-3 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Find your university
              </Link>
            </div>
          )}

          <div className="space-y-3">
            {insights.map((i) => (
              <article key={i.id} className="bg-glass rounded-xl p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="px-2 py-0.5 rounded-full bg-secondary">Student Insight</span>
                  <span>Anonymous — {i.student_status}</span>
                  <span className="ml-auto">{new Date(i.created_at).toLocaleDateString()}</span>
                </div>
                {i.universities && (
                  <Link
                    to={`/university/${i.universities.slug}`}
                    className="block text-sm font-medium text-foreground hover:text-primary"
                  >
                    {i.universities.name}
                  </Link>
                )}
                <p className="text-xs text-primary">{i.category}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {i.body.length > 300 ? `${i.body.slice(0, 300)}…` : i.body}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => onHelpful(i.id)}
                    disabled={toggleHelpful.isPending}
                    aria-pressed={myVotes?.has(i.id) ?? false}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      myVotes?.has(i.id)
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Helpful · {i.helpful_count ?? 0}
                  </button>
                  <button
                    onClick={() => onReport(i.id)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Report
                  </button>
                  {i.universities && (
                    <Link
                      to={`/university/${i.universities.slug}`}
                      className="ml-auto text-xs text-primary hover:underline"
                    >
                      Read more on the university profile
                    </Link>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Community;
