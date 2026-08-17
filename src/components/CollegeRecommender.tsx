import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ExternalLink, Info, Lock } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import SectionHeader from "./SectionHeader";
import ShareButtons from "./ShareButtons";
import UsageCounter from "./UsageCounter";
import { useAggregateRecommendations } from "@/hooks/useAdmissionReference";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORY_STYLES, diversify, formatVerifiedDate } from "@/lib/admissionEngine";
import { track } from "@/lib/analytics";

const preferences = ["No Preference", "Public Only", "Private Only"] as const;

const CollegeRecommender = () => {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ name: "", major: "", aggregate: "", preference: "No Preference" });
  const [submitted, setSubmitted] = useState<typeof form | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const aggregate = submitted && Number.isFinite(Number(submitted.aggregate))
    ? Number(submitted.aggregate)
    : null;

  const { matches, isLoading } = useAggregateRecommendations(
    aggregate,
    submitted?.major ?? "",
    !!submitted,
  );

  const ranked = useMemo(() => {
    if (!submitted) return [];
    const pref = submitted.preference;
    const filtered = matches.filter((m) => {
      if (m.category === "Not Eligible" || m.category === "Insufficient Data") return false;
      if (pref === "Public Only") return m.reference.university_type === "Public";
      if (pref === "Private Only") return m.reference.university_type === "Private";
      return true;
    });
    return diversify(filtered, 2, 12);
  }, [matches, submitted]);

  useEffect(() => {
    if (submitted && !isLoading) void track("recommendation_run");
  }, [submitted, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return; // recommendations require a signed-in account
    setSubmitted({ ...form });
  };

  return (
    <section id="recommender" className="py-12 lg:py-28 px-4">
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          badge="Every accredited institution"
          title="Find Your Realistic"
          highlight="University Match"
          description="Ranked against official published cut-offs, and clearly-labelled estimated ranges where an institution has not published one. Lower aggregate is stronger."
        />

        <div className="flex justify-center mb-6">
          <UsageCounter />
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-glass rounded-2xl p-5 sm:p-6 space-y-5 mb-6"
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
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
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
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
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
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                University preference
              </label>
              <select
                value={form.preference}
                onChange={(e) => setForm({ ...form, preference: e.target.value })}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50"
              >
                {preferences.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Your career goal and interests do not change these results , only your grades against
            published cut-offs, or evidence-based estimated ranges, do.
          </p>

          {!authLoading && !user ? (
            <div className="rounded-lg border border-border bg-muted/60 p-4 text-center space-y-3">
              <p className="text-sm text-foreground font-medium flex items-center justify-center gap-2">
                <Lock className="h-4 w-4 text-primary" /> Sign in to see your recommendations
              </p>
              <p className="text-xs text-muted-foreground">
                Your matches are saved to your account so you can come back to them on any device.
              </p>
              <Link
                to="/auth"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"
              >
                <Sparkles className="h-5 w-5" /> Sign in to continue
              </Link>
            </div>
          ) : (
            <button
              type="submit"
              disabled={authLoading || (isLoading && !!submitted)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 glow-gold"
            >
              {isLoading && submitted ? (
                <><Loader2 className="h-5 w-5 animate-spin" /> Searching every accredited institution...</>
              ) : (
                <><Sparkles className="h-5 w-5" /> Get My Recommendations</>
              )}
            </button>
          )}
        </motion.form>

        {submitted && !isLoading && (
          <motion.div
            ref={resultRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-glass rounded-2xl p-5 sm:p-6"
          >
            <h3 className="font-display font-semibold text-lg text-foreground mb-1">
              Matches for {submitted.name}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Aggregate {submitted.aggregate} · ranked purely on academic fit across{" "}
              {new Set(matches.map((m) => m.reference.university_id)).size} institutions.
            </p>

            {ranked.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                We could not find a realistic option for that search. Try a broader subject area, or
                browse the{" "}
                <Link to="/admission-match" className="text-primary font-medium">
                  Admission Match tool
                </Link>{" "}
                to see every programme in the database.
              </p>
            ) : (
              <div className="space-y-3">
                {ranked.map(({ reference: r, category, confidence, why, benchmarkLabel, benchmarkKind, gaps }) => (
                  <div key={r.programme_id} className="rounded-xl border border-border bg-background/40 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-foreground text-sm">{r.programme_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {r.university_name} · {r.university_category} · {r.region ?? "Ghana"}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${CATEGORY_STYLES[category]}`}
                      >
                        {category}
                        {confidence != null ? ` · ${confidence}%` : ""}
                      </span>
                    </div>

                    <dl className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
                      <div>
                        <dt className="text-muted-foreground">Your aggregate</dt>
                        <dd className="text-foreground font-semibold">{submitted.aggregate}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">{benchmarkKind}</dt>
                        <dd className="text-foreground font-semibold">{benchmarkLabel}</dd>
                      </div>
                    </dl>

                    <p className="text-xs text-muted-foreground mt-2">{why}</p>

                    {r.basis === "estimated" && r.estimate_method && (
                      <p className="text-[11px] text-muted-foreground mt-1 flex gap-1.5">
                        <Info className="h-3 w-3 shrink-0 mt-0.5" />
                        <span>Method: {r.estimate_method}</span>
                      </p>
                    )}
                    {gaps.slice(0, 1).map((g) => (
                      <p key={g} className="text-[11px] text-ghana-gold mt-1">! {g}</p>
                    ))}

                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      {r.basis === "official" && (
                        <span className="text-[11px] text-muted-foreground">
                          Verified {formatVerifiedDate(r.last_verified_at)}
                        </span>
                      )}
                      {r.official_source_url && (
                        <a
                          href={r.official_source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-primary"
                        >
                          {r.source_name ?? "Official source"}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <Link
                        to={`/programme/${r.programme_slug}`}
                        className="text-[11px] text-primary font-medium"
                      >
                        Programme details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-5">
              Estimated ranges are derived from officially published cut-offs for comparable
              programmes and published entry requirements , they are not official figures. For a full
              check that also enforces subject requirements, sign in and use the{" "}
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
