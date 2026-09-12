import { useMemo, useState } from "react";
import { ExternalLink, Info, Loader2, Target } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import { useAggregateRecommendations } from "@/hooks/useAdmissionReference";
import { CATEGORY_STYLES, diversify, formatVerifiedDate } from "@/lib/admissionEngine";
import { buildAlternativePathways, pathwaySignal, type WASSCEGrade } from "@/lib/pathwayEngine";
import SaveButton from "@/components/SaveButton";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

const grades: Array<WASSCEGrade | ""> = ["", "A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];
const preferences = ["No Preference", "Public Only", "Private Only"] as const;

const AdmissionMatch = () => {
  const [form, setForm] = useState({
    destination: "",
    aggregate: "",
    preference: "No Preference" as (typeof preferences)[number],
    english: "" as WASSCEGrade | "",
    mathematics: "" as WASSCEGrade | "",
    science: "" as WASSCEGrade | "",
  });
  const [submitted, setSubmitted] = useState<typeof form | null>(null);
  const aggregate = submitted && Number.isFinite(Number(submitted.aggregate)) ? Number(submitted.aggregate) : null;
  const { matches, isLoading, error } = useAggregateRecommendations(aggregate, submitted?.destination ?? "", !!submitted);

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

  const institutions = useMemo(() => new Set(ranked.map((m) => m.reference.university_id)).size, [ranked]);
  const pathways = submitted
    ? buildAlternativePathways({
        destination: submitted.destination,
        english: submitted.english,
        mathematics: submitted.mathematics,
        science: submitted.science,
      })
    : [];
  const signal = submitted
    ? pathwaySignal({
        destination: submitted.destination,
        english: submitted.english,
        mathematics: submitted.mathematics,
        science: submitted.science,
      })
    : null;

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.destination.trim() || !form.aggregate) return;
    setSubmitted({ ...form });
  };

  const useExample = () => {
    setForm({
      destination: "Computer Science",
      aggregate: "12",
      preference: "No Preference",
      english: "C4",
      mathematics: "B3",
      science: "B2",
    });
    setSubmitted(null);
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Seo
        title="WASSCE Admission Match Calculator | GhanaPathFinder"
        description="Enter your WASSCE aggregate and optional subject grades to see realistic Ghanaian university and programme matches using official cut-offs and clearly labelled estimates."
        path="/admission-match"
      />
      <Navbar />
      <main className="max-w-6xl mx-auto">
        <div className="max-w-3xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-2">Admission Intelligence</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">Find the routes that realistically fit your results.</h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-6">Start with your destination and WASSCE aggregate. GhanaPathFinder compares the available programme evidence, explains the match and shows alternative routes when a direct door is closed.</p>
        </div>

        <section className="border border-border rounded-2xl bg-card p-5 sm:p-7 mb-8">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Destination programme or career</label>
                <input required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="e.g. Computer Science, Nursing, Software Engineer" className="w-full h-12 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">WASSCE aggregate</label>
                <input required type="number" min={6} max={54} value={form.aggregate} onChange={(e) => setForm({ ...form, aggregate: e.target.value })} placeholder="e.g. 12" className="w-full h-12 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">University preference</label>
                <select value={form.preference} onChange={(e) => setForm({ ...form, preference: e.target.value as (typeof preferences)[number] })} className="w-full h-12 rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                  {preferences.map((preference) => <option key={preference}>{preference}</option>)}
                </select>
              </div>
            </div>

            <div className="border-t border-border pt-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Optional core grades</p>
                  <p className="text-xs text-muted-foreground mt-1">These help identify subject-specific blockers and alternative routes.</p>
                </div>
                <button type="button" onClick={useExample} className="text-xs font-semibold text-primary hover:underline">Use example profile</button>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {([['english', 'English Language'], ['mathematics', 'Core Mathematics'], ['science', 'Integrated Science']] as const).map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
                    <select value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value as WASSCEGrade | "" })} className="w-full h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20">
                      {grades.map((grade) => <option key={grade || "blank"} value={grade}>{grade || "Not entered"}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">A match is guidance, not an admission guarantee. Official institutional requirements remain the final authority.</p>
            <button type="submit" disabled={isLoading && !!submitted} className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {isLoading && submitted ? <><Loader2 className="h-4 w-4 animate-spin" /> Checking programme evidence…</> : <><Target className="h-4 w-4" /> Check my matches</>}
            </button>
          </form>
        </section>

        {submitted && isLoading && <div className="py-10 text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Searching the programme catalogue…</div>}
        {submitted && error && <div className="border border-destructive/30 rounded-xl p-4 text-sm text-destructive">We could not load admission data right now. Please try again.</div>}

        {submitted && !isLoading && !error && (
          <div className="space-y-6">
            <section className="grid sm:grid-cols-3 gap-3">
              <div className="border border-border rounded-xl bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Aggregate</p><p className="text-2xl font-bold text-foreground mt-1">{submitted.aggregate}</p></div>
              <div className="border border-border rounded-xl bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Relevant institutions</p><p className="text-2xl font-bold text-foreground mt-1">{institutions}</p></div>
              <div className="border border-border rounded-xl bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Matches shown</p><p className="text-2xl font-bold text-foreground mt-1">{ranked.length}</p></div>
            </section>

            {signal && <section className="border border-primary/20 rounded-2xl bg-primary/5 p-5"><p className="text-sm font-semibold text-foreground">Your route is not one-dimensional</p><p className="text-sm text-muted-foreground mt-2 leading-6">{signal}</p></section>}

            {pathways.length > 0 && (
              <section className="border border-border rounded-2xl bg-card p-5 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Alternative routes</p>
                <h2 className="font-display text-xl font-bold text-foreground mt-1">If the first door is closed, see the next realistic door.</h2>
                <div className="grid md:grid-cols-2 gap-4 mt-5">
                  {pathways.map((pathway) => <article key={pathway.title} className="border border-border rounded-xl p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-foreground">{pathway.title}</h3><span className="text-[11px] rounded-full bg-primary/10 text-primary px-2 py-1">{pathway.duration}</span></div><ol className="mt-3 space-y-2">{pathway.route.map((step, index) => <li key={step} className="flex gap-2 text-xs text-muted-foreground"><span className="text-primary font-semibold">{index + 1}</span><span>{step}</span></li>)}</ol><p className="text-xs text-foreground/80 mt-4"><strong>Why:</strong> {pathway.whyItWorks}</p><p className="text-[11px] text-muted-foreground mt-2"><strong>Check:</strong> {pathway.caution}</p></article>)}
                </div>
              </section>
            )}

            <section className="border border-border rounded-2xl bg-card p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Direct-entry options</p><h2 className="font-display text-xl font-bold text-foreground mt-1">Programme matches for {submitted.destination}</h2><p className="text-xs text-muted-foreground mt-1">Ranked against published cut-offs and evidence-based estimated ranges.</p></div>
                <Link to={`/career-path?dreamJob=${encodeURIComponent(submitted.destination)}`} className="text-xs font-semibold text-primary hover:underline">Build the career path →</Link>
              </div>

              {ranked.length === 0 ? (
                <div className="border border-border rounded-xl p-4"><p className="text-sm font-medium text-foreground">No direct-entry match was found for this search.</p><p className="text-xs text-muted-foreground mt-1">That does not mean the destination is impossible. Review the alternative routes and verify the next entry point with the institution.</p></div>
              ) : (
                <div className="space-y-3">
                  {ranked.map(({ reference: r, category, confidence, why, benchmarkLabel, benchmarkKind, gaps }) => (
                    <article key={r.programme_id} className="border border-border rounded-xl p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h3 className="font-semibold text-sm text-foreground">{r.programme_name}</h3><p className="text-xs text-muted-foreground mt-0.5">{r.university_name} · {r.university_category} · {r.region ?? "Ghana"}</p></div><span className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-semibold ${CATEGORY_STYLES[category]}`}>{category}{confidence != null ? ` · ${confidence}%` : ""}</span></div>
                      <div className="grid sm:grid-cols-2 gap-2 mt-3 text-xs"><p className="text-muted-foreground">Your aggregate: <span className="text-foreground font-semibold">{submitted.aggregate}</span></p><p className="text-muted-foreground">{benchmarkKind}: <span className="text-foreground font-semibold">{benchmarkLabel}</span></p></div>
                      <p className="text-xs text-muted-foreground mt-2 leading-5">{why}</p>
                      {r.basis === "estimated" && r.estimate_method && <p className="text-[11px] text-muted-foreground mt-2 flex gap-1.5"><Info className="h-3 w-3 shrink-0 mt-0.5" /> Method: {r.estimate_method}</p>}
                      {gaps.slice(0, 1).map((gap) => <p key={gap} className="text-[11px] text-ghana-gold mt-2">! {gap}</p>)}
                      <div className="flex flex-wrap items-center gap-3 mt-3">
                        <SaveButton item={{ item_type: "programme", item_key: r.programme_slug, title: r.programme_name, subtitle: r.university_name, metadata: { basis: r.basis, cut_off: r.official_cutoff, estimate_low: r.estimate_low, estimate_high: r.estimate_high, category } }} />
                        <Link to={`/programme/${r.programme_slug}`} className="text-[11px] font-semibold text-primary">Programme details</Link>
                        {r.official_source_url && <a href={r.official_source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] text-primary">{r.source_name ?? "Official source"}<ExternalLink className="h-3 w-3" /></a>}
                        {r.basis === "official" && <span className="text-[11px] text-muted-foreground">Verified {formatVerifiedDate(r.last_verified_at)}</span>}
                      </div>
                    </article>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-5">Estimated ranges are GhanaPathFinder working, not official figures. Always confirm current requirements, fees and deadlines with the institution.</p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdmissionMatch;
