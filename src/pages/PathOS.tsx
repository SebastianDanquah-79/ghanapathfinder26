import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, BriefcaseBusiness, CheckCircle2, ChevronRight, CircleDollarSign, ClipboardCheck, GraduationCap, Lightbulb, Map, Target, TrendingUp, Trophy, WalletCards } from "lucide-react";

const tabs = ["Overview", "Applications", "Funding", "Skills", "Projects", "Opportunities"] as const;
type Tab = (typeof tabs)[number];

const defaultTasks = [
  { id: "profile", title: "Complete your career goal", done: false },
  { id: "university", title: "Shortlist 3 realistic programmes", done: false },
  { id: "funding", title: "Review scholarships that match you", done: false },
  { id: "skills", title: "Choose your next skill", done: false },
  { id: "project", title: "Start your first portfolio project", done: false },
];

const skills = [
  ["Python", "Foundation", 70], ["Git & GitHub", "Foundation", 55], ["Data Structures", "Intermediate", 25],
  ["Machine Learning", "Intermediate", 10], ["Linear Algebra", "Foundation", 35], ["Cloud & Deployment", "Intermediate", 15],
] as const;

const projects = [
  { level: "Beginner", name: "Personal portfolio", outcome: "Public portfolio + GitHub evidence", effort: "1–2 weeks" },
  { level: "Intermediate", name: "Recommendation system", outcome: "End-to-end data/ML project", effort: "2–4 weeks" },
  { level: "Advanced", name: "AI-powered application", outcome: "Deployed product with measurable users", effort: "4–8 weeks" },
];

const opportunities = [
  { type: "Internship", name: "Find internships matching your target career", action: "/internships" },
  { type: "Scholarship", name: "Find funding before an application deadline", action: "/scholarships" },
  { type: "Community", name: "Connect with students and share experiences", action: "/community" },
  { type: "Research", name: "Explore research and build evidence for graduate study", action: "/careers" },
];

function scoreFromProfile(goal: string, budget: string) {
  let score = 72;
  if (goal.trim()) score += 8;
  if (budget === "low") score += 5;
  return Math.min(score, 95);
}

export default function PathOS() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [goal, setGoal] = useState(() => localStorage.getItem("gpf-goal") || "AI Engineer");
  const [budget, setBudget] = useState(() => localStorage.getItem("gpf-budget") || "low");
  const [tasks, setTasks] = useState(defaultTasks);
  const [monthlyBudget, setMonthlyBudget] = useState(1200);

  const score = useMemo(() => scoreFromProfile(goal, budget), [goal, budget]);
  const completed = tasks.filter((task) => task.done).length;

  const saveGoal = (value: string) => {
    setGoal(value);
    localStorage.setItem("gpf-goal", value);
  };

  const saveBudget = (value: string) => {
    setBudget(value);
    localStorage.setItem("gpf-budget", value);
  };

  const toggleTask = (id: string) => setTasks((current) => current.map((task) => task.id === id ? { ...task, done: !task.done } : task));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-primary">GhanaPathFinder</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">My Path</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">Turn a career goal into a practical route through education, funding, skills, projects and opportunities.</p>
          </div>
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">Back to GhanaPathFinder</Link>
        </header>

        <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-border pb-px" aria-label="Path sections">
          {tabs.map((item) => (
            <button key={item} onClick={() => setTab(item)} className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition ${tab === item ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {item}
            </button>
          ))}
        </nav>

        {tab === "Overview" && <>
          <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm text-muted-foreground">Current destination</p><h2 className="mt-1 text-2xl font-semibold">{goal || "Choose a career goal"}</h2></div>
                <div className="text-right"><div className="text-3xl font-semibold">{score}%</div><p className="text-xs text-muted-foreground">path fit</p></div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-5">
                {[[GraduationCap,"University"],[WalletCards,"Funding"],[BookOpen,"Skills"],[Lightbulb,"Projects"],[BriefcaseBusiness,"Experience"]].map(([Icon,label], index) => {
                  const C = Icon as typeof Target; return <div key={String(label)} className="relative rounded-lg border border-border p-3"><C className="mb-2 h-4 w-4 text-primary"/><p className="text-xs font-medium">{String(label)}</p>{index < 4 && <ChevronRight className="absolute -right-3 top-1/2 hidden h-4 w-4 bg-card text-muted-foreground sm:block"/>}</div>;
                })}
              </div>
              <div className="mt-6 rounded-lg bg-muted/40 p-4"><p className="text-sm font-medium">Why this path fits</p><ul className="mt-2 space-y-2 text-sm text-muted-foreground"><li>• Your stated career goal aligns with the selected education and skills route.</li><li>• Financial constraints are included in the route rather than treated as an afterthought.</li><li>• The path prioritizes evidence: projects, experience and applications.</li></ul></div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-2"><Target className="h-5 w-5"/><h2 className="font-semibold">Personalize your path</h2></div>
              <label className="mt-5 block text-sm font-medium">Target career</label>
              <input value={goal} onChange={(e) => saveGoal(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. AI Engineer" />
              <label className="mt-5 block text-sm font-medium">Financial situation</label>
              <select value={budget} onChange={(e) => saveBudget(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm"><option value="low">Need to minimize cost</option><option value="medium">Moderate budget</option><option value="high">Flexible budget</option></select>
              <p className="mt-4 text-xs text-muted-foreground">These preferences are saved on this device. Connect your account to persist a full profile.</p>
            </div>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-6 lg:col-span-2"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Your next 30 days</h2><p className="text-sm text-muted-foreground">Small actions that move the path forward.</p></div><span className="text-sm text-muted-foreground">{completed}/{tasks.length}</span></div><div className="mt-5 space-y-2">{tasks.map((task) => <button key={task.id} onClick={() => toggleTask(task.id)} className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left hover:bg-muted/30"><CheckCircle2 className={`h-5 w-5 shrink-0 ${task.done ? "text-primary" : "text-muted-foreground"}`}/><span className={`text-sm ${task.done ? "text-muted-foreground line-through" : "font-medium"}`}>{task.title}</span></button>)}</div></div>
            <div className="rounded-xl border border-border bg-card p-6"><div className="flex items-center gap-2"><Map className="h-5 w-5"/><h2 className="font-semibold">Route</h2></div><ol className="mt-5 space-y-4">{["Define target", "Compare programmes", "Secure funding", "Build skills", "Build evidence", "Get experience"].map((x,i)=><li key={x} className="flex gap-3 text-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs">{i+1}</span><span className={i===0?"font-medium":"text-muted-foreground"}>{x}</span></li>)}</ol></div>
          </section>
        </>}

        {tab === "Applications" && <section className="space-y-6"><div className="grid gap-4 md:grid-cols-3">{[["Preparing","Choose programmes and gather documents", "/applications"],["Submitted","Track decisions and follow-ups", "/applications"],["Deadlines","Never lose the next action", "/applications"]].map(([title,desc,href])=><Link key={title} to={href as "/applications"} className="rounded-xl border border-border bg-card p-5 hover:bg-muted/30"><ClipboardCheck className="h-5 w-5 text-primary"/><h2 className="mt-4 font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{desc}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">Open tracker <ArrowRight className="h-4 w-4"/></span></Link>)}</div><div className="rounded-xl border border-border bg-card p-6"><h2 className="font-semibold">Application checklist</h2><div className="mt-4 grid gap-2 sm:grid-cols-2">{["WASSCE results", "Identity document", "Programme requirements", "Recommendation/reference", "Personal statement where required", "Application fee where required"].map(x=><div key={x} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm"><CheckCircle2 className="h-4 w-4 text-muted-foreground"/>{x}</div>)}</div></div></section>}

        {tab === "Funding" && <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-xl border border-border bg-card p-6"><div className="flex items-center gap-2"><CircleDollarSign className="h-5 w-5"/><h2 className="font-semibold">True cost planner</h2></div><div className="mt-6 grid gap-4 sm:grid-cols-2">{[["Tuition / year", 8000],["Accommodation / year", 3000],["Food / year", 2400],["Transport / year", 1200]].map(([label,value])=><label key={label} className="text-sm"><span className="font-medium">{label}</span><input type="number" defaultValue={value} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2"/></label>)}</div><div className="mt-6 rounded-lg bg-muted/40 p-4"><p className="text-sm text-muted-foreground">Illustrative planning total</p><p className="mt-1 text-2xl font-semibold">GHS 14,600 / year</p><p className="mt-1 text-xs text-muted-foreground">Replace these estimates with official fees and your actual living costs.</p></div></div><div className="rounded-xl border border-border bg-card p-6"><h2 className="font-semibold">Funding gap</h2><p className="mt-1 text-sm text-muted-foreground">Model what your family can realistically contribute.</p><label className="mt-6 block text-sm font-medium">Monthly contribution (GHS)</label><input type="range" min="0" max="5000" step="100" value={monthlyBudget} onChange={(e)=>setMonthlyBudget(Number(e.target.value))} className="mt-4 w-full"/><p className="mt-2 text-xl font-semibold">GHS {monthlyBudget.toLocaleString()}</p><div className="mt-6 space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Scholarships</span><span>Search matches</span></div><div className="flex justify-between"><span className="text-muted-foreground">Family contribution</span><span>GHS {(monthlyBudget*12).toLocaleString()}</span></div><div className="flex justify-between border-t border-border pt-3 font-semibold"><span>Remaining gap</span><span>Calculate after verified costs</span></div></div><Link to="/scholarships" className="mt-6 inline-flex items-center gap-2 text-sm font-medium">Find scholarships <ArrowRight className="h-4 w-4"/></Link></div></section>}

        {tab === "Skills" && <section className="space-y-6"><div className="rounded-xl border border-border bg-card p-6"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Skills gap</h2><p className="text-sm text-muted-foreground">Prioritize skills that move you toward {goal}.</p></div><TrendingUp className="h-5 w-5 text-primary"/></div><div className="mt-6 space-y-4">{skills.map(([name,level,value])=><div key={name}><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{name}</span><span className="text-muted-foreground">{level} · {value}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:`${value}%`}}/></div></div>)}</div></div><div className="grid gap-4 md:grid-cols-3">{["Next skill: Python", "Then: Data Structures", "Then: Machine Learning"].map((x,i)=><div key={x} className="rounded-xl border border-border bg-card p-5"><span className="text-xs text-muted-foreground">Priority {i+1}</span><h3 className="mt-2 font-semibold">{x.replace("Next skill: ","").replace("Then: ","")}</h3><p className="mt-2 text-sm text-muted-foreground">Learn, practise, then produce evidence in a project.</p></div>)}</div></section>}

        {tab === "Projects" && <section className="space-y-6"><div><h2 className="text-xl font-semibold">Portfolio projects</h2><p className="mt-1 text-sm text-muted-foreground">Projects convert learning into evidence employers and universities can evaluate.</p></div><div className="grid gap-4 md:grid-cols-3">{projects.map((p)=><article key={p.name} className="rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between"><span className="text-xs font-medium text-primary">{p.level}</span><Lightbulb className="h-4 w-4 text-muted-foreground"/></div><h3 className="mt-4 font-semibold">{p.name}</h3><p className="mt-2 text-sm text-muted-foreground">{p.outcome}</p><p className="mt-4 text-xs text-muted-foreground">Estimated effort: {p.effort}</p><button className="mt-5 w-full rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted/30">Add to my path</button></article>)}</div></section>}

        {tab === "Opportunities" && <section className="space-y-6"><div className="grid gap-4 md:grid-cols-2">{opportunities.map((item)=><Link key={item.name} to={item.action as "/internships"} className="rounded-xl border border-border bg-card p-5 hover:bg-muted/30"><div className="flex items-center justify-between"><span className="text-xs font-medium text-primary">{item.type}</span><Trophy className="h-4 w-4 text-muted-foreground"/></div><h2 className="mt-4 font-semibold">{item.name}</h2><span className="mt-4 inline-flex items-center gap-1 text-sm font-medium">Explore <ArrowRight className="h-4 w-4"/></span></Link>)}</div><div className="rounded-xl border border-border bg-card p-6"><h2 className="font-semibold">Opportunity strategy</h2><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-lg border border-border p-4"><p className="font-medium">Discover</p><p className="mt-1 text-sm text-muted-foreground">Filter by career, skills, location and education stage.</p></div><div className="rounded-lg border border-border p-4"><p className="font-medium">Apply</p><p className="mt-1 text-sm text-muted-foreground">Track every deadline and required document.</p></div><div className="rounded-lg border border-border p-4"><p className="font-medium">Record evidence</p><p className="mt-1 text-sm text-muted-foreground">Capture projects, outcomes, certificates and experience.</p></div></div></div></section>}

        <footer className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">Scores and cost figures in this planning interface are guidance, not admission guarantees or official fee quotes. Verify requirements and deadlines with the institution or scholarship provider.</footer>
      </div>
    </main>
  );
}
