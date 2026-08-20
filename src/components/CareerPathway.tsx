import { Link } from "@/lib/router-compat";

export interface PathwayStep {
  label: string;
  detail: string;
  /** Internal route , makes the step clickable. */
  to?: string;
}

/**
 * Visual career pathway.
 * Mobile: vertical timeline. Desktop: stepped horizontal flow.
 */
const StepBody = ({ step, index }: { step: PathwayStep; index: number }) => (
  <>
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
      {index + 1}
    </span>
    <p className="mt-2 font-display text-sm font-semibold text-foreground">{step.label}</p>
    <p className="mt-1 text-xs leading-snug text-muted-foreground">{step.detail}</p>
    {step.to && <p className="mt-2 text-[11px] font-medium text-primary">Open →</p>}
  </>
);

const CareerPathway = ({ steps }: { steps: PathwayStep[] }) => (
  <div>
    {/* Mobile: vertical timeline */}
    <ol className="relative md:hidden">
      {steps.map((step, i) => (
        <li key={step.label} className="relative pl-6 pb-3 last:pb-0">
          <span
            aria-hidden
            className={`absolute left-[9px] top-6 bottom-0 w-px bg-border ${
              i === steps.length - 1 ? "hidden" : ""
            }`}
          />
          {step.to ? (
            <Link to={step.to} className="block rounded-xl bg-glass p-3 card-hover">
              <StepBody step={step} index={i} />
            </Link>
          ) : (
            <div className="rounded-xl bg-glass p-3">
              <StepBody step={step} index={i} />
            </div>
          )}
        </li>
      ))}
    </ol>

    {/* Desktop: stepped grid flow */}
    <ol className="hidden md:grid md:grid-cols-3 lg:grid-cols-5 gap-3">
      {steps.map((step, i) =>
        step.to ? (
          <li key={step.label}>
            <Link to={step.to} className="block h-full rounded-xl bg-glass p-3 card-hover">
              <StepBody step={step} index={i} />
            </Link>
          </li>
        ) : (
          <li key={step.label} className="h-full rounded-xl bg-glass p-3">
            <StepBody step={step} index={i} />
          </li>
        ),
      )}
    </ol>
  </div>
);

export default CareerPathway;
