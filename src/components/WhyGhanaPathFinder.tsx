import { motion } from "framer-motion";
import { Compass, ShieldCheck, GitBranch, Briefcase } from "@/lib/icons";
import SectionHeader from "./SectionHeader";

const reasons = [
  { icon: Compass, title: "Built for Ghana", text: "Admissions, WASSCE rules, scholarships and career options are organised around the Ghanaian system." },
  { icon: GitBranch, title: "More than one route", text: "If one door closes, see realistic alternatives instead of being told your future is over." },
  { icon: ShieldCheck, title: "Source-first decisions", text: "We point you back to official institutions and requirements before you make a high-stakes choice." },
  { icon: Briefcase, title: "Life after school", text: "Connect education to skills, internships, careers, entrepreneurship and the next decision that follows." },
];

const WhyGhanaPathFinder = () => (
  <section id="why-us" className="py-12 lg:py-24 px-4 border-y border-border bg-card/20">
    <div className="max-w-6xl mx-auto">
      <SectionHeader badge="Why GhanaPathFinder" title="Don't just choose a school." highlight="Choose a direction." description="Other directories help you find institutions. GhanaPathFinder is designed to help you understand what comes next." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {reasons.map((reason, i) => (
          <motion.article key={reason.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.35 }} className="rounded-xl border border-border bg-background p-5">
            <div className="h-10 w-10 rounded-lg bg-primary/10 grid place-items-center mb-4"><reason.icon className="h-5 w-5 text-primary" /></div>
            <h3 className="font-display font-semibold text-foreground">{reason.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{reason.text}</p>
          </motion.article>
        ))}
      </div>
    </div>
  </section>
);

export default WhyGhanaPathFinder;
