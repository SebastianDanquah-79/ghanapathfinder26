import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";

const missions = [
  { title: "Build your shortlist", text: "Save 3 realistic programmes and compare what actually matters.", xp: 80, href: "/compare" },
  { title: "Find one funding route", text: "Open a scholarship and verify its deadline and eligibility.", xp: 60, href: "/scholarships" },
  { title: "Build one useful skill", text: "Pick one skill connected to your target career and start a free resource.", xp: 70, href: "/skills" },
];

const challenges = [
  { q: "A programme looks exciting, but you do not meet one direct-entry subject requirement. What is the strongest next move?", options: ["Ignore the requirement", "Find a verified alternative route", "Assume admission will be automatic"], answer: 1 },
  { q: "What makes a career plan stronger?", options: ["Only a job title", "A chain of skills, projects, experience and next decisions", "A motivational quote"], answer: 1 },
  { q: "Before paying an application fee, what should you verify?", options: ["A social-media comment", "The current official application information", "An old screenshot"], answer: 1 },
];

const PathfinderLab = () => {
  const [challenge, setChallenge] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const current = challenges[challenge];
  const level = useMemo(() => Math.floor(score / 100) + 1, [score]);

  const answer = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === current.answer) setScore((value) => value + 50);
  };

  const next = () => {
    setSelected(null);
    setChallenge((value) => (value + 1) % challenges.length);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">PathFinder Lab</p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1.4fr_.6fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Your future is a project. Build it.</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 opacity-75">A focused space for missions, challenges and career-building progress. No empty badges. Every action should make you more prepared.</p>
            </div>
            <div className="rounded-2xl border border-background/20 bg-background/10 p-5">
              <p className="text-xs uppercase tracking-wider opacity-60">Reality check</p>
              <p className="mt-3 text-lg font-semibold leading-7">Nobody can build your path for you. Start with one useful decision today.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Builder level</p><p className="mt-2 text-3xl font-bold">{level}</p><p className="mt-1 text-sm text-muted-foreground">Keep improving your evidence.</p></div>
          <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Lab score</p><p className="mt-2 text-3xl font-bold">{score}</p><p className="mt-1 text-sm text-muted-foreground">Earned through meaningful challenges.</p></div>
          <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">North star</p><p className="mt-2 text-3xl font-bold">1 next step</p><p className="mt-1 text-sm text-muted-foreground">Clarity beats endless browsing.</p></div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <section>
            <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Today</p><h2 className="mt-1 text-2xl font-bold">Your missions</h2></div><Link to="/my-path" className="text-sm font-semibold text-primary">Open My Path</Link></div>
            <div className="mt-4 space-y-3">
              {missions.map((mission) => (
                <Link key={mission.title} to={mission.href} className="group block rounded-2xl border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-sm">
                  <div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold group-hover:text-primary">{mission.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{mission.text}</p></div><span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">+{mission.xp} XP</span></div>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Decision challenge</p>
            <h2 className="mt-2 text-xl font-bold">Think like your future self.</h2>
            <p className="mt-4 text-sm leading-6">{current.q}</p>
            <div className="mt-4 space-y-2">
              {current.options.map((option, index) => {
                const correct = selected !== null && index === current.answer;
                const wrong = selected === index && index !== current.answer;
                return <button key={option} type="button" onClick={() => answer(index)} className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition ${correct ? "border-primary bg-primary/10" : wrong ? "border-destructive bg-destructive/10" : "border-border hover:border-primary/50"}`}>{option}</button>;
              })}
            </div>
            {selected !== null && <div className="mt-4 flex items-center justify-between gap-3"><p className="text-sm font-medium">{selected === current.answer ? "Correct. +50 XP" : "Not quite. Check the reasoning and keep going."}</p><button type="button" onClick={next} className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Next challenge</button></div>}
          </section>
        </div>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div><p className="text-xs font-semibold uppercase tracking-wider text-primary">The 100-day builder</p><h2 className="mt-2 text-2xl font-bold">Turn ambition into evidence.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Choose a destination such as AI, software, robotics, business or engineering. Then turn it into a sequence of skills, projects, experience and applications instead of a vague dream.</p></div>
            <Link to="/career-path" className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Build my path</Link>
          </div>
        </section>
      </section>
    </main>
  );
};

export default PathfinderLab;
