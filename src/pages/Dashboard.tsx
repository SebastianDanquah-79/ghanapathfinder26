import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, CalendarClock, LogOut, Plus, Sparkles, Trash2 } from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmissionMatches } from "@/hooks/useAdmissionMatch";
import MotivationPanel from "@/components/MotivationPanel";
import ParentAccessCard from "@/components/ParentAccessCard";
import type { JourneyInput } from "@/lib/motivation";
import Navbar from "@/components/Navbar";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

/** Whole days between today (local midnight) and a stored ISO date. */
const daysUntil = (iso: string) => {
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return null;
  const a = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  const now = new Date();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((a - b) / 86_400_000);
};

const deadlineStatus = (iso: string) => {
  const d = daysUntil(iso);
  if (d === null) return { label: "Date unavailable", tone: "text-muted-foreground" };
  if (d === 0) return { label: "Due today", tone: "text-destructive" };
  if (d < 0) return { label: "Deadline passed", tone: "text-muted-foreground" };
  return { label: `${d} day${d === 1 ? "" : "s"} left`, tone: d <= 14 ? "text-destructive" : "text-foreground" };
};

const fullDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const savedPath = (type: string, key: string) => {
  switch (type) {
    case "university":
      return `/university/${key}`;
    case "programme":
      return `/programmes/${key}`;
    case "scholarship":
      return `/scholarships/${key}`;
    case "career":
      return `/careers/${key}`;
    case "skill":
      return `/skills/${key}`;
    case "internship":
      return `/internships/${key}`;
    default:
      return "/saved";
  }
};

const Card = ({
  title,
  action,
  children,
}: {
  title: string;
  action?: { to: string; label: string } | undefined;
  children: React.ReactNode;
}) => (
  <section className="bg-glass rounded-xl p-4 sm:p-5 min-w-0">
    <div className="flex items-baseline justify-between gap-3 mb-3">
      <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
      {action && (
        <Link to={action.to} className="text-xs font-medium text-primary shrink-0">
          {action.label}
        </Link>
      )}
    </div>
    {children}
  </section>
);

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [addingDeadline, setAddingDeadline] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

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
  const recent = useRecentlyViewed(4);

  const topMatches = matches
    .filter((m) => m.confidence != null && m.category !== "Not Eligible")
    .slice(0, 3);

  const savedBy = (type: string) => saved.filter((s) => s.item_type === type);

  const upcoming = useMemo(
    () =>
      deadlines
        .filter((d) => d.title?.trim() && d.due_date)
        .map((d) => ({ ...d, days: daysUntil(d.due_date) }))
        .sort((a, b) => (a.days ?? 9999) - (b.days ?? 9999))
        .filter((d) => (d.days ?? -1) >= 0)
        .slice(0, 3),
    [deadlines],
  );

  const journey: JourneyInput = {
    fullName: profile?.full_name ?? null,
    targetCareer: profile?.target_career ?? null,
    school: profile?.school ?? null,
    region: profile?.region ?? null,
    interests: profile?.interests ?? [],
    onboarded: profile?.onboarded ?? false,
    resultsCount: results.length,
    aggregate,
    savedUniversities: savedBy("university").length,
    savedScholarships: savedBy("scholarship").length,
    savedCareers: savedBy("career").length,
    deadlines: deadlines.length,
  };

  /** The 1–3 most relevant things this student should do next. */
  const nextSteps = useMemo(() => {
    const steps: { to: string; label: string; hint: string; cta: string }[] = [];
    if (!results.length)
      steps.push({
        to: "/onboarding",
        label: "Add your WASSCE results",
        hint: "Unlocks programme matching and realistic cut-off comparisons.",
        cta: "Add results",
      });
    if (!profile?.target_career)
      steps.push({
        to: "/careers",
        label: "Choose a target career",
        hint: "We use it to personalise programmes, skills and internships.",
        cta: "Pick a career",
      });
    if (savedBy("university").length < 3)
      steps.push({
        to: "/search?kind=university",
        label: "Build your university shortlist",
        hint: "Save at least three institutions so you can compare them.",
        cta: "Find universities",
      });
    if (!savedBy("scholarship").length)
      steps.push({
        to: "/scholarships",
        label: "Find funding you qualify for",
        hint: "Save scholarships now so deadlines don't pass unnoticed.",
        cta: "Browse scholarships",
      });
    if (savedBy("university").length >= 2)
      steps.push({
        to: "/compare",
        label: "Compare your shortlisted universities",
        hint: "See fees, location and programmes side by side.",
        cta: "Compare",
      });
    steps.push({
      to: "/admission-match",
      label: "Continue your career roadmap",
      hint: "Review the programmes your aggregate actually reaches.",
      cta: "Open matches",
    });
    return steps.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.length, profile?.target_career, saved]);

  const addDeadline = async () => {
    if (!deadlineTitle.trim() || !deadlineDate || !user) {
      toast.error("Add a title and a date first.");
      return;
    }
    setAddingDeadline(true);
    const { error } = await supabase
      .from("deadlines")
      .insert({ user_id: user.id, title: deadlineTitle.trim(), due_date: deadlineDate });
    setAddingDeadline(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setDeadlineTitle("");
    setDeadlineDate("");
    qc.invalidateQueries({ queryKey: ["deadlines"] });
  };

  const removeSaved = async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["saved_items"] });
  };

  const input =
    "w-full min-w-0 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50";

  const topSaved = saved.slice(0, 4);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden pt-20 pb-24 md:pb-12">
      <Navbar />
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1 + 2 , header and greeting */}
        <header className="flex items-start justify-between gap-3 mb-5">
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground break-words">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {aggregate != null
                ? `WASSCE aggregate ${aggregate} · ${results.length} subjects recorded`
                : "Add your results to unlock personalised matches."}
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* 3 , Your next steps */}
          <div className="md:col-span-2 lg:col-span-2">
            <Card title="Your next steps">
              <ul className="space-y-2.5">
                {nextSteps.map((s) => (
                  <li
                    key={s.to + s.label}
                    className="flex flex-col gap-2 rounded-lg border border-border/60 bg-secondary/40 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground break-words">{s.label}</p>
                      <p className="text-xs text-muted-foreground break-words">{s.hint}</p>
                    </div>
                    <Link
                      to={s.to}
                      className="shrink-0 inline-flex items-center justify-center min-h-[40px] px-3.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      {s.cta}
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* WASSCE snapshot */}
          <section className="bg-glass rounded-xl p-4 sm:p-5 min-w-0 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">WASSCE aggregate</p>
              <p className="font-display text-4xl font-bold text-foreground leading-tight">
                {aggregate ?? "—"}
              </p>
            </div>
            <Link
              to="/onboarding"
              className="shrink-0 inline-flex items-center min-h-[44px] px-4 rounded-xl bg-secondary text-sm font-semibold text-foreground"
            >
              {results.length ? "Edit" : "Add results"}
            </Link>
          </section>

          {/* 4 , Upcoming deadlines */}
          <Card title="Upcoming deadlines" action={{ to: "/applications", label: "All deadlines" }}>
            {upcoming.length ? (
              <ul className="space-y-2">
                {upcoming.map((d) => {
                  const status = deadlineStatus(d.due_date);
                  return (
                    <li key={d.id} className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                      <p className="text-sm font-medium text-foreground break-words">{d.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fullDate(d.due_date)}
                        {d.category ? ` · ${d.category}` : ""}
                      </p>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className={`text-xs font-medium ${status.tone}`}>{status.label}</span>
                        <Link to="/applications" className="text-xs font-medium text-primary">
                          View
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
            )}

            <div className="mt-3 space-y-2">
              <input
                className={input}
                placeholder="e.g. UG undergraduate application"
                maxLength={120}
                value={deadlineTitle}
                onChange={(e) => setDeadlineTitle(e.target.value)}
                aria-label="Deadline name"
              />
              <div className="flex gap-2 min-w-0">
                <input
                  type="date"
                  className={input}
                  value={deadlineDate}
                  onChange={(e) => setDeadlineDate(e.target.value)}
                  aria-label="Deadline date"
                />
                <button
                  onClick={addDeadline}
                  disabled={addingDeadline}
                  className="shrink-0 px-4 min-h-[44px] rounded-xl bg-primary text-primary-foreground disabled:opacity-50"
                  aria-label="Add deadline"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Card>

          {/* 5 , Saved opportunities */}
          <Card title="Saved opportunities" action={{ to: "/saved", label: "View all saved" }}>
            {topSaved.length ? (
              <ul className="space-y-2">
                {topSaved.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-secondary/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm text-foreground break-words">{s.title}</p>
                      <p className="text-xs text-muted-foreground break-words capitalize">
                        {s.item_type}
                        {s.subtitle ? ` · ${s.subtitle}` : ""}
                      </p>
                      <Link
                        to={savedPath(s.item_type, s.item_key)}
                        className="text-xs font-medium text-primary mt-1 inline-block"
                      >
                        View
                      </Link>
                    </div>
                    <button
                      onClick={() => removeSaved(s.id)}
                      className="shrink-0 min-h-[44px] min-w-[44px] grid place-items-center text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${s.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing saved yet. Save universities, programmes and scholarships to keep them here.
              </p>
            )}
            {saved.length > topSaved.length && (
              <p className="mt-2 text-xs text-muted-foreground">
                {saved.length - topSaved.length} more saved
              </p>
            )}
          </Card>

          {/* 6 , Recommended for you */}
          <Card title="Recommended for you" action={{ to: "/admission-match", label: "See all" }}>
            {topMatches.length ? (
              <ul className="space-y-2">
                {topMatches.map((m) => (
                  <li key={m.cutoff.id} className="rounded-lg border border-border/60 bg-secondary/40 p-3">
                    <p className="text-sm font-medium text-foreground break-words">
                      {m.cutoff.programme_name}
                    </p>
                    <p className="text-xs text-muted-foreground break-words mt-0.5">
                      {m.cutoff.universities?.short_name} · cut-off {m.cutoff.cut_off_aggregate}
                    </p>
                    <p className="text-xs text-primary mt-1">{m.category}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add your WASSCE results to see the programmes your aggregate actually reaches.
              </p>
            )}
          </Card>

          {/* 7 , Career progress */}
          <div className="md:col-span-2 lg:col-span-3 min-w-0">
            <MotivationPanel data={journey} />
          </div>

          {/* 8 , Recently viewed */}
          {recent.length > 0 && (
            <div className="md:col-span-2 lg:col-span-2">
              <Card title="Recently viewed">
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recent.map((r) => (
                    <li key={r.path}>
                      <Link
                        to={r.path}
                        className="block rounded-lg border border-border/60 bg-secondary/40 p-3 hover:border-primary/50"
                      >
                        <p className="text-sm text-foreground break-words">{r.title}</p>
                        <p className="text-xs text-muted-foreground break-words capitalize">
                          {r.kind}
                          {r.subtitle ? ` · ${r.subtitle}` : ""}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          <div className="min-w-0">
            <Card title="Your profile" action={{ to: "/onboarding", label: "Update" }}>
              <dl className="text-sm space-y-2 text-muted-foreground">
                <div className="flex justify-between gap-3">
                  <dt>Target career</dt>
                  <dd className="text-foreground text-right break-words">{profile?.target_career ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>School</dt>
                  <dd className="text-foreground text-right break-words">{profile?.school ?? "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Region</dt>
                  <dd className="text-foreground text-right break-words">{profile?.region ?? "—"}</dd>
                </div>
              </dl>
            </Card>
          </div>

          <div className="min-w-0">
            <Card title="Quick links">
              <div className="flex flex-wrap gap-2">
                {[
                  { to: "/admission-match", label: "Matches", icon: Sparkles },
                  { to: "/scholarships", label: "Scholarships", icon: Bookmark },
                  { to: "/applications", label: "Applications", icon: CalendarClock },
                  { to: "/community", label: "Community", icon: Bookmark },
                  { to: "/programmes", label: "Programmes", icon: Sparkles },
                  { to: "/internships", label: "Internships", icon: CalendarClock },
                ].map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="inline-flex items-center gap-2 min-h-[44px] px-3 rounded-lg bg-secondary text-sm text-foreground"
                  >
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </Link>
                ))}
              </div>
            </Card>
          </div>

          <div className="min-w-0">
            <ParentAccessCard />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
