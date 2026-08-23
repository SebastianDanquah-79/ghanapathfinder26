import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandLogo from "@/components/BrandLogo";
import CommentThread from "@/components/CommentThread";
import PostInsightDialog, { type EditableInsight } from "@/components/PostInsightDialog";
import { useSignedCommunityImages } from "@/hooks/useCommunityImages";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useCommentCounts } from "@/hooks/useComments";
import {
  INSIGHT_CATEGORIES,
  useCommunityInsights,
  useMyHelpfulVotes,
  useDeleteMyInsight,
  useReportInsight,
  useRequestLogo,
  useToggleHelpful,
} from "@/hooks/useInsights";

const Community = () => {
  const { data, isLoading } = useCommunityInsights(60);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"recent" | "helpful">("recent");
  const [composerOpen, setComposerOpen] = useState(false);
  const [editing, setEditing] = useState<EditableInsight | null>(null);
  const { user } = useAuth();
  const [openThreads, setOpenThreads] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { data: myVotes } = useMyHelpfulVotes();
  const toggleHelpful = useToggleHelpful();
  const report = useReportInsight();
  const removeInsight = useDeleteMyInsight();
  const requestLogo = useRequestLogo();
  const { data: counts } = useCommentCounts((data ?? []).map((i) => i.id));
  const { data: imageUrls } = useSignedCommunityImages(
    (data ?? []).flatMap((i) => i.image_paths ?? []),
  );

  const toggleSet = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };
  const toggleThread = (id: string) => setOpenThreads((s) => toggleSet(s, id));
  const toggleExpanded = (id: string) => setExpanded((s) => toggleSet(s, id));


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

  const onEdit = (i: (typeof insights)[number]) => {
    setEditing({
      id: i.id,
      university_id: i.university_id,
      student_status: i.student_status,
      category: i.category,
      programme: i.programme,
      body: i.body,
      image_paths: i.image_paths ?? [],
    });
    setComposerOpen(true);
  };

  const onDelete = (i: (typeof insights)[number]) => {
    if (!window.confirm("Delete this post permanently? This cannot be undone.")) return;
    removeInsight.mutate(
      { id: i.id, imagePaths: i.image_paths ?? [] },
      {
        onSuccess: () => toast.success("Your post was deleted."),
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Could not delete your post."),
      },
    );
  };

  const onRequestLogo = (uni: { id: string; name: string }) => {
    if (!user) {
      toast.error("Sign in to request a logo.");
      return;
    }
    const suggested = window.prompt(
      `Know the official website for ${uni.name}? Paste it so we can add their logo (optional).`,
      "",
    );
    if (suggested === null) return;
    requestLogo.mutate(
      { university_id: uni.id, organisation_name: uni.name, suggested_url: suggested.trim() || null },
      {
        onSuccess: () => toast.success("Thanks — we'll add this logo soon."),
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Could not send your request."),
      },
    );
  };

  const closeComposer = () => {
    setComposerOpen(false);
    setEditing(null);
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

          <button
            onClick={() => {
              setEditing(null);
              setComposerOpen(true);
            }}
            className="w-full mb-4 flex items-center gap-3 rounded-2xl bg-glass px-4 py-3 text-left hover:bg-secondary transition-colors"
          >
            <span className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground grid place-items-center text-lg font-bold leading-none">
              +
            </span>
            <span className="text-sm text-muted-foreground">Share an experience with other students…</span>
          </button>

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

          <div className="space-y-4">
            {insights.map((i) => (
              <article key={i.id} className="bg-glass rounded-2xl p-4">
                <header className="flex items-start gap-3">
                  <BrandLogo
                    name={i.universities?.name ?? "Student"}
                    websiteUrl={i.universities?.website_url ?? null}
                    logoUrl={i.universities?.logo_url ?? null}
                    size={44}
                    className="rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    {i.universities ? (
                      <Link
                        to={`/university/${i.universities.slug}`}
                        className="block text-sm font-semibold text-foreground hover:text-primary truncate"
                      >
                        {i.universities.name}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-foreground">Student insight</p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Anonymous — {i.student_status} · {i.category} ·{" "}
                      {new Date(i.created_at).toLocaleDateString()}
                      {i.updated_at && i.updated_at !== i.created_at ? " · edited" : ""}
                    </p>
                    {i.universities && !i.universities.logo_url && !i.universities.website_url && (
                      <button
                        onClick={() =>
                          onRequestLogo({ id: i.universities!.id, name: i.universities!.name })
                        }
                        className="mt-1 text-[11px] font-medium text-primary hover:underline"
                      >
                        Logo missing — request it
                      </button>
                    )}
                  </div>
                  {user && i.user_id === user.id && (
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        onClick={() => onEdit(i)}
                        className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(i)}
                        disabled={removeInsight.isPending}
                        className="rounded-lg px-2 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </header>

                <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {expanded.has(i.id) || i.body.length <= 300
                    ? i.body
                    : `${i.body.slice(0, 300)}…`}
                  {i.body.length > 300 && (
                    <button
                      onClick={() => toggleExpanded(i.id)}
                      className="ml-1 text-xs font-medium text-primary hover:underline"
                    >
                      {expanded.has(i.id) ? "See less" : "See more"}
                    </button>
                  )}
                </p>

                {(i.image_paths ?? []).length > 0 && (
                  <div
                    className={`mt-3 grid gap-2 ${
                      (i.image_paths ?? []).length === 1 ? "grid-cols-1" : "grid-cols-2"
                    }`}
                  >
                    {(i.image_paths ?? []).map((path) => {
                      const url = imageUrls?.get(path);
                      if (!url) return null;
                      return (
                        <a
                          key={path}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block overflow-hidden rounded-xl bg-secondary"
                        >
                          <img
                            src={url}
                            alt="Student photo shared with this experience"
                            loading="lazy"
                            className="w-full max-h-80 object-cover"
                          />
                        </a>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px] text-muted-foreground">
                  <span>{i.helpful_count ?? 0} found this helpful</span>
                  <span>{counts?.get(i.id) ?? 0} comments</span>
                </div>

                <div className="mt-1 grid grid-cols-3 gap-1 border-t border-border pt-1">
                  <button
                    onClick={() => onHelpful(i.id)}
                    disabled={toggleHelpful.isPending}
                    aria-pressed={myVotes?.has(i.id) ?? false}
                    className={`rounded-lg py-2 text-xs font-medium transition-colors ${
                      myVotes?.has(i.id)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    Helpful
                  </button>
                  <button
                    onClick={() => toggleThread(i.id)}
                    className="rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
                  >
                    Comment
                  </button>
                  <button
                    onClick={() => onReport(i.id)}
                    className="rounded-lg py-2 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-destructive"
                  >
                    Report
                  </button>
                </div>

                <CommentThread insightId={i.id} open={openThreads.has(i.id)} />
              </article>
            ))}
          </div>

        </div>
      </main>

      <button
        onClick={() => {
          setEditing(null);
          setComposerOpen(true);
        }}
        aria-label="Add a post"
        className="fixed bottom-20 right-4 sm:bottom-8 sm:right-8 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground text-3xl font-bold leading-none shadow-lg hover:scale-105 transition-transform"
      >
        +
      </button>

      <PostInsightDialog open={composerOpen} onClose={closeComposer} editing={editing} />

      <Footer />
    </div>
  );
};

export default Community;
