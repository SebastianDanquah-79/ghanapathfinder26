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
import DiscoveryDashboard from "@/components/DiscoveryDashboard";

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
    case "university": return `/university/${key}`;
    case "programme": return `/programmes/${key}`;
    case "scholarship": return `/scholarships/${key}`;
    case "career": return `/careers/${key}`;
    case "skill": return `/skills/${key}`;
    case "internship": return `/internships/${key}`;
    default: return "/saved";
  }
};

const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [addingDeadline, setAddingDeadline] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true });
    }
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

  useEffect(() => {
    if (!profile) return;
    const destination =
      profile.account_role === "employer" ? "/dashboard/employer" :
      profile.account_role === "employee" ? "/dashboard/employee" :
      profile.account_role === "startup_founder" ? "/dashboard/founder" : null;
    if (destination) navigate(destination, { replace: true });
  }, [profile, navigate]);

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
      const { data, error } = await supabase.from("saved_items").select("*").order("created_at", { ascending: false });
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
    () => deadlines
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

  const nextSteps = useMemo(() => {
    const steps: { to: string; label: string; hint: string; cta: string }[] = [];
    if (!results.length) steps.push({ to: "/onboarding", label: "Add your WASSCE results", hint: "Unlock programme matching and realistic cut-off comparisons.", cta: "Add results" });
    if (!profile?.target_career) steps.push({ to: "/careers", label: "Choose a target career", hint: "Use it to personalise programmes, skills and internships.", cta: "Pick a career" });
    if (savedBy("university").length < 3) steps.push({ to: "/search?kind=university", label: "Build your university shortlist", hint: "Save institutions so you can compare them.", cta: "Find universities" });
    if (!savedBy("scholarship").length) steps.push({ to: "/scholarships", label: "Find funding you qualify for", hint: "Save scholarships so deadlines do not pass unnoticed.", cta: "Browse scholarships" });
    if (savedBy("university").length >= 2) steps.push({ to: "/compare", label: "Compare your shortlisted universities", hint: "See your options side by side.", cta: "Compare" });
    steps.push({ to: "/admission-match", label: "Continue your career roadmap", hint: "Review the programmes your aggregate can reach.", cta: "Open matches" });
    return steps.slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results.length, profile?.target_career, saved]);

  const addDeadline = async () => {
    if (!deadlineTitle.trim() || !deadlineDate || !user) {
      toast.error("Add a title and a date first.");
      return;
    }
    setAddingDeadline(true);
    const { error } = await supabase.from("deadlines").insert({ user_id: user.id, title: deadlineTitle.trim(), due_date: deadlineDate });
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
    const { error } = await supabase.from("saved_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["saved_items"] });
  };

  const input = "w-full min-w-0 px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50";
  const topSaved = saved.slice(0, 4);

  if (loading) {
    return <div className="min-h-screen bg-background grid place-items-center text-sm text-muted-foreground">Loading your dashboard…</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-background overflow-x-hidden pt-16 pb-20 md:pb-8">
      <Navbar />

      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 px-3 sm:px-5 lg:grid-cols-[220px_minmax(0,680px)_280px] lg:items-start lg:px-6">
        <aside className="hidden lg:block sticky top-20 space-y-2">
          <div className="border border-border bg-background p-3">
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Your space</p>
            {[
              ["/dashboard", "Home"],
              ["/my-path", "My Path"],
              ["/admission-match", "Matches"],
              ["/scholarships", "Scholarships"],
              ["/applications", "Applications"],
              ["/community", "Community"],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="flex min-h-10 items-center px-2 text-sm font-medium text-foreground hover:bg-secondary">
                {label}
              </Link>
            ))}
          </div>
          <div className="border border-border bg-background p-3">
            <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Discover</p>
            {[
              ["/universities", "Universities"],
              ["/programmes", "Programmes"],
              ["/careers", "Careers"],
              ["/internships", "Internships"],
              ["/news", "News"],
              ["/startups", "Startups"],
            ].map(([to, label]) => (
              <Link key={to} to={to} className="flex min-h-10 items-center px-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
                {label}
              </Link>
            ))}
          </div>
        </aside>

        <main className="min-w-0 space-y-3">
          <header className="border border-border bg-background p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Home</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                  Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {aggregate != null ? `WASSCE aggregate ${aggregate} · ${results.length} subjects recorded` : "Complete your profile to personalise this feed."}
                </p>
              </div>
              <button onClick={async () => { await signOut(); navigate("/"); }} className="shrink-0 inline-flex min-h-10 items-center gap-2 border border-border px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
                <LogOut className="h-4 w-4" /><span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          </header>

          <section className="border border-border bg-background p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                {(profile?.full_name?.[0] ?? "G").toUpperCase()}
              </div>
              <Link to="/my-path" className="flex min-h-10 flex-1 items-center border border-border bg-secondary px-4 text-sm text-muted-foreground hover:text-foreground">
                What are you working towards next?
              </Link>
            </div>
            <div className="mt-3 grid grid-cols-3 border-t border-border pt-3 text-center text-xs text-muted-foreground">
              <Link to="/onboarding" className="py-2 hover:bg-secondary">Update results</Link>
              <Link to="/careers" className="border-x border-border py-2 hover:bg-secondary">Explore careers</Link>
              <Link to="/scholarships" className="py-2 hover:bg-secondary">Find funding</Link>
            </div>
          </section>

          <article className="border border-border bg-background">
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">For you</p>
                  <h2 className="mt-1 text-lg font-semibold">Your next moves</h2>
                </div>
                <Link to="/my-path" className="text-xs font-semibold text-primary">Open path</Link>
              </div>
              <div className="mt-4 space-y-2">
                {nextSteps.map((s) => (
                  <Link key={s.to + s.label} to={s.to} className="group flex items-center gap-3 border border-border p-3 hover:border-primary/50 hover:bg-secondary/40">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{s.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary">{s.cta}</span>
                  </Link>
                ))}
              </div>
            </div>
          </article>

          <article className="border border-border bg-background">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your progress</p>
                  <h2 className="mt-1 text-lg font-semibold">Career roadmap</h2>
                </div>
                <Link to="/my-path" className="text-xs font-semibold text-primary">View</Link>
              </div>
              <div className="mt-4"><MotivationPanel data={journey} /></div>
            </div>
          </article>

          <DiscoveryDashboard />

          {topMatches.length > 0 && (
            <article className="border border-border bg-background">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Based on your results</p>
                    <h2 className="mt-1 text-lg font-semibold">Programme matches</h2>
                  </div>
                  <Link to="/admission-match" className="text-xs font-semibold text-primary">See all</Link>
                </div>
                <div className="mt-4 space-y-2">
                  {topMatches.map((m) => (
                    <Link key={m.cutoff.id} to="/admission-match" className="block border border-border p-3 hover:bg-secondary/40">
                      <p className="text-sm font-semibold text-foreground">{m.cutoff.programme_name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{m.cutoff.universities?.short_name} · cut-off {m.cutoff.cut_off_aggregate}</p>
                      <p className="mt-1 text-xs text-primary">{m.category}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          )}

          <article className="border border-border bg-background">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Saved</p>
                  <h2 className="mt-1 text-lg font-semibold">Your saved opportunities</h2>
                </div>
                <Link to="/saved" className="text-xs font-semibold text-primary">View all</Link>
              </div>
              {topSaved.length ? (
                <div className="mt-4 space-y-2">
                  {topSaved.map((s) => (
                    <div key={s.id} className="flex items-start gap-3 border border-border p-3">
                      <Bookmark className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{s.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground capitalize">{s.item_type}{s.subtitle ? ` · ${s.subtitle}` : ""}</p>
                        <Link to={savedPath(s.item_type, s.item_key)} className="mt-1 inline-block text-xs font-semibold text-primary">View</Link>
                      </div>
                      <button onClick={() => removeSaved(s.id)} className="grid min-h-10 min-w-10 place-items-center text-muted-foreground hover:text-destructive" aria-label={`Remove ${s.title}`}>
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Save universities, programmes, scholarships and careers to build your personal feed.</p>
              )}
            </div>
          </article>

          <article className="border border-border bg-background">
            <div className="p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Deadlines</p>
                  <h2 className="mt-1 text-lg font-semibold">Keep moving</h2>
                </div>
                <Link to="/applications" className="text-xs font-semibold text-primary">All</Link>
              </div>
              {upcoming.length ? (
                <div className="mt-4 space-y-2">
                  {upcoming.map((d) => {
                    const status = deadlineStatus(d.due_date);
                    return (
                      <div key={d.id} className="border border-border p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium">{d.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{fullDate(d.due_date)}{d.category ? ` · ${d.category}` : ""}</p>
                          </div>
                          <span className={`text-xs font-semibold ${status.tone}`}>{status.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">No upcoming deadlines.</p>
              )}
              <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                <input className={input} placeholder="Deadline title" maxLength={120} value={deadlineTitle} onChange={(e) => setDeadlineTitle(e.target.value)} aria-label="Deadline name" />
                <input type="date" className={input + " min-w-0"} value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} aria-label="Deadline date" />
              </div>
              <button onClick={addDeadline} disabled={addingDeadline} className="mt-2 inline-flex min-h-10 items-center gap-2 bg-primary px-4 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                <Plus className="h-4 w-4" /> Add deadline
              </button>
            </div>
          </article>

          {recent.length > 0 && (
            <article className="border border-border bg-background p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Recently viewed</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {recent.map((r) => (
                  <Link key={r.path} to={r.path} className="border border-border p-3 hover:bg-secondary/40">
                    <p className="text-sm font-medium">{r.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground capitalize">{r.kind}{r.subtitle ? ` · ${r.subtitle}` : ""}</p>
                  </Link>
                ))}
              </div>
            </article>
          )}
        </main>

        <aside className="hidden lg:block sticky top-20 space-y-3">
          <section className="border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Snapshot</p>
            <p className="mt-1 text-4xl font-bold">{aggregate ?? "—"}</p>
            <p className="text-xs text-muted-foreground">WASSCE aggregate</p>
            <Link to="/onboarding" className="mt-3 inline-flex w-full items-center justify-center border border-border py-2 text-xs font-semibold hover:bg-secondary">
              {results.length ? "Edit results" : "Add results"}
            </Link>
          </section>

          <section className="border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Profile</p>
            <dl className="mt-3 space-y-3 text-xs">
              <div><dt className="text-muted-foreground">Target career</dt><dd className="mt-1 font-medium text-foreground">{profile?.target_career ?? "Not set"}</dd></div>
              <div><dt className="text-muted-foreground">School</dt><dd className="mt-1 font-medium text-foreground">{profile?.school ?? "Not set"}</dd></div>
              <div><dt className="text-muted-foreground">Region</dt><dd className="mt-1 font-medium text-foreground">{profile?.region ?? "Not set"}</dd></div>
            </dl>
            <Link to="/onboarding" className="mt-3 inline-flex text-xs font-semibold text-primary">Update profile</Link>
          </section>

          <ParentAccessCard />

          <section className="border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Quick links</p>
            <div className="mt-2 space-y-1">
              {[
                ["/admission-match", "Matches"],
                ["/scholarships", "Scholarships"],
                ["/applications", "Applications"],
                ["/programmes", "Programmes"],
                ["/internships", "Internships"],
              ].map(([to, label]) => (
                <Link key={to} to={to} className="block px-2 py-2 text-sm hover:bg-secondary">{label}</Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
