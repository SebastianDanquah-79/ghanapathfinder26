import { useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Circle, Compass, Flame, Quote, Sunrise } from "@/lib/icons";
import {
  JourneyInput,
  buildMilestones,
  getDailyMessage,
  getNextStep,
  getSmartMessages,
} from "@/lib/motivation";

const card = "bg-glass rounded-xl p-5";

const Bar = ({ value }: { value: number }) => (
  <div className="h-2 w-full rounded-full bg-secondary overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
    />
  </div>
);

const MotivationPanel = ({ data }: { data: JourneyInput }) => {
  const milestones = useMemo(() => buildMilestones(data), [data]);
  const done = milestones.filter((m) => m.done);
  const remaining = milestones.filter((m) => !m.done);
  const percent = Math.round((done.length / milestones.length) * 100);
  const nextStep = useMemo(() => getNextStep(data, milestones), [data, milestones]);
  const messages = useMemo(() => getSmartMessages(data), [data]);
  const daily = useMemo(() => getDailyMessage(), []);

  const internal = nextStep.href.startsWith("/") && !nextStep.href.startsWith("/#");

  return (
    <section aria-label="Motivation and progress" className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3 mb-5">
      {/* Your next step */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`${card} md:col-span-2 xl:col-span-1 border border-primary/25 bg-primary/5`}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5" /> Your next step
        </p>
        <h2 className="font-display font-semibold text-lg text-foreground mt-2 leading-snug break-words">
          {nextStep.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1.5">{nextStep.body}</p>
        {internal ? (
          <Link
            to={nextStep.href}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            {nextStep.cta} <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <a
            href={nextStep.href}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
          >
            {nextStep.cta} <ArrowRight className="h-4 w-4" />
          </a>
        )}
      </motion.div>

      {/* Today's motivation */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className={card}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Sunrise className="h-3.5 w-3.5 text-primary" /> Today's motivation
        </p>
        <p className="mt-3 text-base sm:text-lg font-display text-foreground leading-relaxed">{daily}</p>
      </motion.div>

      {/* Personalized encouragement */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className={card}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-primary" /> For you right now
        </p>
        <ul className="mt-3 space-y-2.5">
          {messages.slice(0, 3).map((m) => (
            <li key={m} className="text-sm text-foreground/90 leading-relaxed flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden />
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Your journey */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className={`${card} md:col-span-2 xl:col-span-3`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <h2 className="font-display font-semibold text-foreground">Your journey</h2>
          <span className="text-xs text-muted-foreground">
            {done.length} of {milestones.length} milestones · {percent}%
          </span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">
          Current goal:{" "}
          <span className="text-foreground font-medium">
            {data.targetCareer ? `Become a ${data.targetCareer}` : "Choose a career direction"}
          </span>
        </p>
        <Bar value={percent} />

        <div className="hscroll grid gap-x-6 gap-y-2 sm:grid-cols-2 mt-4">
          {milestones.map((m) => (
            <div key={m.key} className="flex items-start gap-2 text-sm py-0.5">
              {m.done ? (
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-0.5" aria-hidden />
              )}
              <span className={m.done ? "text-muted-foreground line-through" : "text-foreground"}>
                {m.label}
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          {remaining.length
            ? `${remaining.length} milestone${remaining.length === 1 ? "" : "s"} left , no rush, one at a time.`
            : "Every milestone is complete. You are genuinely ready , keep refining."}
        </p>
      </motion.div>

      {/* Inspiration teaser */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={`${card} md:col-span-2 xl:col-span-3 flex flex-col sm:flex-row sm:items-center gap-4 justify-between`}
      >
        <div className="flex gap-3">
          <Quote className="h-5 w-5 text-primary shrink-0" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Read how other Ghanaian students, graduates and founders got through the hard parts.
          </p>
        </div>
        <Link
          to="/inspiration"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 transition-colors shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring"
        >
          Open Inspiration <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
};

export default MotivationPanel;
