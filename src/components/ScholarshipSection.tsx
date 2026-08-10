import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Award,
  CalendarDays,
  Wallet,
  GraduationCap,
  ChevronDown,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import { scholarships, scholarshipTips } from "@/data/scholarships";
import SectionHeader from "./SectionHeader";

const types = ["All", "Government", "University", "Private", "International"] as const;

const ScholarshipSection = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof types)[number]>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return scholarships.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.level.toLowerCase().includes(q) ||
        s.eligibility.toLowerCase().includes(q);
      const matchType = typeFilter === "All" || s.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  return (
    <section id="scholarships" className="py-20 lg:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badge="Funding"
          title="Scholarships &"
          highlight="Financial Aid"
          description="Real funding options for Ghanaian students — who they're for, what they cover, and exactly how to apply."
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search scholarships, providers, eligibility..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  typeFilter === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((s, i) => {
            const isOpen = expanded === s.name;
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.05, duration: 0.4 }}
                className="bg-glass rounded-xl p-6 card-hover flex flex-col"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-display font-semibold text-base text-foreground leading-snug">
                      {s.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{s.provider}</p>
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded text-[11px] font-medium bg-primary/20 text-primary">
                    {s.type}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  <div className="flex items-start gap-1.5">
                    <Wallet className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{s.coverage}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{s.level}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                    <span>{s.deadline}</span>
                  </div>
                </div>

                <button
                  onClick={() => setExpanded(isOpen ? null : s.name)}
                  className="mt-auto flex items-center justify-between w-full text-xs font-medium text-primary"
                >
                  {isOpen ? "Hide details" : "Eligibility & how to apply"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-border space-y-3 text-xs text-muted-foreground leading-relaxed">
                        <p>
                          <span className="text-foreground font-medium">Who qualifies: </span>
                          {s.eligibility}
                        </p>
                        <p>
                          <span className="text-foreground font-medium">How to apply: </span>
                          {s.howToApply}
                        </p>
                        {s.link && (
                          <a
                            href={s.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary hover:underline"
                          >
                            Official page <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">
            No scholarships match that search yet — try a different keyword.
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-glass rounded-2xl p-6 sm:p-8 mt-12"
        >
          <div className="flex items-center gap-2 mb-5">
            <Lightbulb className="h-5 w-5 text-primary" />
            <h3 className="font-display font-semibold text-lg text-foreground">
              How to actually win a scholarship
            </h3>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scholarshipTips.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <Award className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default ScholarshipSection;
