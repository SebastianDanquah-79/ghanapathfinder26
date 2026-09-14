import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Brain, BriefcaseBusiness, GraduationCap, HeartPulse, Loader2, Map, Sparkles, Target, WalletCards } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Decision = { id: string; title: string; question: string; choices: string[]; consequence: string[]; strongest_choice: number; lesson: string; xp: number; stat_effects: Record<string, number> };
type SimState = { xp: number; level: number; education_score: number; career_score: number; funding_score: number; skills_score: number; experience_score: number; wellbeing_score: number; decision_count: number };

const emptyState: SimState = { xp: 0, level: 1, education_score: 50, career_score: 50, funding_score: 50, skills_score: 50, experience_score: 20, wellbeing_score: 70, decision_count: 0 };

export default function LifeSimulator() {
  const [state, setState] = useState<SimState>(emptyState);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [choice, setChoice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [answering, setAnswering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overall = useMemo(() => Math.round((state.education_score + state.career_score + state.funding_score + state.skills_score + state.experience_score + state.wellbeing_score) / 6), [state]);

  async function generateDecision() {
    setLoading(true); setError(null); setChoice(null);
    const { data, error: invokeError } = await supabase.functions.invoke("life-simulator", { body: { previous_decisions: [] } });
    if (invokeError || data?.error) { setError(invokeError?.message ?? data?.error ?? "Could not load your next decision."); setLoading(false); return; }
    setDecision(data.decision); setState(data.state ?? emptyState); setLoading(false);
  }

  useEffect(() => { void generateDecision(); }, []);

  async function answer(index: number) {
    if (!decision || choice !== null || answering) return;
    setChoice(index); setAnswering(true);
    const strongest = index === decision.strongest_choice;
    const { data, error: invokeError } = await supabase.functions.invoke("life-simulator", { body: { action: "answer", decision_id: decision.id, selected_index: index, stat_effects: strongest ? decision.stat_effects : Object.fromEntries(Object.keys(decision.stat_effects).map((k) => [k, Math.round(decision.stat_effects[k] * -0.35)])), xp: strongest ? decision.xp : Math.round(decision.xp * 0.25) } });
    if (invokeError || data?.error) setError(invokeError?.message ?? data?.error ?? "Your decision could not be saved.");
    else if (data?.state) setState(data.state);
    setAnswering(false);
  }

  const tracks = [
    ["Education", GraduationCap, state.education_score], ["Career", BriefcaseBusiness, state.career_score], ["Funding", WalletCards, state.funding_score], ["Skills", Brain, state.skills_score], ["Experience", Target, state.experience_score], ["Wellbeing", HeartPulse, state.wellbeing_score],
  ] as const;

  return <section className="rounded-3xl border border-border bg-foreground text-background overflow-hidden shadow-sm">
    <div className="p-6 md:p-8 border-b border-background/15">
      <div className="flex flex-wrap items-start justify-between gap-5"><div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-background/60"><Sparkles className="h-3.5 w-3.5" /> Life Simulator</div>
        <h2 className="mt-3 text-2xl md:text-4xl font-semibold tracking-tight">Play the decisions. Learn the consequences.</h2>
        <p className="mt-3 text-sm md:text-base text-background/65">A personal decision game built around your Path. Your choices change the simulation over time.</p>
      </div><div className="min-w-[190px] rounded-2xl border border-background/15 bg-background/5 p-4"><div className="text-xs text-background/55">Your progress</div><div className="mt-1 text-3xl font-semibold">{state.xp} XP</div><div className="mt-1 text-xs text-background/55">Level {state.level} · Readiness {overall}% · {state.decision_count} decisions</div></div></div>
    </div>
    <div className="grid lg:grid-cols-[1.1fr_.9fr]">
      <div className="p-6 md:p-8 lg:border-r border-background/15">
        {loading ? <div className="min-h-[330px] flex flex-col items-center justify-center text-center"><Loader2 className="h-6 w-6 animate-spin"/><p className="mt-3 text-sm text-background/60">Building your next decision...</p></div> : error ? <div className="rounded-2xl border border-background/15 p-5"><p className="text-sm">{error}</p><button onClick={() => void generateDecision()} className="mt-4 rounded-xl bg-background text-foreground px-4 py-2 text-sm font-semibold">Try again</button></div> : decision && <>
          <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-background/50">Decision {state.decision_count + 1}</span><span className="text-xs text-background/50">Up to +{decision.xp} XP</span></div>
          <h3 className="mt-5 text-xl font-semibold">{decision.title}</h3><p className="mt-2 text-sm leading-6 text-background/65">{decision.question}</p>
          <div className="mt-5 space-y-2.5">{decision.choices.map((item, index) => { const selected = choice === index; const strongest = choice !== null && index === decision.strongest_choice; return <button key={item} disabled={choice !== null || answering} onClick={() => void answer(index)} className={`w-full text-left rounded-2xl border p-4 text-sm transition ${selected ? "border-background bg-background/15" : "border-background/15 hover:bg-background/10"} ${strongest ? "ring-1 ring-background/40" : ""}`}><span className="font-medium">{String.fromCharCode(65 + index)}.</span><span className="ml-2 text-background/80">{item}</span></button>; })}</div>
          {choice !== null && <div className="mt-4 rounded-2xl border border-background/15 p-4"><div className="text-sm font-semibold">{choice === decision.strongest_choice ? "Strong strategic choice." : "There is another route worth considering."}</div><p className="mt-1 text-sm text-background/60">{decision.consequence[choice]}</p><p className="mt-3 text-sm text-background/75">{decision.lesson}</p><button onClick={() => void generateDecision()} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">Next decision <ArrowRight className="h-4 w-4" /></button></div>}
        </>}
      </div>
      <div className="p-6 md:p-8 bg-background/[0.03]"><div className="flex items-center gap-2"><Map className="h-4 w-4 text-background/55"/><span className="text-sm font-semibold">Your simulated life dashboard</span></div><div className="mt-5 space-y-4">{tracks.map(([label, Icon, value]) => <div key={label}><div className="flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-background/65"><Icon className="h-3.5 w-3.5"/>{label}</span><span className="text-background/45">{value}%</span></div><div className="mt-2 h-1.5 rounded-full bg-background/10 overflow-hidden"><div className="h-full rounded-full bg-background/75" style={{ width: `${value}%` }}/></div></div>)}</div><div className="mt-7 rounded-2xl border border-background/15 p-4"><div className="flex items-center gap-2 text-sm font-semibold"><Target className="h-4 w-4"/>Simulation rule</div><p className="mt-2 text-xs leading-5 text-background/55">The game models trade-offs using your Path data. It is educational, not a prediction of your real future.</p></div><Link to="/my-path" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">Turn lessons into your real Path <ArrowRight className="h-4 w-4"/></Link></div>
    </div>
  </section>;
}
