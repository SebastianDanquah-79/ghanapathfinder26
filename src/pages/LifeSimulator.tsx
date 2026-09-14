import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Brain, BriefcaseBusiness, GraduationCap, HeartPulse, Map, Sparkles, Target, WalletCards } from "lucide-react";

const scenarios = [
  { title: "Your first university choice is too expensive", text: "You have a strong programme match, but the cost is above your current budget. What do you do?", choices: ["Apply anyway and ignore the cost", "Compare a scholarship route and lower-cost alternatives", "Give up on the career"], best: 1, lesson: "Strong planning keeps the destination while changing the route." },
  { title: "You have 12 months before an internship", text: "You want a competitive technical role. What creates the strongest evidence?", choices: ["Collect certificates only", "Build two useful projects and document them publicly", "Wait until applications open"], best: 1, lesson: "Evidence beats intention. Projects make your skills visible." },
  { title: "A new opportunity appears", text: "A competition could help your portfolio, but it conflicts with an important exam week.", choices: ["Do everything regardless of the exam", "Protect the exam, then choose opportunities that fit your capacity", "Never try opportunities during school"], best: 1, lesson: "Good decisions balance ambition with constraints." },
];

const tracks = [
  { label: "Education", icon: GraduationCap, value: 72 },
  { label: "Career", icon: BriefcaseBusiness, value: 58 },
  { label: "Money", icon: WalletCards, value: 46 },
  { label: "Skills", icon: Brain, value: 64 },
  { label: "Wellbeing", icon: HeartPulse, value: 78 },
];

export default function LifeSimulator() {
  const [scenario, setScenario] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const current = scenarios[scenario];
  const level = Math.floor(score / 100) + 1;
  const overall = useMemo(() => Math.round(tracks.reduce((a, b) => a + b.value, 0) / tracks.length), []);

  function answer(index: number) {
    if (choice !== null) return;
    setChoice(index);
    if (index === current.best) setScore((s) => s + 50);
  }

  function next() {
    setScenario((s) => (s + 1) % scenarios.length);
    setChoice(null);
  }

  return (
    <section className="rounded-3xl border border-border bg-foreground text-background overflow-hidden shadow-sm">
      <div className="p-6 md:p-8 border-b border-background/15">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-background/60"><Sparkles className="h-3.5 w-3.5" /> Life Simulator</div>
            <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight">Play the decisions. Learn the consequences.</h2>
            <p className="mt-3 text-sm md:text-base text-background/65">A safe, educational simulation where your choices change your fictional future. No real money, no gambling, no irreversible decisions.</p>
          </div>
          <div className="min-w-[170px] rounded-2xl border border-background/15 bg-background/5 p-4">
            <div className="text-xs text-background/55">Simulation score</div>
            <div className="mt-1 text-3xl font-semibold">{score} XP</div>
            <div className="mt-1 text-xs text-background/55">Level {level} · Future readiness {overall}%</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_.9fr] gap-0">
        <div className="p-6 md:p-8 lg:border-r border-background/15">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-background/50">Decision {scenario + 1} of {scenarios.length}</span>
            <span className="text-xs text-background/50">+50 XP for the strongest strategic choice</span>
          </div>
          <h3 className="mt-5 text-xl font-semibold">{current.title}</h3>
          <p className="mt-2 text-sm leading-6 text-background/65">{current.text}</p>
          <div className="mt-5 space-y-2.5">
            {current.choices.map((item, index) => {
              const selected = choice === index;
              const correct = choice !== null && index === current.best;
              return <button key={item} onClick={() => answer(index)} className={`w-full text-left rounded-2xl border p-4 text-sm transition ${selected ? "border-background bg-background/15" : "border-background/15 hover:bg-background/10"} ${correct ? "ring-1 ring-background/40" : ""}`}><span className="font-medium">{String.fromCharCode(65 + index)}.</span> <span className="ml-2 text-background/80">{item}</span></button>;
            })}
          </div>
          {choice !== null && <div className="mt-4 rounded-2xl bg-background/8 border border-background/15 p-4"><div className="text-sm font-semibold">{choice === current.best ? "Strategically strong." : "Useful lesson."}</div><p className="mt-1 text-sm text-background/60">{current.lesson}</p><button onClick={next} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold">Next decision <ArrowRight className="h-4 w-4" /></button></div>}
        </div>

        <div className="p-6 md:p-8 bg-background/[0.03]">
          <div className="flex items-center gap-2"><Map className="h-4 w-4 text-background/55" /><span className="text-sm font-semibold">Your simulated life dashboard</span></div>
          <div className="mt-5 space-y-4">
            {tracks.map(({ label, icon: Icon, value }) => <div key={label}><div className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-background/65"><Icon className="h-3.5 w-3.5" />{label}</span><span className="text-background/45">{value}%</span></div><div className="mt-2 h-1.5 rounded-full bg-background/10 overflow-hidden"><div className="h-full rounded-full bg-background/75" style={{ width: `${value}%` }} /></div></div>)}
          </div>
          <div className="mt-7 rounded-2xl border border-background/15 p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4" /> Simulation rule</div><p className="mt-2 text-xs leading-5 text-background/55">The simulator teaches trade-offs: time, money, skills, education, opportunities and wellbeing. It does not predict your real life or assign a fixed destiny.</p></div>
          <Link to="/my-path" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Turn lessons into your real Path <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  );
}
