import { motion } from "framer-motion";
import { BookOpen, Users, Code, Rocket } from "lucide-react";
import SectionHeader from "./SectionHeader";

const years = [
  {
    year: "Year 1",
    title: "Foundation",
    icon: BookOpen,
    color: "from-primary/20 to-primary/5",
    items: [
      "Develop a growth mindset — read 'The Lean Startup' and 'Zero to One'",
      "Join entrepreneurship clubs and attend campus talks",
      "Learn a practical skill: coding, design, or digital marketing",
      "Start following Ghana's startup ecosystem (Twitter, LinkedIn)",
      "Build relationships with 5+ people who inspire you",
    ],
  },
  {
    year: "Year 2",
    title: "Exploration",
    icon: Users,
    color: "from-ghana-green/20 to-ghana-green/5",
    items: [
      "Start a small side project — solve a real problem you see daily",
      "Find a potential co-founder with complementary skills",
      "Participate in your first hackathon (KNUST, Ashesi, or virtual)",
      "Intern at a Ghanaian startup to learn how they operate",
      "Start building your personal brand on LinkedIn and Twitter",
    ],
  },
  {
    year: "Year 3",
    title: "Building",
    icon: Code,
    color: "from-primary/20 to-primary/5",
    items: [
      "Build your MVP — the simplest version that works",
      "Talk to 50+ potential customers and validate your idea",
      "Apply for grants: Tony Elumelu Foundation, Ghana Innovation Hub",
      "Join an incubator or accelerator program",
      "Start tracking metrics and learning from user feedback",
    ],
  },
  {
    year: "Year 4",
    title: "Launch",
    icon: Rocket,
    color: "from-ghana-gold/20 to-ghana-gold/5",
    items: [
      "Launch publicly — even if it's not perfect",
      "Enter pitch competitions: Seedstars, Ghana Startup Awards",
      "Map out Ghana's ecosystem: investors, mentors, partners",
      "Plan your post-graduation path: full-time startup or hybrid",
      "Document and share your journey to inspire others",
    ],
  },
];

const StartupRoadmap = () => (
  <section id="roadmap" className="py-20 lg:py-28 px-4">
    <div className="max-w-5xl mx-auto">
      <SectionHeader
        badge="Your 4-Year Plan"
        title="Startup Preparation"
        highlight="Roadmap"
        description="A year-by-year guide to go from student to founder while still at university."
      />

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-ghana-green to-primary/20 hidden md:block" />

        <div className="space-y-8">
          {years.map((y, i) => (
            <motion.div
              key={y.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="relative md:pl-16"
            >
              {/* Timeline dot */}
              <div className="absolute left-4 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background hidden md:block" />

              <div className={`bg-glass rounded-xl p-6 sm:p-8 bg-gradient-to-br ${y.color}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <y.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{y.year}</span>
                    <h3 className="font-display font-bold text-lg text-foreground">{y.title}</h3>
                  </div>
                </div>
                <ul className="space-y-3">
                  {y.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default StartupRoadmap;
