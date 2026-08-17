import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { ArrowLeft, ExternalLink, Info, Loader2, Target } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { useReferenceMatches } from "@/hooks/useAdmissionReference";
import { useUniversities } from "@/hooks/useCatalogue";
import { CATEGORY_STYLES, formatVerifiedDate, type MatchCategory } from "@/lib/admissionEngine";
import SaveButton from "@/components/SaveButton";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

const CATEGORIES: MatchCategory[] = [
  "Strong Match",
  "Good Match",
  "Possible",
  "Reach",
  "Low Match",
  "Not Eligible",
  "Insufficient Data",
];

const AdmissionMatch = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [universityId, setUniversityId] = useState("");
  const [category, setCategory] = useState<"All" | MatchCategory>("All");
  const [basis, setBasis] = useState<"all" | "official" | "estimated">("all");
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?next=/admission-match", { replace: true });
  }, [loading, user, navigate]);

  const { data: unis } = useUniversities({ pageSize: 100 });
  const { matches, breakdown, isLoading, error } = useReferenceMatches(search, universityId || undefined);

  const filtered = useMemo(
    () =>
      matches.filter(
        (m) =>
          (category === "All" || m.category === category) &&
          (basis === "all" || m.reference.basis === basis),
      ),
    [matches, category, basis],
  );

  const counts = useMemo(() => {
    const c: Partial<Record<MatchCategory, number>> = {};
    matches.forEach((m) => (c[m.category] = (c[m.category] ?? 0) + 1));
    return c;
  }, [matches]);

  const institutions = useMemo(
    () => new Set(matches.map((m) => m.reference.university_id)).size,
    [matches],
  );

  const card = "bg-glass rounded-xl p-5";
  const input =
    "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50";

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Seo
        title="WASSCE Admission Match Calculator | GhanaPathFinder"
        description="Enter your WASSCE grades to see which Ghanaian university, technical university and college programmes you qualify for, using verified cut-offs and evidence-based estimated ranges."
        path="/admission-match"
      />
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <Target className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Admission Match</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
          Scored across {institutions} accredited Ghanaian institutions. Where an institution publishes
          a cut-off we use it. Where it does not, we show a clearly-labelled estimated range built from
          published evidence , and where there is not enough evidence, we say so instead of guessing.
        </p>

        {/* Aggregate summary */}
        <div className={`${card} mb-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Your WASSCE aggregate</p>
              <p className="font-display text-3xl font-bold text-foreground">
                {breakdown.aggregate ?? ","}
              </p>
              {!!breakdown.usedSubjects.length && (
                <p className="text-xs text-muted-foreground mt-1">
                  Best six: {breakdown.usedSubjects.map((s) => `${s.subject} (${s.grade})`).join(", ")}
                </p>
              )}
            </div>
            <Link to="/onboarding" className="text-sm text-primary font-medium">
              Update my results
            </Link>
          </div>

          {!!breakdown.missingCores.length && (
            <p className="mt-3 text-xs text-ghana-gold">
              Missing a pass (C6 or better) in: {breakdown.missingCores.join(", ")}. Core subjects are required
              for degree admission in Ghana.
            </p>
          )}
          {!!breakdown.failedSubjects.length && (
            <p className="mt-2 text-xs text-muted-foreground">
              Not counted (D7 or below): {breakdown.failedSubjects.map((s) => `${s.subject} (${s.grade})`).join(", ")}
            </p>
          )}
          {!breakdown.hasEnoughSubjects && (
            <p className="mt-3 text-xs text-muted-foreground">
              Add three core subjects (English, Core Mathematics, Integrated Science) plus at least three
              electives to be scored.
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-5">
          <input
            className={input}
            placeholder="Search a programme or institution"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(20);
            }}
          />
          <select className={input} value={universityId} onChange={(e) => setUniversityId(e.target.value)}>
            <option value="">All institutions</option>
            {(unis?.rows ?? []).map((u) => (
              <option key={u.id} value={u.id}>{u.short_name || u.name}</option>
            ))}
          </select>
          <select className={input} value={category} onChange={(e) => setCategory(e.target.value as MatchCategory)}>
            <option value="All">All outcomes ({matches.length})</option>
            {CATEGORIES.filter((c) => counts[c]).map((c) => (
              <option key={c} value={c}>{c} ({counts[c]})</option>
            ))}
          </select>
          <select className={input} value={basis} onChange={(e) => setBasis(e.target.value as typeof basis)}>
            <option value="all">Official cut-offs and estimates</option>
            <option value="official">Official cut-offs only</option>
            <option value="estimated">Estimated ranges only</option>
          </select>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading admission data…
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive py-6">
            We could not load admission data. Please check your connection and try again.
          </p>
        )}

        {!isLoading && !error && !filtered.length && (
          <p className="text-sm text-muted-foreground py-10">
            No programmes match this filter. Try a different search or institution.
          </p>
        )}

        <div className="space-y-4">
          {filtered.slice(0, limit).map((m) => {
            const r = m.reference;
            return (
              <article key={r.programme_id} className={card}>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold text-foreground break-words">
                      {r.programme_name}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {r.university_name} · {r.university_category} · {r.degree_type}
                      {r.academic_year ? ` · ${r.academic_year}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full border text-xs font-semibold ${CATEGORY_STYLES[m.category]}`}
                    >
                      {m.category}
                    </span>
                    {m.confidence != null && (
                      <p className="text-xs text-muted-foreground mt-1">{m.confidence}% confidence</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 text-xs mb-3">
                  <p className="text-muted-foreground">
                    {m.benchmarkKind}:{" "}
                    <span className="text-foreground font-semibold">{m.benchmarkLabel}</span>
                  </p>
                  <p className="text-muted-foreground">
                    Your aggregate:{" "}
                    <span className="text-foreground font-semibold">{breakdown.aggregate ?? ","}</span>
                  </p>
                </div>

                <p className="text-sm text-foreground mb-3">{m.why}</p>

                {r.basis === "estimated" && (
                  <p className="text-xs text-muted-foreground flex gap-1.5 mb-3">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    <span>
                      {m.reference.estimate_method} Evidence: {m.reference.estimate_evidence}.
                    </span>
                  </p>
                )}

                {!!m.requirementChecks.filter((c) => c.status === "met").length && (
                  <ul className="text-xs space-y-1 mb-3">
                    {m.requirementChecks
                      .filter((c) => c.status === "met")
                      .map((c) => <li key={c.note} className="text-muted-foreground"> {c.note}</li>)}
                  </ul>
                )}
                {!!m.gaps.length && (
                  <ul className="text-xs space-y-1 mb-3">
                    {m.gaps.map((g) => <li key={g} className="text-ghana-gold">! {g}</li>)}
                  </ul>
                )}

                {r.subject_requirements && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Subject requirement: {r.subject_requirements}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <SaveButton
                    item={{
                      item_type: "programme",
                      item_key: r.programme_slug,
                      title: r.programme_name,
                      subtitle: r.university_name,
                      metadata: {
                        basis: r.basis,
                        cut_off: r.official_cutoff,
                        estimate_low: r.estimate_low,
                        estimate_high: r.estimate_high,
                        category: m.category,
                      },
                    }}
                  />
                  <Link
                    to={`/programme/${r.programme_slug}`}
                    className="px-2.5 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground"
                  >
                    Programme details
                  </Link>
                  {r.official_source_url && (
                    <a
                      href={r.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground"
                    >
                      {r.source_name ?? "Official source"} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {r.basis === "official" && (
                    <span className="text-[11px] text-muted-foreground">
                      Verified {formatVerifiedDate(r.last_verified_at)}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {filtered.length > limit && (
          <button
            onClick={() => setLimit((l) => l + 20)}
            className="mt-6 w-full px-4 py-3 rounded-lg bg-secondary text-sm text-foreground"
          >
            Show more ({filtered.length - limit} remaining)
          </button>
        )}

        <p className="mt-6 text-xs text-muted-foreground">
          Cut-off points change every year with the number of applicants and available places. Estimated
          ranges are GhanaPathFinder's own evidence-based working, not official figures. Always confirm with the
          institution before applying.
        </p>
      </div>
    </div>
  );
};

export default AdmissionMatch;
