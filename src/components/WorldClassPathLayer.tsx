import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import DecisionEnginePanel from "@/components/DecisionEnginePanel";

const STORAGE_KEY = "ghanapathfinder-my-path-v1";

export default function WorldClassPathLayer() {
  const [state, setState] = useState<{ goal?: string; stage?: string; priority?: string; budget?: string }>({});

  useEffect(() => {
    try {
      setState(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"));
    } catch {
      setState({});
    }
  }, []);

  const budget = useMemo(() => {
    const raw = (state.budget || "").replace(/[^0-9.]/g, "");
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : undefined;
  }, [state.budget]);

  const profile = {
    goal: state.goal || "your target career",
    stage: state.stage || "WASSCE graduate",
    priority: state.priority || "Career outcomes",
    budget,
  };

  return (
    <div className="space-y-5">
      <DecisionEnginePanel profile={profile} />

      <section className="rounded-2xl border border-border bg-glass p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-primary">Decision quality</p>
            <h2 className="font-display text-xl font-semibold mt-1">Before you commit, verify the decision.</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">GhanaPathFinder should help you make better decisions, not make them for you. Check accreditation, entry requirements, total cost, deadlines and the real career outcome before applying.</p>
          </div>
          <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mt-5">
          {["Accreditation", "Entry requirements", "Total cost", "Career outcome"].map((item) => (
            <Link key={item} to={item === "Accreditation" ? "/professional-councils" : item === "Entry requirements" ? "/admission-match" : item === "Total cost" ? "/scholarships" : "/careers"} className="group rounded-xl border border-border/70 bg-secondary/20 p-3">
              <div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{item}</span><CheckCircle2 className="h-4 w-4 text-primary" /></div>
              <p className="text-xs text-muted-foreground mt-1">Check before you commit.</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2">Review <ArrowRight className="h-3.5 w-3.5" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-glass p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-primary">GhanaPathFinder standard</p>
            <h2 className="font-display text-xl font-semibold mt-1">One decision should unlock the next ten.</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">A career choice should connect to programmes, institutions, funding, skills, projects, experience, applications and long-term opportunities. That connected graph is the product we are building.</p>
          </div>
          <Link to="/career-path" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 min-h-[44px] text-sm font-semibold text-primary-foreground">Build the route <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
