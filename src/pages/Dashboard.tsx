import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, CalendarClock, GraduationCap, LogOut, Plus, Sparkles, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmissionMatches } from "@/hooks/useAdmissionMatch";
import MotivationPanel from "@/components/MotivationPanel";
import ParentAccessCard from "@/components/ParentAccessCard";
import { celebrate } from "@/lib/celebrate";
import type { JourneyInput } from "@/lib/motivation";
import Navbar from "@/components/Navbar";


const Dashboard = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [task, setTask] = useState("");
  const [deadlineTitle, setDeadlineTitle] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");

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
      const { data, error } = await supabase.from("saved_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: checklist = [] } = useQuery({
    queryKey: ["checklist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("application_checklist").select("*").order("created_at");
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
    .slice(0, 5);

  const savedBy = (type: string) => saved.filter((s) => s.item_type === type);

  const addTask = async () => {
    if (!task.trim() || !user) return;
    const { error } = await supabase.from("application_checklist").insert({ user_id: user.id, task: task.trim() });
    if (error) return toast.error(error.message);
    setTask("");
    qc.invalidateQueries({ queryKey: ["checklist"] });
  };

  const toggleTask = async (id: string, done: boolean) => {
    await supabase.from("application_checklist").update({ done: !done }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["checklist"] });
    if (!done) {
      const completed = checklist.filter((c) => c.done).length + 1;
      celebrate(
        completed === checklist.length ? "Checklist complete" : "Task done",
        completed === checklist.length
          ? "Every task ticked off. That is real preparation."
          : `${completed} of ${checklist.length} tasks done — momentum is building.`,
      );
    }
  };

  const removeTask = async (id: string) => {
    await supabase.from("application_checklist").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["checklist"] });
  };

  const journey: JourneyInput = {
    fullName: profile?.full_name,
    targetCareer: profile?.target_career,
    school: profile?.school,
    region: profile?.region,
    interests: profile?.interests ?? [],
    onboarded: profile?.onboarded,
    resultsCount: results.length,
    aggregate,
    savedUniversities: saved.filter((s) => s.item_type === "university").length,
    savedScholarships: saved.filter((s) => s.item_type === "scholarship").length,
    savedCareers: saved.filter((s) => s.item_type === "career").length,
    checklistTotal: checklist.length,
    checklistDone: checklist.filter((c) => c.done).length,
    deadlines: deadlines.length,
  };

  const addDeadline = async () => {
    if (!deadlineTitle.trim() || !deadlineDate || !user) return;
    const { error } = await supabase
      .from("deadlines")
      .insert({ user_id: user.id, title: deadlineTitle.trim(), due_date: deadlineDate });
    if (error) return toast.error(error.message);
    setDeadlineTitle("");
    setDeadlineDate("");
    qc.invalidateQueries({ queryKey: ["deadlines"] });
  };

  const removeSaved = async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["saved_items"] });
  };

  const daysLeft = (d: string) =>
    Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const card = "bg-glass rounded-xl p-5 lg:p-5";
  const input =
    "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50";

  const quickActions = [
    { to: "/admission-match", label: "Recommendations", icon: Sparkles },
    { to: "/search?kind=university", label: "Universities", icon: GraduationCap },
    { to: "/scholarships", label: "Scholarships", icon: GraduationCap },
    { to: "/saved", label: "Saved", icon: Bookmark },
    { to: "/onboarding", label: "My profile", icon: Users },
    { to: "/applications", label: "Applications", icon: CalendarClock },
  ];

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="text-sm lg:text-base text-muted-foreground mt-2 max-w-2xl">
              Your WASSCE profile, matches, saved schools and deadlines.
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              navigate("/");
            }}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </header>

        {/* WASSCE snapshot — the number students care about most */}
        <div className="bg-glass rounded-xl p-5 lg:p-5 mb-5 lg:mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">WASSCE aggregate</p>
              <p className="font-display text-3xl lg:text-5xl font-bold text-foreground leading-tight">
                {aggregate ?? "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {results.length ? `${results.length} subjects recorded` : "Add your results to unlock matches"}
              </p>
            </div>
            <Link
              to="/onboarding"
              className="shrink-0 inline-flex items-center min-h-[48px] px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              {results.length ? "Edit results" : "Add results"}
            </Link>
          </div>
        </div>

        {/* Primary actions, thumb-reachable on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-6 lg:mb-6">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Link
              key={label}
              to={to}
              className="bg-glass bg-glass-hover card-hover rounded-xl p-3 lg:p-4 min-h-[76px] lg:min-h-[92px] flex flex-col justify-center gap-1.5 lg:gap-2 active:opacity-80"
            >
              <Icon className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              <span className="text-xs lg:text-sm font-medium text-foreground leading-tight">{label}</span>
            </Link>
          ))}
        </div>

        {/* Saved shortcuts */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { type: "university", label: "Universities" },
            { type: "programme", label: "Programmes" },
            { type: "scholarship", label: "Scholarships" },
          ].map(({ type, label }) => (
            <Link
              key={type}
              to="/saved"
              className="inline-flex items-center gap-2 min-h-[44px] px-3.5 rounded-xl bg-glass bg-glass-hover text-sm text-foreground"
            >
              <Bookmark className="h-4 w-4 text-primary" />
              {label}
              <span className="text-xs text-muted-foreground">{savedBy(type).length}</span>
            </Link>
          ))}
        </div>

        <div className="grid gap-5 lg:gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className={card}>
            <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Top matches
            </h2>
            {topMatches.length ? (
              <ul className="space-y-2 text-sm">
                {topMatches.map((m) => (
                  <li key={m.cutoff.id} className="flex justify-between gap-2">
                    <span className="text-foreground truncate">
                      {m.cutoff.programme_name}
                      <span className="block text-xs text-muted-foreground">
                        {m.cutoff.universities?.short_name} · cut-off {m.cutoff.cut_off_aggregate}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">{m.category}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add your WASSCE results to see the programmes your aggregate actually reaches.
              </p>
            )}
            <Link to="/admission-match" className="mt-4 inline-block text-sm text-primary font-medium min-h-[44px]">
              See all matches and cut-offs
            </Link>
          </div>

          {(["university", "scholarship"] as const).map((type) => (
            <div key={type} className={card}>
              <h2 className="font-display font-semibold text-foreground mb-3 capitalize">Saved {type}s</h2>
              <ul className="space-y-2">
                {savedBy(type).slice(0, 5).map((s) => (
                  <li key={s.id} className="flex items-start justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <p className="text-foreground break-words">{s.title}</p>
                      {s.subtitle && <p className="text-xs text-muted-foreground">{s.subtitle}</p>}
                    </div>
                    <button
                      onClick={() => removeSaved(s.id)}
                      className="shrink-0 min-h-[44px] min-w-[44px] grid place-items-center text-muted-foreground hover:text-destructive"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
                {!savedBy(type).length && (
                  <li className="text-sm text-muted-foreground">Nothing saved yet.</li>
                )}
              </ul>
              <Link to="/saved" className="mt-3 inline-block text-sm text-primary font-medium">
                View all saved
              </Link>
            </div>
          ))}

          <div className={card}>
            <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" /> Deadlines
            </h2>
            <ul className="space-y-2 mb-3">
              {deadlines.map((d) => (
                <li key={d.id} className="flex justify-between gap-2 text-sm">
                  <span className="text-foreground break-words">{d.title}</span>
                  <span className={daysLeft(d.due_date) < 14 ? "text-destructive text-xs shrink-0" : "text-muted-foreground text-xs shrink-0"}>
                    {daysLeft(d.due_date)} days
                  </span>
                </li>
              ))}
              {!deadlines.length && <li className="text-sm text-muted-foreground">No deadlines yet.</li>}
            </ul>
            <div className="space-y-2">
              <input className={input} placeholder="Deadline title" maxLength={120} value={deadlineTitle} onChange={(e) => setDeadlineTitle(e.target.value)} />
              <div className="flex gap-2">
                <input type="date" className={input} value={deadlineDate} onChange={(e) => setDeadlineDate(e.target.value)} />
                <button onClick={addDeadline} className="px-4 min-h-[48px] rounded-xl bg-primary text-primary-foreground" aria-label="Add deadline">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 xl:col-span-3">
            <MotivationPanel data={journey} />
          </div>

          <div className={card}>
            <h2 className="font-display font-semibold text-foreground mb-3">Your profile</h2>
            <dl className="text-sm space-y-2 text-muted-foreground">
              <div className="flex justify-between gap-3"><dt>Target career</dt><dd className="text-foreground text-right">{profile?.target_career ?? "—"}</dd></div>
              <div className="flex justify-between gap-3"><dt>School</dt><dd className="text-foreground text-right">{profile?.school ?? "—"}</dd></div>
              <div className="flex justify-between gap-3"><dt>Region</dt><dd className="text-foreground text-right">{profile?.region ?? "—"}</dd></div>
            </dl>
            <Link to="/onboarding" className="mt-4 inline-block text-sm text-primary font-medium">
              Update my details
            </Link>
          </div>

          <div className={card}>
            <h2 className="font-display font-semibold text-foreground mb-3 capitalize">Saved careers</h2>
            <ul className="space-y-2">
              {savedBy("career").map((s) => (
                <li key={s.id} className="flex items-start justify-between gap-2 text-sm">
                  <p className="text-foreground break-words">{s.title}</p>
                  <button
                    onClick={() => removeSaved(s.id)}
                    className="shrink-0 min-h-[44px] min-w-[44px] grid place-items-center text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!savedBy("career").length && (
                <li className="text-sm text-muted-foreground">Nothing saved yet.</li>
              )}
            </ul>
          </div>

          <div id="checklist" className={`${card} md:col-span-2`}>
            <h2 className="font-display font-semibold text-foreground mb-3">Application checklist</h2>
            <ul className="space-y-2 mb-3">
              {checklist.map((c) => (
                <li key={c.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-5 w-5 shrink-0" checked={c.done} onChange={() => toggleTask(c.id, c.done)} />
                  <span className={c.done ? "line-through text-muted-foreground break-words" : "text-foreground break-words"}>{c.task}</span>
                  <button onClick={() => removeTask(c.id)} className="ml-auto shrink-0 min-h-[44px] min-w-[44px] grid place-items-center text-muted-foreground hover:text-destructive" aria-label="Remove task">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {!checklist.length && <li className="text-sm text-muted-foreground">Add your first application task.</li>}
            </ul>
            <div className="flex gap-2">
              <input className={input} placeholder="e.g. Upload WASSCE results to UG portal" maxLength={160} value={task} onChange={(e) => setTask(e.target.value)} />
              <button onClick={addTask} className="px-4 min-h-[48px] rounded-xl bg-primary text-primary-foreground" aria-label="Add task">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={card}>
            <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Next steps
            </h2>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• <Link to="/preferences" className="text-primary">Customise my match preferences</Link></li>
              <li>• <Link to="/matcher" className="text-primary">Run the scholarship matcher</Link></li>
              <li>• <Link to="/compare" className="text-primary">Compare universities side by side</Link></li>
              <li>• <Link to="/search" className="text-primary">Browse and save more schools</Link></li>
            </ul>
          </div>
          <ParentAccessCard />
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
