import { motion } from "framer-motion";
import { BookOpen, Users, Code, Rocket, CalendarClock } from "@/lib/icons";
import SectionHeader from "./SectionHeader";

const stages = [
  { year: "Months 0–6", title: "Learn + ship", icon: BookOpen, hours: "8–15 focused hours/week", items: ["Learn one technical or business skill deeply enough to build with it", "Spend more time making small things than collecting courses", "Interview people with the problem before writing a big product", "Expect confusing weeks, bad prototypes and ideas that go nowhere"] },
  { year: "Months 6–18", title: "Find the problem", icon: Users, hours: "10–20 focused hours/week", items: ["Build small experiments and put them in front of real users", "Talk to 20–50 potential users before assuming you know what they want", "Learn sales, distribution and basic unit economics alongside product", "Expect rejection, slow growth and long stretches with little visible progress"] },
  { year: "Months 18–36", title: "Build the company", icon: Code, hours: "15–30 focused hours/week", items: ["Choose a narrow problem where users will actually pay or strongly return", "Measure activation, retention, revenue and customer feedback instead of vanity numbers", "Find complementary teammates and write down who owns what", "Expect technical debt, customer churn, funding pressure and pivots"] },
  { year: "36+ months", title: "Scale carefully", icon: Rocket, hours: "Variable — protect deep-work time", items: ["Build repeatable distribution before adding complexity", "Hire only when a role has a clear, measurable outcome", "Protect cash, customer trust and product quality while growing", "Remember that fundraising is not the business; customers and execution are"] },
];

const StartupRoadmap = () => (
  <section id="roadmap" className="py-12 lg:py-28 px-4">
    <div className="max-w-5xl mx-auto">
      <SectionHeader badge="Founder reality" title="Building a startup is a" highlight="long game" description="There is no magic number of hours or guaranteed four-year launch. Build around school or work, then increase intensity when the evidence says the idea deserves it." />
      <div className="grid gap-5 md:grid-cols-[1fr_280px] items-start mb-8">
        <div className="rounded-xl border border-border bg-background p-5 sm:p-6"><div className="flex items-center gap-3 mb-4"><CalendarClock className="h-5 w-5 text-primary" /><h3 className="font-display font-semibold text-foreground">A realistic weekly baseline</h3></div><p className="text-sm leading-relaxed text-muted-foreground">Consistency beats heroic bursts. For a student, 8–15 serious hours each week is already meaningful. During exams, it can drop. During a focused build sprint, it can rise. The important metric is useful output over months, not exhaustion in a weekend.</p></div>
        <div className="rounded-xl overflow-hidden border border-border bg-card"><img src="https://commons.wikimedia.org/wiki/Special:Redirect/file/Peter%20Thiel.jpg" alt="Peter Thiel" loading="lazy" className="w-full h-44 object-cover object-center" /><div className="p-4"><p className="text-xs font-semibold text-foreground">Think in decades</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">Peter Thiel is a useful case study in long-horizon company building. Learn from the principle, not the personality.</p><a href="https://commons.wikimedia.org/wiki/File:Peter_Thiel.jpg" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-[11px] text-muted-foreground hover:text-primary">Photo: David Orban, CC BY 2.0</a></div></div>
      </div>
      <div className="space-y-4">{stages.map((stage, i) => <motion.article key={stage.year} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.35 }} className="rounded-xl border border-border bg-glass p-5 sm:p-6"><div className="flex flex-col sm:flex-row sm:items-start gap-4"><div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><stage.icon className="h-5 w-5 text-primary" /></div><div className="flex-1"><div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"><div><span className="text-xs font-semibold text-primary uppercase tracking-wider">{stage.year}</span><h3 className="font-display font-bold text-lg text-foreground">{stage.title}</h3></div><span className="text-xs text-muted-foreground">{stage.hours}</span></div><ul className="mt-4 grid gap-2 sm:grid-cols-2">{stage.items.map((item) => <li key={item} className="text-sm leading-relaxed text-muted-foreground pl-4 relative"><span className="absolute left-0 top-2 w-1.5 h-1.5 rounded-full bg-primary" />{item}</li>)}</ul></div></div></motion.article>)}</div>
    </div>
  </section>
);

export default StartupRoadmap;
