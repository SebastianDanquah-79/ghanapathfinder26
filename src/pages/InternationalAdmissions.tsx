import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { ArrowLeft, ExternalLink, Loader2, ShieldCheck } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

type Qualification = {
  country_code: string;
  qualification_code: string;
  qualification_name: string;
  overall_score: string | null;
};

type Country = { code: string; name: string };
type Match = {
  programme_id: string;
  programme_name: string;
  university_id: string | null;
  university_name: string | null;
  qualification_code: string;
  verification_status: string;
  minimum_overall_score: number | null;
  minimum_score_operator: string | null;
  required_subjects: unknown;
  notes: string | null;
  source_url: string | null;
  programme_url: string | null;
  admissions_url: string | null;
  match_status: string;
};

type Guide = {
  institution_name: string;
  admissions_url: string | null;
  international_url: string | null;
  application_url: string | null;
  scholarship_url: string | null;
  notes: string | null;
};

const InternationalAdmissions = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedQualification, setSelectedQualification] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?next=/international-admissions", { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoadingData(true);
      setError(null);
      const [{ data: countryData, error: countryError }, { data: qualificationData, error: qualificationError }, { data: guideData, error: guideError }] =
        await Promise.all([
          supabase.from("africa_country_catalog").select("code,name").eq("enabled", true).order("name"),
          supabase.from("student_qualifications").select("country_code,qualification_code,qualification_name,overall_score").eq("user_id", user.id),
          supabase.from("ghana_institution_guides").select("institution_name,admissions_url,international_url,application_url,scholarship_url,notes").order("institution_name"),
        ]);

      if (countryError || qualificationError || guideError) {
        setError("We could not load your international admissions data. Please try again.");
      } else {
        setCountries((countryData ?? []) as Country[]);
        setQualifications((qualificationData ?? []) as Qualification[]);
        setGuides((guideData ?? []) as Guide[]);
        const saved = qualificationData?.[0];
        if (saved) {
          setSelectedCountry(saved.country_code);
          setSelectedQualification(saved.qualification_code);
        }
      }
      setLoadingData(false);
    };
    void load();
  }, [user]);

  const availableQualifications = useMemo(
    () => qualifications.filter((q) => !selectedCountry || q.country_code === selectedCountry),
    [qualifications, selectedCountry],
  );

  useEffect(() => {
    if (selectedCountry && !availableQualifications.some((q) => q.qualification_code === selectedQualification)) {
      setSelectedQualification(availableQualifications[0]?.qualification_code ?? "");
    }
  }, [availableQualifications, selectedCountry, selectedQualification]);

  const runMatch = async () => {
    if (!selectedQualification) return;
    setMatching(true);
    setError(null);
    const { data, error: matchError } = await (supabase as any).rpc("match_international_programmes", {
      p_country_code: selectedCountry || null,
      p_qualification_code: selectedQualification,
    });
    if (matchError) {
      setError("The admissions engine could not complete the match. Please try again.");
      setMatches([]);
    } else {
      setMatches((data ?? []) as Match[]);
    }
    setMatching(false);
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="min-h-[70vh] flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading international admissions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-16">
      <Seo
        title="International Admissions to Ghana | GhanaPathFinder"
        description="Match international qualifications to verified Ghanaian university programme requirements and build an application checklist."
        path="/international-admissions"
      />
      <Navbar />
      <main className="max-w-6xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <section className="border border-border bg-card p-5 sm:p-7 mb-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-6 w-6 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Ghana International Admissions</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-1">
                Match your qualification to Ghanaian programmes
              </h1>
              <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
                Select the qualification saved to your profile. GhanaPathFinder checks it against programme-level requirements that have been entered from institutional sources. It does not invent equivalencies.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mt-6">
            <label className="text-sm text-foreground">
              Country
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 bg-secondary border border-border text-sm"
              >
                <option value="">All saved qualifications</option>
                {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
              </select>
            </label>
            <label className="text-sm text-foreground">
              Qualification
              <select
                value={selectedQualification}
                onChange={(e) => setSelectedQualification(e.target.value)}
                className="mt-1.5 w-full px-3 py-2.5 bg-secondary border border-border text-sm"
              >
                <option value="">Select a qualification</option>
                {availableQualifications.map((q) => (
                  <option key={q.qualification_code} value={q.qualification_code}>
                    {q.qualification_name}{q.overall_score ? ` · ${q.overall_score}` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            onClick={runMatch}
            disabled={!selectedQualification || matching}
            className="mt-4 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {matching ? "Matching..." : "Find Ghanaian programmes"}
          </button>
        </section>

        {error && <p className="text-sm text-destructive mb-5">{error}</p>}

        <section className="mb-8">
          <div className="flex items-end justify-between gap-3 mb-3">
            <div>
              <h2 className="font-display text-xl font-semibold text-foreground">Programme matches</h2>
              <p className="text-xs text-muted-foreground mt-1">
                {matches.length ? `${matches.length} programme requirement record${matches.length === 1 ? "" : "s"} found.` : "Run the matcher to check your saved qualification."}
              </p>
            </div>
          </div>

          {!matches.length && selectedQualification && !matching && (
            <div className="border border-border bg-card p-5 text-sm text-muted-foreground">
              No programme-level requirement records are currently available for this qualification. This is intentional: GhanaPathFinder will not present an unverified equivalency as an admission result.
            </div>
          )}

          <div className="space-y-3">
            {matches.map((m) => (
              <article key={m.programme_id} className="border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{m.programme_name}</h3>
                    <p className="text-sm text-muted-foreground">{m.university_name ?? "Ghanaian institution"}</p>
                  </div>
                  <span className="text-xs px-2 py-1 border border-border text-muted-foreground">
                    {m.verification_status === "verified" ? "Verified requirement" : "Review required"}
                  </span>
                </div>
                {m.notes && <p className="text-sm text-muted-foreground mt-3">{m.notes}</p>}
                {m.required_subjects && <p className="text-xs text-muted-foreground mt-2">Required subjects: {JSON.stringify(m.required_subjects)}</p>}
                <div className="flex flex-wrap gap-2 mt-4">
                  {m.programme_url && <a href={m.programme_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary">Programme <ExternalLink className="h-3 w-3" /></a>}
                  {m.admissions_url && <a href={m.admissions_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary">Admissions <ExternalLink className="h-3 w-3" /></a>}
                  {m.source_url && <a href={m.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-primary">Requirement source <ExternalLink className="h-3 w-3" /></a>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border pt-7">
          <h2 className="font-display text-xl font-semibold text-foreground">Application pathway</h2>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Once you identify a programme, use the institution's official international admissions route and confirm current requirements before submitting.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {guides.map((g) => (
              <article key={g.institution_name} className="border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">{g.institution_name}</h3>
                {g.notes && <p className="text-xs text-muted-foreground mt-1.5">{g.notes}</p>}
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                  {g.international_url && <a href={g.international_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary">International admissions</a>}
                  {g.application_url && <a href={g.application_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary">Application</a>}
                  {g.scholarship_url && <a href={g.scholarship_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary">Scholarships</a>}
                  {g.admissions_url && <a href={g.admissions_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary">Admissions</a>}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-border mt-8 pt-7">
          <h2 className="font-display text-xl font-semibold text-foreground">Your application checklist</h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mt-4">
            {[
              "Confirm programme-specific academic requirements",
              "Prepare certificate and transcript copies",
              "Prepare certified translations where required",
              "Check English proficiency requirements",
              "Complete the institution's international application",
              "Check scholarship or financial-aid deadlines",
              "Keep your admission letter and fee receipt",
              "Follow Ghana's student residence permit process after admission",
            ].map((item) => (
              <div key={item} className="border border-border bg-card p-4 text-sm text-foreground">
                {item}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Residence and immigration requirements can change. Use the official Ghana Immigration Service guidance linked from the institution pathway before making travel or legal decisions.
          </p>
        </section>
      </main>
    </div>
  );
};

export default InternationalAdmissions;
