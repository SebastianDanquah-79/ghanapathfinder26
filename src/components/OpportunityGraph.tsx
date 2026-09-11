import { useMemo } from "react";
import { ArrowRight, Award, BookOpen, Briefcase, CheckCircle2, CircleDollarSign, GraduationCap, Target, Wrench } from "@/lib/icons";
import { Link } from "@/lib/router-compat";

type OpportunityGraphProps = {
  goal: string;
  routes: string[];
  savedCounts: { university: number; scholarship: number; internship: number };
};

type GraphNode = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: typeof Target;
  state: "active" | "ready" | "open";
};

const OpportunityGraph = ({ goal, routes, savedCounts }: OpportunityGraphProps) => {
  const activeGoal = goal.trim() || "your target career";
  const graph = useMemo<GraphNode[]>(() => [
    { id: "destination", label: activeGoal, description: "Your destination. Every recommendation should connect back to this outcome.", href: "/career-path", icon: Target, state: goal.trim() ? "active" : "open" },
    { id: "education", label: "Education routes", description: `${routes.slice(0, 2).join(" or ")} and other routes worth comparing.`, href: "/compare", icon: GraduationCap, state: savedCounts.university >= 2 ? "ready" : "open" },
    { id: "skills", label: "Skills + projects", description: "Build evidence that proves you can do the work, not just study it.", href: "/skills", icon: Wrench, state: "open" },
    { id: "funding", label: "Funding", description: "Scholarships and affordability should be part of the decision, not an afterthought.", href: "/scholarships", icon: CircleDollarSign, state: savedCounts.scholarship > 0 ? "ready" : "open" },
    { id: "experience", label: "Experience", description: "Internships, projects and opportunities that turn learning into evidence.", href: "/internships", icon: Briefcase, state: savedCounts.internship > 0 ? "ready" : "open" },
    { id: "next", label: "Next opportunity", description: "Choose the highest-value action you can take now.", href: "/applications", icon: Award, state: "active" },
  ], [activeGoal, goal, routes, savedCounts]);

  const completed = graph.filter((node) => node.state === "ready").length;
  const score = Math.round((completed / 4) * 100);

  return (
    <section className="rounded-2xl border border-border bg-glass p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.16em] text-primary font-semibold">Opportunity Graph</p>
          <h2 className="font-display text-xl sm:text-2xl font-semibold mt-1">Connect the decisions, not just the pages.</h2>
          <p className="text-sm text-muted-foreground mt-2">GhanaPathFinder should understand how a career connects to education, skills, funding, experience and the next opportunity. This is the foundation of that system.</p>
        </div>
        <div className="rounded-xl border border-border bg-secondary/40 px-4 py-3 min-w-[150px]">
          <p className="text-xs text-muted-foreground">Path readiness</p>
          <p className="font-display text-2xl font-bold mt-0.5">{score}%</p>
        </div>
      </div>

      <div className="relative mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {graph.map((node, index) => {
          const Icon = node.icon;
          const isReady = node.state === "ready";
          return (
            <Link key={node.id} to={node.href} className="group rounded-xl border border-border/70 bg-secondary/20 p-4 hover:border-primary/40 hover:bg-secondary/40 transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${node.state === "active" ? "bg-primary text-primary-foreground" : "bg-background text-primary"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                {isReady ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <span className="text-[11px] text-muted-foreground">0{index + 1}</span>}
              </div>
              <h3 className="text-sm font-semibold mt-3 text-foreground">{node.label}</h3>
              <p className="text-xs leading-5 text-muted-foreground mt-1.5">{node.description}</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mt-3">Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-border/70 bg-background/50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">The product principle</p>
          <p className="text-xs text-muted-foreground mt-1">Every recommendation should answer: why this, what does it unlock, what could block it, and what should happen next?</p>
        </div>
        <Link to="/career-path" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 min-h-[42px] text-sm font-semibold text-primary-foreground shrink-0">Build the path <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  );
};

export default OpportunityGraph;
