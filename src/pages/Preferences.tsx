import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { ArrowLeft, Loader2, SlidersHorizontal } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import {
  COVERAGE_LEVELS,
  DEFAULT_PREFERENCES,
  FIELDS,
  FUNDING_TYPES,
  GENDERS,
  LEVELS,
  MatchPreferences,
  useMatchPreferences,
  useSavePreferences,
} from "@/hooks/useMatchPreferences";
import Navbar from "@/components/Navbar";

const REGIONS = [
  "Greater Accra", "Ashanti", "Central", "Eastern", "Western", "Volta",
  "Northern", "Upper East", "Upper West", "Bono", "Ahafo", "Oti", "Savannah",
  "North East", "Western North", "Bono East",
];

const card = "bg-glass rounded-xl p-5";
const input =
  "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50";

const Preferences = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: saved } = useMatchPreferences();
  const savePrefs = useSavePreferences();
  const [prefs, setPrefs] = useState<MatchPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    if (!loading && !user) navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`, { replace: true });
  }, [loading, user, navigate]);

  useEffect(() => {
    if (saved) setPrefs(saved);
  }, [saved]);

  const set = <K extends keyof MatchPreferences>(k: K, v: MatchPreferences[K]) =>
    setPrefs((p) => ({ ...p, [k]: v }));

  const toggleFunding = (t: string) =>
    set(
      "funding_types",
      prefs.funding_types.includes(t)
        ? prefs.funding_types.filter((x) => x !== t)
        : [...prefs.funding_types, t],
    );

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <SlidersHorizontal className="h-6 w-6 text-primary" /> Match preferences
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tune how GhanaPathFinder ranks scholarships for you. Saved once, used everywhere.
          </p>
        </div>

        <div className="space-y-5">
          <div className={`${card} grid gap-4 sm:grid-cols-2`}>
            <label className="text-xs text-muted-foreground">
              Level of study
              <select className={`${input} mt-1`} value={prefs.level} onChange={(e) => set("level", e.target.value)}>
                {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Field of study
              <select className={`${input} mt-1`} value={prefs.field} onChange={(e) => set("field", e.target.value)}>
                {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Home region
              <select
                className={`${input} mt-1`}
                value={prefs.region ?? ""}
                onChange={(e) => set("region", e.target.value || null)}
              >
                <option value="">No preference</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Gender-specific awards
              <select className={`${input} mt-1`} value={prefs.gender} onChange={(e) => set("gender", e.target.value)}>
                {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground sm:col-span-2">
              Minimum coverage you want
              <select
                className={`${input} mt-1`}
                value={prefs.min_coverage}
                onChange={(e) => set("min_coverage", e.target.value)}
              >
                {COVERAGE_LEVELS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div className={card}>
            <h2 className="font-display font-semibold text-foreground mb-1">Funding sources</h2>
            <p className="text-xs text-muted-foreground mb-3">Leave all unselected to consider every source.</p>
            <div className="flex flex-wrap gap-2">
              {FUNDING_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleFunding(t)}
                  aria-pressed={prefs.funding_types.includes(t)}
                  className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                    prefs.funding_types.includes(t)
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className={`${card} space-y-3`}>
            {[
              { key: "need_based" as const, label: "Prioritise need-based funding", hint: "Awards aimed at students with financial need rank higher." },
              { key: "study_abroad" as const, label: "Include study-abroad opportunities", hint: "Show international scholarships alongside Ghanaian ones." },
            ].map((row) => (
              <label key={row.key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={prefs[row.key]}
                  onChange={(e) => set(row.key, e.target.checked)}
                  className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                />
                <span>
                  <span className="block text-sm text-foreground">{row.label}</span>
                  <span className="block text-xs text-muted-foreground">{row.hint}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => savePrefs.mutate(prefs)}
              disabled={savePrefs.isPending}
              className="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center justify-center gap-2"
            >
              {savePrefs.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save preferences
            </button>
            <Link
              to="/scholarships"
              className="px-4 py-3 rounded-lg bg-secondary text-foreground text-sm font-medium text-center"
            >
              See my matches
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
