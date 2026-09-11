import { Link } from "@/lib/router-compat";
import { ArrowRight, Briefcase, CheckCircle2, Compass, GraduationCap, Sparkles, Target } from "@/lib/icons";

const steps = [
  { title: "Choose a destination", text: "Start with the career, programme or future you want to reach.", icon: Target },
  { title: "Compare your routes", text: "See universities, programmes, costs, skills and alternative pathways together.", icon: Compass },
  { title: "Build the missing pieces", text: "Turn your goal into skills, projects and experience you can actually work on.", icon: Briefcase },
  { title: "Take the next step", text: "Save options, track applications and keep moving instead of starting over.", icon: CheckCircle2 },
];

const PathfinderDecisionHub = () => (
  <section aria-labelledby="pathfinder-hub" className="border-y border-border bg-card/40">
    <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Your path, not just your options
          </div>
          <h2 id="pathfinder-hub" className="mt-4 max-w-2xl font-display text-2xl font-semibold tracking-tight text-foreground md:text-4xl">
            Turn one big decision into a path you can actually follow.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            GhanaPathFinder connects education, careers, skills, funding and real opportunities so you can move from where you are to where you want to go.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Build My Path
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/career-path"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              Explore a career path
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5 shadow-sm md:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How it works</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-foreground">From decision to direction</h3>
            </div>
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <div className="divide-y divide-border">
            {steps.map(({ title, text, icon: Icon }, index) => (
              <div key={title} className="flex gap-4 py-4 first:pt-5 last:pb-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/5 text-sm font-bold text-primary">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default PathfinderDecisionHub;
