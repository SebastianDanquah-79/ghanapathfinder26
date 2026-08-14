import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ExternalLink, Info, Loader2, Target } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdmissionMatches } from "@/hooks/useAdmissionMatch";
import { useUniversities } from "@/hooks/useCatalogue";
import { CATEGORY_STYLES, formatVerifiedDate, type MatchCategory } from "@/lib/admissionEngine";
import SaveButton from "@/components/SaveButton";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

const CATEGORIES: MatchCategory[] = [
  "Excellent Match",
  "Strong Match",
  "Competitive",
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
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    if (!loading && !user) navigate("/auth?next=/admission-match", { replace: true });
  }, [loading, user, navigate]);

  const { data: unis } = useUniversities({ pageSize: 50 });
  const { matches, breakdown, isLoading, error } = useAdmissionMatches(search, universityId || undefined);

  const filtered = useMemo(
    () => (category === "All" ? matches : matches.filter((m) => m.category === category)),
    [matches, category],
  );

  const counts = useMemo(() => {
    const c: Partial<Record<MatchCategory, number>> = {};
    matches.forEach((m) => (c[m.category] = (c[m.category] ?? 0) + 1));
    return c;
  }, [matches]);

  const card = "bg-glass rounded-xl p-5";
  const input =
    "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50";

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Seo
        title="WASSCE Admission Match Calculator | GhanaPath"
        description="Enter your WASSCE grades to see which Ghanaian university programmes you qualify for, using verified cut-off aggregates and subject requirements."
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
        <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
          Every score below is calculated from your WASSCE grades against cut-off points published by the
          universities themselves. Lower aggregates are stronger. We would rather tell you the truth than make
          you feel good.
        </p>

        {/* Aggregate summary */}
        <div className={`${card} mb-6`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Your WASSCE aggregate</p>
              <p className="font-display text-3xl font-bold text-foreground">
                {breakdown.aggregate ?? "—"}
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
        <div className="grid gap-3 sm:grid-cols-3 mb-5">
          <input
            className={input}
            placeholder="Search a programme, e.g. Nursing"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLimit(20);
            }}
          />
          <select className={input} value={universityId} onChange={(e) => setUniversityId(e.target.value)}>
            <option value="">All universities with published cut-offs</option>
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
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading verified cut-off points…
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive py-6">
            We could not load cut-off data. Please check your connection and try again.
          </p>
        )}

        {!isLoading && !error && !filtered.length && (
          <p className="text-sm text-muted-foreground py-10">
            No programmes match this filter. Try a different search or university.
          </p>
        )}

        <div className="space-y-4">
          {filtered.slice(0, limit).map((m) => (
            <article key={m.cutoff.id} className={card}>
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <h2 className="font-display font-semibold text-foreground break-words">
                    {m.cutoff.programme_name}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {m.cutoff.universities?.short_name || m.cutoff.universities?.name} ·{" "}
                    {m.cutoff.applicant_category} · {m.cutoff.academic_year}
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

              <p className="text-sm text-foreground mb-3">{m.headline}</p>

              <div className="grid gap-2 sm:grid-cols-2 text-xs mb-3">
                <p className="text-muted-foreground">
                  Published cut-off:{" "}
                  <span className="text-foreground font-semibold">{m.cutoff.cut_off_aggregate ?? "not published"}</span>
                </p>
                <p className="text-muted-foreground">
                  Your aggregate:{" "}
                  <span className="text-foreground font-semibold">{breakdown.aggregate ?? "—"}</span>
                  {m.margin != null && (
                    <span className={m.margin >= 0 ? " text-emerald-400" : " text-destructive"}>
                      {" "}({m.margin >= 0 ? `${m.margin} inside` : `${Math.abs(m.margin)} outside`})
                    </span>
                  )}
                </p>
              </div>

              {(!!m.reasons.length || !!m.gaps.length) && (
                <ul className="text-xs space-y-1 mb-3">
                  {m.reasons.map((r) => (
                    <li key={r} className="text-muted-foreground">✓ {r}</li>
                  ))}
                  {m.gaps.map((g) => (
                    <li key={g} className="text-ghana-gold">! {g}</li>
                  ))}
                </ul>
              )}

              {m.cutoff.subject_requirements && (
                <p className="text-xs text-muted-foreground mb-3">
                  Subject requirement: {m.cutoff.subject_requirements}
                </p>
              )}

              {m.cutoff.admission_notes && (
                <p className="text-xs text-muted-foreground flex gap-1.5 mb-3">
                  <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{m.cutoff.admission_notes}</span>
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <SaveButton
                  item={{
                    item_type: "programme",
                    item_key: `${m.cutoff.universities?.slug ?? "uni"}:${m.cutoff.programme_name}`,
                    title: m.cutoff.programme_name,
                    subtitle: m.cutoff.universities?.name ?? null,
                    metadata: {
                      cut_off: m.cutoff.cut_off_aggregate,
                      category: m.category,
                      academic_year: m.cutoff.academic_year,
                    },
                  }}
                />
                {m.cutoff.official_source_url && (
                  <a
                    href={m.cutoff.official_source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground"
                  >
                    {m.cutoff.source_name ?? "Official source"} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <span className="text-[11px] text-muted-foreground">
                  Verified {formatVerifiedDate(m.cutoff.last_verified_at)}
                </span>
              </div>
            </article>
          ))}
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
          Cut-off points change every year with the number of applicants and available places. GhanaPath shows
          the most recent officially published figures with a link to the source so you can verify them
          yourself. Always confirm with the university before applying.
        </p>
      </div>
    </div>
  );
};

export default AdmissionMatch;
