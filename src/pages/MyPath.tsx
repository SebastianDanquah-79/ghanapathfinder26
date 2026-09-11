import { useEffect, useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Award, BookOpen, Briefcase, Building2, CalendarClock, CheckCircle2, Lightbulb, MapPin, Sparkles, Target } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAdmissionMatches } from "@/hooks/useAdmissionMatch";
import Navbar from "@/components/Navbar";

type PathItem = { id: string; label: string; hint: string; href: string; done: boolean };

type SavedItem = { id: string; item_type: string; item_key: string; title?: string | null };

const STORAGE_KEY = "ghanapathfinder-my-path-v1";

const defaultGoal = "";

const stageOptions = ["WASSCE graduate", "University student", "Graduate", "Working", "Career switcher"];

const priorityOptions = ["Career outcomes", "Low cost", "Strong university", "Fastest route", "International opportunities"];

const routeAdvice = (goal: string) => {
  const g = goal.toLowerCase();
  if (g.includes("ai") || g.includes("machine learning")) return ["Computer Science", "Computer Engineering", "Mathematics / Statistics"];
  if (g.includes("robot") || g.includes("mechat")) return ["Mechatronics", "Electrical / Electronic Engineering", "Computer Science"];
  if (g.includes("software") || g.includes("developer")) return ["Computer Science", "Information Technology", "Computer Engineering"];
  if (g.includes("cyber")) return ["Computer Science", "Cybersecurity / IT", "Computer Engineering"];
  if (g.includes("data")) return ["Computer Science", "Statistics / Mathematics", "Information Technology"];
  if (g.includes("business") || g.includes("entrepreneur")) return ["Business Administration", "Economics", "Accounting / Finance"];
  if (g.includes("doctor") || g.includes("medicine")) return ["Medicine", "Biomedical / Health Sciences", "Related health pathway"];
  return ["Explore the closest degree pathway", "Compare related programmes", "Build skills alongside your studies"];
};

const MyPath = () => {
  const { user } = useAuth();
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
  const { data: saved = [] } = useQuery<SavedItem[]>({
    queryKey: ["saved_items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as SavedItem[];
    },
  });
  const { matches, breakdown } = useAdmissionMatches();

  const [goal, setGoal] = useState(defaultGoal);
  const [stage, setStage] = useState(stageOptions[0]);
  const [priority, setPriority] = useState(priorityOptions[0]);
  const [budget, setBudget] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const savedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (savedState.goal) setGoal(savedState.goal);
      if (savedState.stage) setStage(savedState.stage);
      if (savedState.priority) setPriority(savedState.priority);
      if (savedState.budget) setBudget(savedState.budget);
      if (savedState.checked) setChecked(savedState.checked);
    } catch {
      // Ignore malformed local state and keep safe defaults.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ goal, stage, priority, budget, checked }));
    } catch {
      // Local persistence is an enhancement, not a requirement.
    }
  }, [goal, stage, priority, budget, checked]);

  const activeGoal = goal.trim() || profile?.target_career || "your target career";
  const routes = useMemo(() => routeAdvice(activeGoal), [activeGoal]);
  const topMatches = matches.filter((m) => m.confidence != null && m.category !== "Not Eligible").slice(0, 3);

  const savedCounts = useMemo(() => ({
    university: saved.filter((x) => x.item_type === "university").length,
    scholarship: saved.filter((x) => x.item_type === "scholarship").length,
    career: saved.filter((x) => x.item_type === "career").length,
    internship: saved.filter((x) => x.item_type === "internship").length,
  }), [saved]);

  const items: PathItem[] = [
    { id: "goal", label: "Define your destination", hint: "Choose a career or outcome worth building toward.", href: "/careers", done: !!goal.trim() || !!profile?.target_career },
    { id: "education", label: "Choose an education route", hint: "Compare programmes and institutions that can move you toward the goal.", href: "/compare", done: savedCounts.university >= 2 },
    { id: "funding", label: "Plan the cost", hint: "Find scholarships and understand tuition plus living costs before committing.", href: "/scholarships", done: savedCounts.scholarship > 0 },
    { id: "skills", label: "Build the skills", hint: "Turn your career goal into practical skills and projects.", href: "/skills", done: false },
    { id: "experience", label: "Get experience", hint: "Use internships, projects and real opportunities to build evidence.", href: "/internships", done: savedCounts.internship > 0 },
    { id: "apply", label: "Take the next action", hint: "Track applications, deadlines and the opportunities you are pursuing.", href: "/applications", done: false },
  ];

  const progress = Math.round((items.filter((item) => checked[item.id] || item.done).length / items.length) * 100);

  const toggle = (id: string) => setChecked((current) => ({ ...current, [id]: !current[id] }));

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 md:pb-12">
      <Navbar />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        <section className="rounded-2xl border border-border bg-glass p-5 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">My Path</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mt-2">From where you are to where you want to go.</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-3">Build one personal path across education, skills, funding, experience and career. Your choices stay saved on this device while you shape the plan.</p>
            </div>
            <div className="min-w-[180px] rounded-xl border border-border bg-secondary/50 p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Path progress</span><span className="font-semibold text-foreground">{progress}%</span></div>
              <div className="h-2 rounded-full bg-background mt-2 overflow-hidden"><div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} /></div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.2fr_.8fr] gap-4">
          <div className="rounded-2xl border border-border bg-glass p-5">
            <div className="flex items-center gap-2 mb-4"><Target className="h-5 w-5 text-primary" /><h2 className="font-display text-lg font-semibold">Define your destination</h2></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="sm:col-span-2"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Dream career or outcome</span><input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={profile?.target_career || "e.g. AI engineer"} className="w-full px-3.5 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40" /></label>
              <label><span className="block text-xs font-medium text-muted-foreground mb-1.5">Current stage</span><select value={stage} onChange={(e) => setStage(e.target.value)} className="w-full px-3.5 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground">{stageOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label><span className="block text-xs font-medium text-muted-foreground mb-1.5">Main priority</span><select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full px-3.5 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground">{priorityOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label className="sm:col-span-2"><span className="block text-xs font-medium text-muted-foreground mb-1.5">Monthly budget, optional</span><input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="e.g. GHS 1,500" className="w-full px-3.5 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40" /></label>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-glass p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Your starting point</p>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="rounded-xl bg-secondary/50 p-3"><p className="text-xs text-muted-foreground">WASSCE</p><p className="font-display text-2xl font-bold">{breakdown.aggregate ?? "—"}</p></div>
              <div className="rounded-xl bg-secondary/50 p-3"><p className="text-xs text-muted-foreground">Saved options</p><p className="font-display text-2xl font-bold">{saved.length}</p></div>
              <div className="rounded-xl bg-secondary/50 p-3"><p className="text-xs text-muted-foreground">Scholarships</p><p className="font-display text-2xl font-bold">{savedCounts.scholarship}</p></div>
              <div className="rounded-xl bg-secondary/50 p-3"><p className="text-xs text-muted-foreground">Subjects</p><p className="font-display text-2xl font-bold">{results.length}</p></div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">{stage} · {priority}{budget ? ` · ${budget}/month` : ""}</p>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1.1fr_.9fr] gap-4">
          <div className="rounded-2xl border border-border bg-glass p-5">
            <div className="flex items-center justify-between gap-3 mb-4"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Decision studio</p><h2 className="font-display text-xl font-semibold mt-1">Routes toward {activeGoal}</h2></div><Sparkles className="h-5 w-5 text-primary" /></div>
            <div className="space-y-2.5">
              {routes.map((route, index) => <div key={route} className="flex items-center gap-3 rounded-xl border border-border/70 bg-secondary/35 p-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold">{index + 1}</span><div className="min-w-0"><p className="text-sm font-semibold text-foreground">{route}</p><p className="text-xs text-muted-foreground">{index === 0 ? "Most direct option to investigate first." : "Useful alternative to compare before deciding."}</p></div></div>)}
            </div>
            <div className="mt-4 flex flex-wrap gap-2"><Link to="/compare" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 min-h-[44px] text-sm font-semibold text-primary-foreground">Compare routes <ArrowRight className="h-4 w-4" /></Link><Link to="/career-path" className="inline-flex items-center gap-2 rounded-xl bg-secondary px-4 min-h-[44px] text-sm font-semibold text-foreground">Open Career Path</Link></div>
          </div>

          <div className="rounded-2xl border border-border bg-glass p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Your strongest current matches</p>
            <div className="space-y-3 mt-3">
              {topMatches.length ? topMatches.map((m) => <div key={m.id ?? m.name} className="rounded-xl border border-border/70 p-3"><div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-foreground">{m.name}</p><span className="text-xs font-semibold text-primary">{m.confidence}%</span></div><p className="text-xs text-muted-foreground mt-1">{m.category || "Potential match"}</p></div>) : <p className="text-sm text-muted-foreground">Add your WASSCE results to see personalised admission matches.</p>}
            </div>
            <Link to="/admission-match" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary mt-4">See all matches <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-glass p-5">
          <div className="flex items-end justify-between gap-3 mb-4"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">The journey</p><h2 className="font-display text-xl font-semibold mt-1">Your next six moves</h2></div><span className="text-xs text-muted-foreground">Tick items as you complete them</span></div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {items.map((item, index) => { const done = checked[item.id] || item.done; return <div key={item.id} className={`rounded-xl border p-4 transition-colors ${done ? "border-primary/40 bg-primary/5" : "border-border/70 bg-secondary/20"}`}><div className="flex items-start justify-between gap-3"><button onClick={() => toggle(item.id)} aria-label={`Mark ${item.label} complete`} className={`h-7 w-7 shrink-0 rounded-full border flex items-center justify-center ${done ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent"}`}><CheckCircle2 className="h-4 w-4" /></button><span className="text-xs text-muted-foreground">0{index + 1}</span></div><h3 className="text-sm font-semibold mt-3">{item.label}</h3><p className="text-xs text-muted-foreground mt-1 min-h-9">{item.hint}</p><Link to={item.href} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mt-3">Continue <ArrowRight className="h-3.5 w-3.5" /></Link></div>; })}
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            [Building2, "Education", "Universities, programmes and admission", "/search?kind=university"],
            [Award, "Funding", "Scholarships and financial routes", "/scholarships"],
            [BookOpen, "Skills", "Learn, build and prove useful skills", "/skills"],
            [Briefcase, "Experience", "Internships and employers", "/internships"],
          ].map(([Icon, title, text, href]) => { const C = Icon as typeof Building2; return <Link key={title as string} to={href as string} className="group rounded-xl border border-border bg-glass p-4 hover:border-primary/40 transition-colors"><C className="h-5 w-5 text-primary" /><p className="text-sm font-semibold mt-3">{title as string}</p><p className="text-xs text-muted-foreground mt-1">{text as string}</p><span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-3">Explore <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" /></span></Link>; })}
        </section>

        <section className="rounded-xl border border-border bg-secondary/25 p-4 flex flex-col sm:flex-row sm:items-center gap-3"><Lightbulb className="h-5 w-5 text-primary shrink-0" /><p className="text-sm text-muted-foreground flex-1"><span className="font-semibold text-foreground">A better decision is usually a sequence of smaller decisions.</span> Use your path to compare options, check the evidence, and act on the next useful step.</p><Link to="/applications" className="inline-flex items-center justify-center min-h-[42px] px-4 rounded-lg bg-foreground text-background text-sm font-semibold">Track opportunities</Link></section>
      </main>
    </div>
  );
};

export default MyPath;
