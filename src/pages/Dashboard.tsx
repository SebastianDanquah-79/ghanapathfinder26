import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Bookmark,
  CalendarClock,
  LogOut,
  Plus,
  Sparkles,
  Trash2,
} from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmissionMatches } from "@/hooks/useAdmissionMatch";
import { buildMilestones, getNextStep, type JourneyInput } from "@/lib/motivation";
import { listRecentlyViewed, type RecentItem } from "@/lib/recentlyViewed";
import Navbar from "@/components/Navbar";

const ParentAccessCard = lazy(() => import("@/components/ParentAccessCard"));

/* ---------------- shared presentational bits ---------------- */

const Card = ({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: { to: string; label: string };
  children: React.ReactNode;
}) => (
  <section className="bg-glass rounded-2xl p-4 sm:p-5 min-w-0">
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 mb-3">
      <h2 className="flex min-w-0 items-center gap-2 font-display text-base font-semibold text-foreground">
        {icon}
        <span className="truncate">{title}</span>
      </h2>
      {action && (
        <Link
          to={action.to}
          className="shrink-0 text-xs font-medium text-primary hover:underline"
        >
          {action.label}
        </Link>
      )}
    </div>
    {children}
  </section>
);

const Empty = ({ text, to, cta }: { text: string; to: string; cta: string }) => (
  <div className="rounded-xl border border-dashed border-border px-4 py-5 text-center">
    <p className="text-sm text-muted-foreground">{text}</p>
    <Link
      to={to}
      className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary min-h-[40px]"
    >
      {cta} <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  </div>
);

/* ---------------- deadline date logic ---------------- */

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const daysLeft = (iso: string) =>
  Math.round((startOfDay(new Date(iso)) - startOfDay(new Date())) / 86_400_000);

const deadlineStatus = (iso: string) => {
  const days = daysLeft(iso);
  if (days < 0) return { label: "Deadline passed", tone: "text-muted-foreground", days };
  if (days === 0) return { label: "Due today", tone: "text-destructive", days };
  if (days <= 14) return { label: `${days} days left`, tone: "text-destructive", days };
  return { label: `${days} days left`, tone: "text-foreground", days };
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/* ---------------- page ---------------- */

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [addingDeadline, setAddingDeadline] = useState(false);
  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    setRecent(listRecentlyViewed());
  }, []);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: results = [] } = useQuery({
    queryKey: ["results", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("wassce_results").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: saved = [] } = useQuery({
    queryKey: ["saved_items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_items")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: deadlines = [] } = useQuery({
    queryKey: ["deadlines", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("deadlines").select("*").order("due_date");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { matches, breakdown } = useAdmissionMatches();
  const aggregate = breakdown.aggregate;

  const topMatches = matches
    .filter((m) => m.confidence != null && m.category !== "Not Eligible")
    .slice(0, 3);

  const journey: JourneyInput = {
    fullName: profile?.full_name ?? null,
    targetCareer: profile?.target_career ?? null,
    school: profile?.school ?? null,
    region: profile?.region ?? null,
    interests: profile?.interests ?? [],
    onboarded: profile?.onboarded ?? false,
    resultsCount: results.length,
    aggregate,
    savedUniversities: saved.filter((s) => s.item_type === "university").length,
    savedScholarships: saved.filter((s) => s.item_type === "scholarship").length,
    savedCareers: saved.filter((s) => s.item_type === "career").length,
    deadlines: deadlines.length,
  };

  const milestones = useMemo(() => buildMilestones(journey), [journey]);
  const doneCount = milestones.filter((m) => m.done).length;
  const percent = Math.round((doneCount / milestones.length) * 100);
  const primaryStep = useMemo(() => getNextStep(journey, milestones), [journey, milestones]);

  const upcoming = deadlines.filter((d) => daysLeft(d.due_date) >= 0).slice(0, 4);

  const nextSteps = [
    { title: primaryStep.title, hint: primaryStep.body, to: primaryStep.href, cta: primaryStep.cta },
    ...milestones.filter((m) => !m.done).slice(0, 3).map((m) => ({
      title: m.label,
      hint: m.hint,
      to: m.href,
      cta: "Continue",
    })),
  ]
    .filter((s, i, arr) => arr.findIndex((x) => x.title === s.title) === i)
    .slice(0, 3);

  const savedPreview = saved.slice(0, 4);

  const addDeadline = async () => {
    if (!deadlineTitle.trim() || !deadlineDate || !user) return;
    const { error } = await supabase
      .from("deadlines")
      .insert({ user_id: user.id, title: deadlineTitle.trim(), due_date: deadlineDate });
    if (error) {
      toast.error(error.message);
      return;
    }
    setDeadlineTitle("");
    setDeadlineDate("");
    setAddingDeadline(false);
    qc.invalidateQueries({ queryKey: ["deadlines"] });
  };

  const removeSaved = async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["saved_items"] });
  };

  const input =
    "w-full min-h-[44px] px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50";

  const savedHref = (s: { item_type: string; item_key: string | null }) => {
    const key = s.item_key;
    if (!key) return "/saved";
    if (s.item_type === "university") return `/university/${key}`;
    if (s.item_type === "programme") return `/programme/${key}`;
    if (s.item_type === "scholarship") return `/scholarships/${key}`;
    if (s.item_type === "career") return `/careers/${key}`;
    if (s.item_type === "skill") return `/skills/${key}`;
    return "/saved";
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 pt-20 pb-28 md:pb-16">
        {/* Header + greeting */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 mb-5">
          <div className="min-w-0">
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground truncate">
              Hi{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : " there"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {aggregate != null
                ? `WASSCE aggregate ${aggregate} · ${results.length} subjects`
                : "Add your WASSCE results to unlock matches"}
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Sign out</span>
            <span className="sr-only sm:hidden">Sign out</span>
          </button>
        </header>

        <div className="grid gap-4 lg:grid-cols-3 lg:items-start">
          <div className="grid gap-4 min-w-0 lg:col-span-2">
            {/* Your next steps */}
            <Card title="Your next steps" icon={<Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />}>
              <ul className="grid gap-2">
                {nextSteps.map((s) => (
                  <li
                    key={s.title}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground break-words">{s.title}</p>
                      {s.hint && (
                        <p className="text-xs text-muted-foreground line-clamp-2 break-words">{s.hint}</p>
                      )}
                    </div>
                    <Link
                      to={s.to}
                      className="shrink-0 inline-flex items-center min-h-[40px] px-3 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      {s.cta ?? "Continue"}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Deadlines */}
            <Card
              title="Upcoming deadlines"
              icon={<CalendarClock className="h-4 w-4 text-primary" aria-hidden="true" />}
              action={{ to: "/applications", label: "Track all" }}
            >
              {upcoming.length ? (
                <ul className="grid gap-2">
                  {upcoming.map((d) => {
                    const status = deadlineStatus(d.due_date);
                    return (
                      <li
                        key={d.id}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground break-words">{d.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(d.due_date)} ·{" "}
                            <span className={status.tone}>{status.label}</span>
                          </p>
                        </div>
                        <Link
                          to="/applications"
                          className="shrink-0 inline-flex items-center min-h-[40px] px-3 rounded-lg border border-border text-xs font-medium text-foreground"
                        >
                          View
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-border px-4 py-5 text-center text-sm text-muted-foreground">
                  No upcoming deadlines
                </p>
              )}

              {addingDeadline ? (
                <div className="mt-3 grid gap-2">
                  <label className="sr-only" htmlFor="dl-title">
                    Deadline name
                  </label>
                  <input
                    id="dl-title"
                    className={input}
                    placeholder="e.g. KNUST application closes"
                    maxLength={120}
                    value={deadlineTitle}
                    onChange={(e) => setDeadlineTitle(e.target.value)}
                  />
                  <label className="sr-only" htmlFor="dl-date">
                    Deadline date
                  </label>
                  <input
                    id="dl-date"
                    type="date"
                    className={input}
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addDeadline}
                      disabled={!deadlineTitle.trim() || !deadlineDate}
                      className="flex-1 min-h-[44px] rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                    >
                      Save deadline
                    </button>
                    <button
                      onClick={() => setAddingDeadline(false)}
                      className="min-h-[44px] px-3 rounded-lg border border-border text-sm text-muted-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingDeadline(true)}
                  className="mt-3 inline-flex items-center gap-1.5 min-h-[44px] text-sm font-medium text-primary"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" /> Add a deadline
                </button>
              )}
            </Card>

            {/* Saved opportunities */}
            <Card
              title="Saved opportunities"
              icon={<Bookmark className="h-4 w-4 text-primary" aria-hidden="true" />}
              action={saved.length ? { to: "/saved", label: "View all saved" } : undefined}
            >
              {savedPreview.length ? (
                <ul className="grid gap-2 sm:grid-cols-2">
                  {savedPreview.map((s) => (
                    <li
                      key={s.id}
                      className="rounded-xl border border-border/60 bg-secondary/40 p-3 min-w-0"
                    >
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.item_type}</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground break-words line-clamp-2">
                        {s.title}
                      </p>
                      {s.subtitle && (
                        <p className="text-xs text-muted-foreground break-words line-clamp-1">{s.subtitle}</p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <Link
                          to={savedHref(s)}
                          className="inline-flex items-center min-h-[36px] px-3 rounded-lg border border-border text-xs font-medium text-foreground"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => removeSaved(s.id)}
                          className="inline-flex items-center gap-1 min-h-[36px] px-3 rounded-lg text-xs text-muted-foreground hover:text-destructive"
                          aria-label={`Remove ${s.title} from saved`}
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty
                  text="Nothing saved yet."
                  to="/scholarships"
                  cta="Explore scholarships"
                />
              )}
            </Card>

            {/* Recommended for you */}
            <Card
              title="Recommended for you"
              icon={<Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />}
              action={{ to: "/admission-match", label: "See all" }}
            >
              {topMatches.length ? (
                <ul className="grid gap-2">
                  {topMatches.map((m) => (
                    <li
                      key={m.cutoff.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border/60 bg-secondary/40 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground break-words line-clamp-2">
                          {m.cutoff.programme_name}
                        </p>
                        <p className="text-xs text-muted-foreground break-words">
                          {m.cutoff.universities?.short_name ?? "Ghana"} · cut-off {m.cutoff.cut_off_aggregate} ·{" "}
                          <span className="text-primary">{m.category}</span>
                        </p>
                      </div>
                      <Link
                        to="/admission-match"
                        className="shrink-0 inline-flex items-center min-h-[40px] px-3 rounded-lg border border-border text-xs font-medium text-foreground"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty
                  text="Add your WASSCE results to see programmes your aggregate reaches."
                  to="/onboarding"
                  cta="Add results"
                />
              )}
            </Card>
          </div>

          {/* Secondary column */}
          <div className="grid gap-4 min-w-0">
            {/* Career-path progress */}
            <Card title="Career-path progress" action={{ to: "/onboarding", label: "Update" }}>
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm text-muted-foreground truncate">
                  {profile?.target_career ?? "No career goal yet"}
                </p>
                <p className="text-sm font-semibold text-foreground shrink-0">{percent}%</p>
              </div>
              <div
                className="h-2 w-full rounded-full bg-secondary overflow-hidden"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Career path progress"
              >
                <div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {doneCount} of {milestones.length} milestones complete
              </p>
              <Link
                to="/careers"
                className="mt-3 inline-flex items-center gap-1 min-h-[40px] text-sm font-medium text-primary"
              >
                Continue your career path <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Card>

            {/* Recently viewed */}
            <Card title="Recently viewed">
              {recent.length ? (
                <ul className="grid gap-2">
                  {recent.slice(0, 5).map((r) => (
                    <li key={`${r.type}-${r.id}`} className="min-w-0">
                      <Link
                        to={r.href}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-border/60 bg-secondary/40 p-3 min-h-[44px]"
                      >
                        <span className="min-w-0">
                          <span className="block text-sm text-foreground truncate">{r.title}</span>
                          <span className="block text-xs text-muted-foreground capitalize">{r.type}</span>
                        </span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty text="Nothing viewed yet." to="/programmes" cta="Browse programmes" />
              )}
            </Card>

            <Suspense fallback={null}>
              <ParentAccessCard />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
