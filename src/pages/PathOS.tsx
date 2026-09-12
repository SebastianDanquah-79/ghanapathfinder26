import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, CircleDollarSign, ClipboardCheck, GraduationCap, Lightbulb, Target, TrendingUp, Trophy, WalletCards } from "lucide-react";
import { calculatePathFit, defaultTasks, estimateAnnualCost, getProjectRoadmap, getSkillPlan, normalizeCareer, type FinancialPriority } from "@/lib/pathEngine";

const STORAGE_KEY = "ghanapathfinder:path-os:v2";
const careerOptions = ["AI Engineer", "Machine Learning Engineer", "Software Engineer", "Robotics Engineer", "Data Scientist"];

const opportunityCards = [
  { type: "Internship", title: "Find experience aligned to your target", description: "Prioritize employers, internships and practical experience that strengthen your route.", href: "/internships" },
  { type: "Scholarship", title: "Build a funding strategy", description: "Match scholarships to eligibility, deadlines and the funding gap in your plan.", href: "/scholarships" },
  { type: "Community", title: "Learn from student experience", description: "Use student insights as context, while verifying official requirements before acting.", href: "/community" },
  { type: "Career", title: "Explore the destination", description: "Understand the work, skills and progression behind the career you selected.", href: "/careers" },
];

export default function PathOS() {
  const [goal, setGoal] = useState("AI Engineer");
  const [budget, setBudget] = useState<FinancialPriority>("low");
  const [monthly, setMonthly] = useState(1200);
  const [tab, setTab] = useState("Overview");
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [costs, setCosts] = useState({ tuition: 8000, accommodation: 3000, food: 2400, transport: 1200 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const value = JSON.parse(raw) as { goal?: string; budget?: FinancialPriority; monthly?: number; done?: Record<number, boolean>; costs?: typeof costs };
      if (value.goal) setGoal(value.goal);
      if (value.budget) setBudget(value.budget);
      if (typeof value.monthly === "number") setMonthly(value.monthly);
      if (value.done) setDone(value.done);
      if (value.costs) setCosts(value.costs);
    } catch { /* Keep the planner usable if browser storage is unavailable. */ }
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ goal, budget, monthly, done, costs })); setSaved(true); } catch { setSaved(false); }
  }, [goal, budget, monthly, done, costs]);

  const career = normalizeCareer(goal);
  const skills = useMemo(() => getSkillPlan(career), [career]);
  const projects = useMemo(() => getProjectRoadmap(career), [career]);
  const fit = useMemo(() => calculatePathFit({ career, financialPriority: budget, monthlyCapacity: monthly }), [career, budget, monthly]);
  const cost = useMemo(() => estimateAnnualCost(monthly, costs.tuition, costs.accommodation, costs.food, costs.transport), [monthly, costs]);
  const completed = Object.values(done).filter(Boolean).length;
  const nextSkill = [...skills].sort((a, b) => (b.target - b.current) - (a.target - a.current))[0];

  const updateCost = (key: keyof typeof costs, value: string) => setCosts(current => ({ ...current, [key]: Math.max(0, Number(value) || 0) }));

  return (
    <section className="rounded-2xl border border-border bg-glass p-5 sm:p-7" aria-label="Path OS planner">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Path OS</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold mt-2">Turn your goal into an executable path.</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">A decision layer connecting education, funding, skills, projects, applications and experience.</p>
        </div>
        <div className="w-full max-w-[230px] rounded-xl border border-border bg-secondary/50 p-4">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Path fit</span><strong className="text-foreground">{fit}%</strong></div>
          <div className="mt-2 h-2 rounded-full bg-background overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${fit}%` }} /></div>
          <p className="text-[11px] text-muted-foreground mt-2">Planning signal, not an admission prediction.</p>
        </div>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border" role="tablist">
        {["Overview", "Applications", "Funding", "Skills", "Projects", "Opportunities"].map(item => (
          <button key={item} role="tab" aria-selected={tab === item} onClick={() => setTab(item)} className={`whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium ${tab === item ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>{item}</button>
        ))}
      </div>

      {tab === "Overview" && <div className="mt-6 space-y-5">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_.8fr]">
          <div className="rounded-xl border border-border p-5">
            <div className="flex items-start justify-between gap-4"><div><p className="text-xs text-muted-foreground">Destination</p><h3 className="text-xl font-semibold mt-1">{career}</h3></div><Target className="h-5 w-5 text-primary" /></div>
            <label className="block mt-5 text-sm font-medium">Target career
              <select value={goal} onChange={e => setGoal(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5">{careerOptions.map(option => <option key={option}>{option}</option>)}</select>
            </label>
            <label className="block mt-4 text-sm font-medium">Financial priority
              <select value={budget} onChange={e => setBudget(e.target.value as FinancialPriority)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5"><option value="low">Minimize cost</option><option value="medium">Balance cost and fit</option><option value="high">Prioritize fit</option></select>
            </label>
            <div className="mt-5 rounded-lg bg-muted/40 p-4"><p className="text-xs text-muted-foreground">Highest current skill gap</p><p className="font-semibold mt-1">{nextSkill.name}</p><p className="text-sm text-muted-foreground mt-1">{nextSkill.reason}. Build it, then prove it with a project.</p></div>
          </div>
          <div className="rounded-xl border border-border p-5"><p className="text-xs uppercase tracking-wide text-muted-foreground">Route</p><ol className="mt-4 space-y-3">{["Define target", "Compare programmes", "Secure funding", "Build skills", "Build evidence", "Get experience"].map((item, i) => <li key={item} className="flex gap-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs">{i + 1}</span><span className={i === 0 ? "font-medium" : "text-muted-foreground"}>{item}</span></li>)}</ol></div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">{[[GraduationCap,"University"],[WalletCards,"Funding"],[BookOpen,"Skills"],[Lightbulb,"Projects"],[BriefcaseBusiness,"Experience"]].map(([Icon,label]) => { const Component = Icon as typeof Target; return <div key={String(label)} className="rounded-xl border border-border p-4"><Component className="h-4 w-4 text-primary mb-3"/><p className="text-xs font-medium">{String(label)}</p></div>; })}</div>
        <div className="rounded-xl border border-border p-5">
          <div className="flex justify-between gap-4"><div><h3 className="font-semibold">Next actions</h3><p className="text-sm text-muted-foreground mt-1">Small actions that compound into a stronger application and career profile.</p></div><span className="text-sm text-muted-foreground">{completed}/{defaultTasks.length}</span></div>
          <div className="grid gap-2 mt-4 md:grid-cols-2">{defaultTasks.map((task, i) => <button key={task.title} onClick={() => setDone(current => ({ ...current, [i]: !current[i] }))} className="flex items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/30"><CheckCircle2 className={`h-5 w-5 shrink-0 ${done[i] ? "text-primary" : "text-muted-foreground"}`} /><span className={`text-sm ${done[i] ? "line-through text-muted-foreground" : "font-medium"}`}>{task.title}</span></button>)}</div>
        </div>
      </div>}

      {tab === "Applications" && <div className="mt-6 space-y-4">
        <div className="grid gap-3 md:grid-cols-3">{[["Preparing","Choose programmes and gather documents"],["Submitted","Track decisions and follow-ups"],["Deadlines","Keep the next action visible"]].map(([title,description]) => <Link key={title} to="/applications" className="rounded-xl border border-border p-5 hover:bg-muted/30"><ClipboardCheck className="h-5 w-5 text-primary"/><h3 className="font-semibold mt-3">{title}</h3><p className="text-sm text-muted-foreground mt-1">{description}</p><span className="inline-flex items-center gap-1 mt-4 text-sm font-medium">Open tracker <ArrowRight className="h-4 w-4"/></span></Link>)}</div>
        <div className="rounded-xl border border-border p-5"><h3 className="font-semibold">Application evidence checklist</h3><div className="grid gap-2 sm:grid-cols-2 mt-4">{["WASSCE results", "Identity document where required", "Programme requirements", "Reference or recommendation where required", "Personal statement where required", "Application fee where required"].map(item => <div key={item} className="flex gap-2 items-center border border-border rounded-lg p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-muted-foreground"/>{item}</div>)}</div></div>
      </div>}

      {tab === "Funding" && <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border p-5"><div className="flex gap-2 items-center"><CircleDollarSign className="h-5 w-5 text-primary"/><h3 className="font-semibold">True annual cost planner</h3></div><div className="grid gap-3 sm:grid-cols-2 mt-5">{([['tuition','Tuition / year'],['accommodation','Accommodation / year'],['food','Food / year'],['transport','Transport / year']] as const).map(([key,label]) => <label key={key} className="text-sm"><span className="font-medium">{label}</span><input type="number" min="0" value={costs[key]} onChange={e => updateCost(key, e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" /></label>)}</div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Annual cost</p><p className="font-semibold mt-1">GHS {cost.annualCost.toLocaleString()}</p></div><div className="rounded-lg bg-muted/40 p-3"><p className="text-xs text-muted-foreground">Funding gap</p><p className="font-semibold mt-1">GHS {cost.fundingGap.toLocaleString()}</p></div></div><p className="mt-4 text-xs text-muted-foreground">Use official fee schedules before making a real financial decision.</p></div>
        <div className="rounded-xl border border-border p-5"><h3 className="font-semibold">Funding capacity</h3><p className="text-sm text-muted-foreground mt-1">Estimate what can realistically be contributed each month.</p><input aria-label="Monthly funding capacity" type="range" min="0" max="10000" step="100" value={monthly} onChange={e => setMonthly(Number(e.target.value))} className="w-full mt-7"/><div className="flex items-end justify-between mt-2"><p className="text-xl font-semibold">GHS {monthly.toLocaleString()} / month</p><span className="text-sm text-muted-foreground">{cost.coverage}% covered</span></div><div className="mt-4 h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${cost.coverage}%` }} /></div><Link to="/scholarships" className="inline-flex items-center gap-2 mt-6 text-sm font-semibold">Find scholarship matches <ArrowRight className="h-4 w-4"/></Link></div>
      </div>}

      {tab === "Skills" && <div className="mt-6 rounded-xl border border-border p-5"><div className="flex justify-between gap-4"><div><h3 className="font-semibold">Skills gap for {career}</h3><p className="text-sm text-muted-foreground mt-1">Prioritize the largest gaps and prove progress through projects.</p></div><TrendingUp className="h-5 w-5 text-primary"/></div><div className="space-y-5 mt-6">{skills.map(skill => <div key={skill.name}><div className="flex justify-between text-sm mb-2"><span className="font-medium">{skill.name}</span><span className="text-muted-foreground">{skill.level} · {skill.current}% / {skill.target}% target</span></div><div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${skill.current}%` }} /></div><p className="text-xs text-muted-foreground mt-1.5">{skill.reason}</p></div>)}</div></div>}

      {tab === "Projects" && <div className="mt-6 space-y-4"><div className="rounded-xl border border-border p-5"><h3 className="font-semibold">Evidence roadmap</h3><p className="text-sm text-muted-foreground mt-1">The goal is not to collect projects. It is to build increasingly credible evidence that you can do the work.</p></div><div className="grid gap-4 md:grid-cols-3">{projects.map(project => <article key={project.title} className="rounded-xl border border-border p-5"><span className="text-xs font-semibold text-primary">{project.stage}</span><h3 className="font-semibold mt-3">{project.title}</h3><p className="text-sm text-muted-foreground mt-2">{project.outcome}</p><p className="text-xs text-muted-foreground mt-4">Estimated effort: {project.effort}</p><button onClick={() => setDone(current => ({ ...current, [20 + projects.indexOf(project)]: true }))} className="mt-5 w-full rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted/30">Add to my path</button></article>)}</div></div>}

      {tab === "Opportunities" && <div className="mt-6 grid gap-4 md:grid-cols-2">{opportunityCards.map(card => <Link key={card.title} to={card.href as "/internships"} className="rounded-xl border border-border p-5 hover:bg-muted/30"><div className="flex justify-between"><span className="text-xs font-semibold text-primary">{card.type}</span><Trophy className="h-4 w-4 text-muted-foreground"/></div><h3 className="font-semibold mt-4">{card.title}</h3><p className="text-sm text-muted-foreground mt-2">{card.description}</p><span className="inline-flex items-center gap-1 mt-4 text-sm font-medium">Explore <ArrowRight className="h-4 w-4"/></span></Link>)}</div>}

      <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-muted-foreground">{saved ? "Plan saved on this device." : "Plan is running without local persistence."} For account-level sync, apply the included Supabase migration.</p><span className="text-xs text-muted-foreground">Verify deadlines, requirements and costs with the relevant provider.</span></div>
    </section>
  );
}
