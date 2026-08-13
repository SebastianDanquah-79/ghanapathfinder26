import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Award,
  CalendarDays,
  Wallet,
  GraduationCap,
  ChevronDown,
  Lightbulb,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { scholarshipTips } from "@/data/scholarships";
import SectionHeader from "./SectionHeader";
import SaveButton from "./SaveButton";
import OfficialLink from "./OfficialLink";
import { formatVerified, useScholarshipRecords } from "@/hooks/useCatalogue";

const types = ["All", "Government", "University", "Private", "International"] as const;

const ScholarshipSection = () => {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState<(typeof types)[number]>("All");
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, refetch } = useScholarshipRecords(debounced, typeFilter);
  const rows = data ?? [];

  return (
    <section id="scholarships" className="py-12 lg:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badge="Funding"
          title="Scholarships &"
          highlight="Financial Aid"
          description="Who they're for, what they cover, how to apply."
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-7 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search scholarships, providers, eligibility..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search scholarships"
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

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading scholarships…
          </div>
        )}

        {isError && (
          <div className="text-center py-10">
            <p className="text-sm text-muted-foreground mb-3">
              Something went wrong loading this information. Please try again.
            </p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && rows.length === 0 && (
          <p className="text-center py-10 text-muted-foreground">
            No scholarships found. Try another provider, level or keyword.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {rows.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.4 }}
              className="bg-glass rounded-xl p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-base text-foreground break-words">
                    {s.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">{s.provider}</p>
                </div>
                <span className="shrink-0 px-2 py-1 rounded text-xs font-medium bg-primary/15 text-primary">
                  {s.type}
                </span>
              </div>

              <div className="space-y-2 text-xs text-muted-foreground mb-4">
                {s.coverage && (
                  <p className="flex items-start gap-2">
                    <Wallet className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> {s.coverage}
                  </p>
                )}
                {s.study_level && (
                  <p className="flex items-start gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> {s.study_level}
                  </p>
                )}
                {s.deadline_text && (
                  <p className="flex items-start gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> {s.deadline_text}
                  </p>
                )}
                {s.eligibility && (
                  <p className="flex items-start gap-2">
                    <Award className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" /> {s.eligibility}
                  </p>
                )}
              </div>

              <button
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary mb-3"
                aria-expanded={expanded === s.id}
              >
                How to apply
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${expanded === s.id ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence initial={false}>
                {expanded === s.id && (
                  <motion.p
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="text-xs text-muted-foreground leading-relaxed overflow-hidden mb-3"
                  >
                    {s.how_to_apply}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex flex-wrap items-center gap-2 mt-auto">
                <SaveButton
                  item={{
                    item_type: "scholarship",
                    item_key: s.slug,
                    title: s.name,
                    subtitle: s.provider,
                    metadata: {
                      deadline_text: s.deadline_text,
                      coverage: s.coverage,
                      application_url: s.application_url ?? s.website_url,
                    },
                  }}
                />
                <OfficialLink
                  href={s.application_url}
                  label="Apply now"
                  fallbackNote="There is no verified application link for this award right now. Check the provider's official website or your school's scholarship office."
                  variant="ghost"
                />
                <OfficialLink href={s.website_url} label="Official info" variant="ghost" />
              </div>

              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-3">
                <ShieldCheck
                  className={`h-3 w-3 ${s.verified ? "text-ghana-green" : "text-muted-foreground"}`}
                />
                {s.verified ? formatVerified(s.last_verified_at) : "Link not verified — confirm with the provider"}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 bg-glass rounded-xl p-5">
          <h3 className="flex items-center gap-2 font-display font-semibold text-foreground mb-3">
            <Lightbulb className="h-4 w-4 text-primary" /> Scholarship tips
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {scholarshipTips.map((tip) => (
              <li key={tip} className="text-xs text-muted-foreground leading-relaxed">
                • {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipSection;
