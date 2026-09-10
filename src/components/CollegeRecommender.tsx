import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, ExternalLink, Info, Lock, ArrowRight } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import SectionHeader from "./SectionHeader";
import ShareButtons from "./ShareButtons";
import UsageCounter from "./UsageCounter";
import { useAggregateRecommendations } from "@/hooks/useAdmissionReference";
import { useAuth } from "@/hooks/useAuth";
import { CATEGORY_STYLES, diversify, formatVerifiedDate } from "@/lib/admissionEngine";
import { buildAlternativePathways, pathwaySignal, type WASSCEGrade } from "@/lib/pathwayEngine";
import { track } from "@/lib/analytics";

const preferences = ["No Preference", "Public Only", "Private Only"] as const;
const grades: Array<WASSCEGrade | ""> = ["", "A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

const CollegeRecommender = () => {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({
    name: "",
    major: "",
    aggregate: "",
    preference: "No Preference",
    english: "" as WASSCEGrade | "",
    mathematics: "" as WASSCEGrade | "",
    science: "" as WASSCEGrade | "",
  });
  const [submitted, setSubmitted] = useState<typeof form | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const aggregate = submitted && Number.isFinite(Number(submitted.aggregate)) ? Number(submitted.aggregate) : null;
  const { matches, isLoading } = useAggregateRecommendations(aggregate, submitted?.major ?? "", !!submitted);

  const ranked = useMemo(() => {
    if (!submitted) return [];
    const filtered = matches.filter((m) => {
      if (m.category === "Not Eligible" || m.category === "Insufficient Data") return false;
      if (submitted.preference === "Public Only") return m.reference.university_type === "Public";
      if (submitted.preference === "Private Only") return m.reference.university_type === "Private";
      return true;
    });
    return diversify(filtered, 2, 12);
  }, [matches, submitted]);

  const pathways = submitted ? buildAlternativePathways({
    destination: submitted.major,
    english: submitted.english,
    mathematics: submitted.mathematics,
    science: submitted.science,
  }) : [];

  const signal = submitted ? pathwaySignal({
    destination: submitted.major,
    english: submitted.english,
    mathematics: submitted.mathematics,
    science: submitted.science,
  }) : null;

  useEffect(() => {
    if (submitted && !isLoading) void track("recommendation_run");
  }, [submitted, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitted({ ...form });
  };

  return (
    <section id="recommender" className="py-12 lg:py-28 px-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeader
          badge="Every accredited institution"
          title="Find Your Realistic"
          highlight="University Match"
          description="Grades are one part of the picture. We show direct-entry matches, then help you find alternative routes when a particular grade blocks the first door."
        />

        <div className="flex justify-center mb-6"><UsageCounter /></div>

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
              <input required value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Kwame Asante" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Destination programme or career</label>
              <input value={form.major} maxLength={80} onChange={(e) => setForm({ ...form, major: e.target.value })} placeholder="e.g. Computer Science, Nursing, Software Engineer" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">WASSCE aggregate</label>
              <input required type="number" min={6} max={54} value={form.aggregate} onChange={(e) => setForm({ ...form, aggregate: e.target.value })} placeholder="e.g. 12" className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">University preference</label>
              <select value={form.preference} onChange={(e) => setForm({ ...form, preference: e.target.value })} className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50">
                {preferences.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="border-t border-border/60 pt-5">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Optional subject detail</p>
                <p className="text-xs text-muted-foreground mt-1">Add core grades if you want the engine to identify blocked doors and alternative routes.</p>
              </div>
              <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">Recommended</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {([['english', 'English Language'], ['mathematics', 'Core Mathematics'], ['science', 'Integrated Science']] as const).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
                  <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value as WASSCEGrade | "" })} className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50">
                    {grades.map((g) => <option key={g || 'blank'} value={g}>{g || "Not entered"}</option>)}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">A D7/E8 can make a specific direct-entry programme unavailable, but it should not be treated as a verdict on the student's destination. Where evidence supports another route, we show the bridge instead of ending the journey.</p>

          {!authLoading && !user ? (
            <div className="rounded-lg border border-border bg-muted/60 p-4 text-center space-y-3">
              <p className="text-sm text-foreground font-medium flex items-center justify-center gap-2"><Lock className="h-4 w-4 text-primary" /> Sign in to see your recommendations</p>
              <p className="text-xs text-muted-foreground">Your matches are saved to your account so you can come back to them on any device.</p>
              <Link to="/auth" className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity"><Sparkles className="h-5 w-5" /> Sign in to continue</Link>
            </div>
          ) : (
            <button type="submit" disabled={authLoading || (isLoading && !!submitted)} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 glow-gold">
              {isLoading && submitted ? <><Loader2 className="h-5 w-5 animate-spin" /> Searching every accredited institution...</> : <><Sparkles className="h-5 w-5" /> Get My Recommendations</>}
            </button>
          )}
        </motion.form>

        {submitted && !isLoading && (
          <motion.div ref={resultRef} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {signal && (
              <div className="bg-glass rounded-2xl p-5 sm:p-6 border border-primary/20">
                <p className="text-sm font-semibold text-foreground">Your route is not one-dimensional</p>
                <p className="text-sm text-muted-foreground mt-2">{signal}</p>
              </div>
            )}

            {pathways.length > 0 && (
              <div className="bg-glass rounded-2xl p-5 sm:p-6">
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-primary font-semibold">Alternative routes</p>
                  <h3 className="font-display font-semibold text-xl text-foreground mt-1">If the first door is closed, here are the other doors</h3>
                  <p className="text-sm text-muted-foreground mt-2">These are evidence-based pathway patterns, not promises of admission. Each route should be checked against the current institution's official requirements.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {pathways.map((p) => (
                    <article key={p.title} className="rounded-xl border border-border bg-background/40 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-semibold text-foreground">{p.title}</h4>
                        <span className="text-[11px] whitespace-nowrap rounded-full bg-primary/10 text-primary px-2 py-1">{p.duration}</span>
                      </div>
                      <ol className="mt-3 space-y-2">
                        {p.route.map((step, index) => <li key={step} className="flex gap-2 text-xs text-muted-foreground"><span className="text-primary font-semibold">{index + 1}</span><span>{step}</span></li>)}
                      </ol>
                      <p className="text-xs text-foreground/80 mt-4"><strong>Why this can work:</strong> {p.whyItWorks}</p>
                      <p className="text-[11px] text-muted-foreground mt-2"><strong>Check:</strong> {p.caution}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-glass rounded-2xl p-5 sm:p-6">
              <h3 className="font-display font-semibold text-lg text-foreground mb-1">Direct-entry matches for {submitted.name}</h3>
              <p className="text-xs text-muted-foreground mb-5">Aggregate {submitted.aggregate} · ranked against published cut-offs and evidence-based estimated ranges.</p>

              {ranked.length === 0 ? (
                <div className="rounded-xl border border-border bg-background/40 p-4">
                  <p className="text-sm text-foreground font-medium">No direct-entry match was found for this search.</p>
                  <p className="text-xs text-muted-foreground mt-1">That does not mean the destination is impossible. Use the alternative routes above and then verify the next entry point.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ranked.map(({ reference: r, category, confidence, why, benchmarkLabel, benchmarkKind, gaps }) => (
                    <div key={r.programme_id} className="rounded-xl border border-border bg-background/40 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0"><p className="font-medium text-foreground text-sm">{r.programme_name}</p><p className="text-xs text-muted-foreground">{r.university_name} · {r.university_category} · {r.region ?? "Ghana"}</p></div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-medium ${CATEGORY_STYLES[category]}`}>{category}{confidence != null ? ` · ${confidence}%` : ""}</span>
                      </div>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs"><div><dt className="text-muted-foreground">Your aggregate</dt><dd className="text-foreground font-semibold">{submitted.aggregate}</dd></div><div><dt className="text-muted-foreground">{benchmarkKind}</dt><dd className="text-foreground font-semibold">{benchmarkLabel}</dd></div></dl>
                      <p className="text-xs text-muted-foreground mt-2">{why}</p>
                      {r.basis === "estimated" && r.estimate_method && <p className="text-[11px] text-muted-foreground mt-1 flex gap-1.5"><Info className="h-3 w-3 shrink-0 mt-0.5" /><span>Method: {r.estimate_method}</span></p>}
                      {gaps.slice(0, 1).map((g) => <p key={g} className="text-[11px] text-ghana-gold mt-1">! {g}</p>)}
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        {r.basis === "official" && <span className="text-[11px] text-muted-foreground">Verified {formatVerifiedDate(r.last_verified_at)}</span>}
                        {r.official_source_url && <a href={r.official_source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary">{r.source_name ?? "Official source"}<ExternalLink className="h-3 w-3" /></a>}
                        <Link to={`/programme/${r.programme_slug}`} className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">Programme details <ArrowRight className="h-3 w-3" /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-5">Estimated ranges are not official figures. For programmes with strict subject requirements, the official institution source remains the final authority.</p>
              {ranked.length > 0 && <div className="mt-6 pt-6 border-t border-border"><ShareButtons studentName={submitted.name} resultRef={resultRef} /></div>}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CollegeRecommender;
