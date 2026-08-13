import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "./SectionHeader";
import ShareButtons from "./ShareButtons";
import { useCutoffs } from "@/hooks/useAdmissionMatch";
import {
  CATEGORY_STYLES,
  evaluateAggregate,
  formatVerifiedDate,
} from "@/lib/admissionEngine";

const preferences = ["No Preference", "Public Only", "Private Only"] as const;

const CollegeRecommender = () => {
  const [form, setForm] = useState({ name: "", major: "", aggregate: "", preference: "No Preference" });
  const [submitted, setSubmitted] = useState<typeof form | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const { data: cutoffs = [], isLoading } = useCutoffs(submitted?.major ?? "");

  const ranked = useMemo(() => {
    if (!submitted) return [];
    const aggregate = Number(submitted.aggregate);
    if (!Number.isFinite(aggregate)) return [];
    return cutoffs
      .map((c) => ({ cutoff: c, match: evaluateAggregate(c.cut_off_aggregate, aggregate) }))
      .filter((r) => r.match.margin != null)
      .sort((a, b) => (b.match.margin ?? 0) - (a.match.margin ?? 0))
      .slice(0, 6);
  }, [cutoffs, submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted({ ...form });
  };

  return (
    <section id="recommender" className="py-20 lg:py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          badge="Verified cut-offs"
          title="Find Your Realistic"
          highlight="University Match"
          description="We rank programmes against official published cut-off aggregates only. Lower aggregates are stronger, and nothing here is invented."
        />

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-glass rounded-2xl p-6 sm:p-8 space-y-5 mb-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Your name</label>
              <input
                required
                value={form.name}
                maxLength={80}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Kwame Asante"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Programme or subject area
              </label>
              <input
                value={form.major}
                maxLength={60}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                placeholder="e.g. Computer Science, Nursing"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                WASSCE aggregate (lower is better)
              </label>
              <input
                required
                type="number"
                min={6}
                max={54}
                value={form.aggregate}
                onChange={(e) => setForm({ ...form, aggregate: e.target.value })}
                placeholder="e.g. 12"
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                University preference
              </label>
              <select
                value={form.preference}
                onChange={(e) => setForm({ ...form, preference: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {preferences.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Your career goal and interests do not change these results — only your grades against
            published cut-offs do.
          </p>

          <button
            type="submit"
            disabled={isLoading && !!submitted}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 glow-gold"
          >
            {isLoading && submitted ? (
              <><Loader2 className="h-5 w-5 animate-spin" /> Checking published cut-offs...</>
            ) : (
              <><Sparkles className="h-5 w-5" /> Get My Recommendations</>
            )}
          </button>
        </motion.form>

        {submitted && !isLoading && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-glass rounded-2xl p-6 sm:p-8"
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-1">
              Matches for {submitted.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Aggregate {submitted.aggregate} · ranked purely on academic fit against verified cut-offs.
            </p>

            {ranked.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                We do not hold a verified cut-off for that programme yet, so we will not guess.
                Try a broader subject area, or browse the{" "}
                <Link to="/admission-match" className="text-primary font-medium">
                  Admission Match tool
                </Link>{" "}
                to see every programme we have official data for.
              </p>
            ) : (
              <div className="space-y-3">
                {ranked.map(({ cutoff, match }) => (
                  <div key={cutoff.id} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">{cutoff.programme_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {cutoff.universities?.name ?? "University"} · {cutoff.academic_year} ·{" "}
                          {cutoff.applicant_category}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${CATEGORY_STYLES[match.category]}`}
                      >
                        {match.category}
                        {match.confidence != null ? ` · ${match.confidence}%` : ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{match.explanation}</p>
                    {cutoff.subject_requirements && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Subject requirement: {cutoff.subject_requirements}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <span className="text-[11px] text-muted-foreground">
                        Verified {formatVerifiedDate(cutoff.last_verified_at)}
                      </span>
                      {cutoff.official_source_url && (
                        <a
                          href={cutoff.official_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary"
                        >
                          {cutoff.source_name ?? "Official source"}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-5">
              Cut-offs shift each year with applicant numbers. For a full check that also enforces
              subject requirements, sign in and use the{" "}
              <Link to="/admission-match" className="text-primary font-medium">Admission Match</Link>{" "}
              tool.
            </p>

            {ranked.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <ShareButtons studentName={submitted.name} resultRef={resultRef} />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CollegeRecommender;
