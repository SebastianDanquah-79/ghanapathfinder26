import { ArrowRight, CheckCircle2, ShieldCheck } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import { buildDecision, nextBestActions, type DecisionProfile } from "@/lib/decisionEngine";

type Props = { profile: DecisionProfile };

export default function DecisionEnginePanel({ profile }: Props) {
  const options = buildDecision(profile);
  const actions = nextBestActions(profile, options);

  return (
    <section className="rounded-2xl border border-border bg-glass p-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-primary">Decision Engine</p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold mt-1">Compare paths, not just programmes.</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl">GhanaPathFinder weighs your destination, priorities and current progress to show what to investigate first. Every recommendation stays explainable.</p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4 text-primary" /> Source checks still matter</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-3 mt-5">
        {options.map((option, index) => (
          <article key={option.name} className={`rounded-xl border p-4 ${index === 0 ? "border-primary/40 bg-primary/5" : "border-border/70 bg-secondary/20"}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Route {index + 1}</span>
                <h3 className="text-sm font-semibold mt-1">{option.name}</h3>
              </div>
              <div className="text-right"><span className="font-display text-xl font-bold">{option.fit}</span><span className="block text-[10px] text-muted-foreground">fit / 100</span></div>
            </div>
            <p className="text-xs text-muted-foreground mt-3">{option.reason}</p>
            <div className="mt-3 space-y-1.5">
              {option.strengths.slice(0, 2).map((item) => <p key={item} className="flex gap-2 text-xs text-foreground"><CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />{item}</p>)}
            </div>
            <p className="text-xs text-muted-foreground mt-3"><span className="font-semibold text-foreground">Watch:</span> {option.watchouts[0]}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 border-t border-border/70 pt-5">
        <div className="flex items-center justify-between gap-3"><div><p className="text-xs uppercase tracking-wide text-muted-foreground">Next best actions</p><h3 className="font-display text-lg font-semibold mt-1">What to do now</h3></div><Link to="/career-path" className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Refine your destination <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2.5 mt-3">
          {actions.map((action) => <Link key={action.title} to={action.href} className="group rounded-xl border border-border/70 bg-secondary/20 p-3 hover:border-primary/40 transition-colors"><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{action.title}</span><span className="text-[10px] uppercase tracking-wide text-muted-foreground">{action.urgency}</span></div><p className="text-xs text-muted-foreground mt-1">{action.detail}</p><span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2">Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span></Link>)}
        </div>
      </div>
    </section>
  );
}
