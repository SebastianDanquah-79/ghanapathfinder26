import { ArrowRight, Target, Route, CheckCircle2, Sparkles } from "@/lib/icons";

const steps = [
  { icon: Target, title: "Start", text: "Share your goal and where you are now." },
  { icon: Route, title: "Explore", text: "See education, career and opportunity routes." },
  { icon: Sparkles, title: "Adapt", text: "Compare routes when one path does not fit." },
  { icon: CheckCircle2, title: "Act", text: "Turn the best route into clear next steps." },
];

const DecisionPathway = () => (
  <section className="my-10 rounded-2xl border border-border bg-card/80 p-5 sm:p-6 shadow-sm">
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-primary mb-1">Your pathway</p>
        <h2 className="font-display text-xl font-bold text-foreground">From decision to direction</h2>
      </div>
      <p className="text-xs text-muted-foreground max-w-sm">A simple loop for making better education and career decisions without being locked into one route.</p>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <div key={step.title} className="relative rounded-xl border border-border bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">0{index + 1}</span>
            </div>
            <h3 className="font-semibold text-sm text-foreground mt-3">{step.title}</h3>
            <p className="text-xs leading-5 text-muted-foreground mt-1">{step.text}</p>
            {index < steps.length - 1 && <ArrowRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground bg-card rounded-full" />}
          </div>
        );
      })}
    </div>
  </section>
);

export default DecisionPathway;
