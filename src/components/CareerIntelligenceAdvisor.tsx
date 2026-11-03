import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "@/lib/icons";
import { careerPaths } from "@/data/careerPaths";
import { useWassceResults } from "@/hooks/useAdmissionMatch";
import CareerOpportunityRecommendations from "@/components/CareerOpportunityRecommendations";

type CareerRecommendation = {
  id: string;
  careerName: string;
  major: string;
  relevantSubjects: string[];
  recommendedProgrammes: string[];
  entryLevelRoles: string[];
  industries: string[];
  relevance: number;
  reason: string;
  matchingEvidence: string[];
  skillsToDevelop: string[];
  starterProjects: string[];
  nextActions: string[];
};

type CareerAnalysis = {
  summary: string;
  recommendations: CareerRecommendation[];
  next90Days: Array<{ period: string; focus: string; actions: string[] }>;
  evidenceNote: string;
};

type Candidate = {
  id: string;
  careerName: string;
  major: string;
  description: string;
  relevantSubjects: string[];
  recommendedProgrammes: string[];
  skills: string[];
  entryLevelRoles: string[];
  industries: string[];
};

export default function CareerIntelligenceAdvisor({
  initialGoal = "",
}: {
  initialGoal?: string;
}) {
  const [targetCareer, setTargetCareer] = useState(initialGoal);
  const [currentStage, setCurrentStage] = useState("");
  const [interests, setInterests] = useState("");
  const [existingSkills, setExistingSkills] = useState("");
  const [location, setLocation] = useState("Ghana");
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { data: savedProfile } = useQuery({
    queryKey: ["career-intelligence-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("target_career,interests,region")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60_000,
  });
  const { data: wassceResults = [], isLoading: loadingResults } = useWassceResults();

  useEffect(() => {
    if (!savedProfile) return;
    setTargetCareer((current) => current.trim() ? current : savedProfile.target_career ?? "");
    setInterests((current) => current.trim() ? current : (savedProfile.interests ?? []).join(", "));
    setLocation((current) => current === "Ghana" && savedProfile.region ? savedProfile.region : current);
  }, [savedProfile]);

  const candidates = useMemo<Candidate[]>(
    () =>
      careerPaths.slice(0, 60).map((path) => ({
        id: `${path.major}::${path.career_name}`,
        careerName: path.career_name,
        major: path.major,
        description: path.description.slice(0, 220),
        relevantSubjects: path.relevant_subjects.slice(0, 6),
        recommendedProgrammes: path.recommended_programmes.slice(0, 5),
        skills: [...path.skills.technical, ...path.skills.soft].slice(0, 6),
        entryLevelRoles: path.entry_level_roles.slice(0, 5),
        industries: path.industries.slice(0, 5),
      })),
    [],
  );

  const analyze = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setAnalysis(null);

    if (!targetCareer.trim() && !interests.trim() && !existingSkills.trim() &&
        !currentStage.trim() && wassceResults.length === 0) {
      setError("Add a career goal, interests, skills, current study stage or WASSCE results first.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/career-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            targetCareer,
            currentStage,
            interests,
            existingSkills,
            location,
          },
          wassceResults: wassceResults.map((item) => ({
            subject: item.subject,
            grade: item.grade,
          })),
          candidates,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Career Intelligence could not complete the analysis. Please try again.",
        );
      }

      setAnalysis({
        summary: String(payload.summary ?? ""),
        recommendations: Array.isArray(payload.recommendations)
          ? payload.recommendations as CareerRecommendation[]
          : [],
        next90Days: Array.isArray(payload.next90Days)
          ? payload.next90Days.slice(0, 3)
          : [],
        evidenceNote: String(payload.evidenceNote ?? ""),
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Career Intelligence is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-primary/20 bg-card p-5 sm:p-7" aria-label="AI Career Intelligence">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">AI Career Intelligence</p>
          <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
            Find careers that connect with your strengths and interests.
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Compare your goals, WASSCE subjects, interests and current skills with GhanaPathFinder's career catalogue.
            Get career options, skills to develop and practical projects to begin.
          </p>
        </div>
      </div>

      <form onSubmit={analyze} className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="career-ai-goal" className="mb-1.5 block text-xs font-semibold text-foreground">
            Career you are considering
          </label>
          <input
            id="career-ai-goal"
            value={targetCareer}
            onChange={(event) => setTargetCareer(event.target.value)}
            placeholder="e.g. AI engineer, architect, doctor, entrepreneur"
            maxLength={160}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label htmlFor="career-ai-stage" className="mb-1.5 block text-xs font-semibold text-foreground">
            Your current stage
          </label>
          <input
            id="career-ai-stage"
            value={currentStage}
            onChange={(event) => setCurrentStage(event.target.value)}
            placeholder="e.g. SHS student, WASSCE graduate, university student"
            maxLength={180}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label htmlFor="career-ai-interests" className="mb-1.5 block text-xs font-semibold text-foreground">
            Your interests
          </label>
          <textarea
            id="career-ai-interests"
            value={interests}
            onChange={(event) => setInterests(event.target.value)}
            placeholder="What subjects, problems or activities interest you?"
            maxLength={1000}
            rows={3}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <label htmlFor="career-ai-skills" className="mb-1.5 block text-xs font-semibold text-foreground">
            Skills and experience you already have
          </label>
          <textarea
            id="career-ai-skills"
            value={existingSkills}
            onChange={(event) => setExistingSkills(event.target.value)}
            placeholder="Mention skills, projects, volunteering or work experience."
            maxLength={1000}
            rows={3}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="sm:col-span-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <label htmlFor="career-ai-location" className="mb-1.5 block text-xs font-semibold text-foreground">
              Preferred location
            </label>
            <input
              id="career-ai-location"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              maxLength={120}
              className="min-h-10 w-full max-w-xs rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {loadingResults ? "Loading saved WASSCE results…" : wassceResults.length
                ? `Using ${wassceResults.length} saved WASSCE subject results.`
                : "No saved WASSCE results found. You can still analyse your interests and skills."}
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || loadingResults}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing your career profile…</> : <><Sparkles className="h-4 w-4" /> Analyse my career options</>}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}

      {analysis && (
        <div className="mt-7 border-t border-border pt-6" aria-live="polite">
          <h3 className="font-display text-lg font-semibold text-foreground">Your career analysis</h3>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-muted-foreground">{analysis.summary}</p>

          {analysis.recommendations.length === 0 ? (
            <p className="mt-4 rounded-lg border border-border p-4 text-sm text-muted-foreground">
              The catalogue did not contain a sufficiently relevant match. Try adding more detail about your interests or skills.
            </p>
          ) : (
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {analysis.recommendations.map((recommendation, index) => (
                <article key={recommendation.id} className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Recommendation {index + 1}</p>
                      <h4 className="mt-1 font-display text-base font-semibold text-foreground">{recommendation.careerName}</h4>
                      <p className="mt-1 text-xs text-muted-foreground">{recommendation.major}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold tabular-nums text-foreground">{recommendation.relevance}/100</p>
                      <p className="text-[10px] text-muted-foreground">AI relevance</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{recommendation.reason}</p>

                  {!!recommendation.matchingEvidence.length && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-foreground">What aligns</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-muted-foreground">
                        {recommendation.matchingEvidence.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {!!recommendation.skillsToDevelop.length && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-foreground">Skills to develop</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-muted-foreground">
                        {recommendation.skillsToDevelop.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {!!recommendation.starterProjects.length && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-foreground">Projects to try</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-muted-foreground">
                        {recommendation.starterProjects.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {!!recommendation.nextActions.length && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-foreground">Your next actions</p>
                      <ul className="mt-1 list-disc space-y-1 pl-4 text-xs leading-5 text-muted-foreground">
                        {recommendation.nextActions.map((item, i) => <li key={i}>{item}</li>)}
                      </ul>
                    </div>
                  )}
                  {!!recommendation.recommendedProgrammes.length && (
                    <div className="mt-4 border-t border-border pt-3">
                      <p className="text-xs font-semibold text-foreground">Programmes to explore</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{recommendation.recommendedProgrammes.join(" · ")}</p>
                    </div>
                  )}
                  {!!recommendation.entryLevelRoles.length && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-foreground">Possible entry roles</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">{recommendation.entryLevelRoles.join(" · ")}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}

          {!!analysis.next90Days.length && (
            <div className="mt-6">
              <h4 className="font-semibold text-foreground">A practical 90-day plan</h4>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {analysis.next90Days.map((item, index) => (
                  <article key={index} className="rounded-xl border border-border p-4">
                    <p className="text-xs font-semibold text-primary">{item.period}</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{item.focus}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-5 text-muted-foreground">
                      {item.actions.map((action, i) => <li key={i}>{action}</li>)}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          )}

          {analysis.evidenceNote && <p className="mt-5 border-t border-border pt-3 text-xs leading-5 text-muted-foreground">{analysis.evidenceNote}</p>}
          <p className="mt-2 text-[11px] text-muted-foreground">
            AI relevance scores are advisory comparisons of the information supplied. They are not predictions of career success, salary or employment.
          </p>
          {analysis.recommendations[0] && (
            <div className="mt-6">
              <CareerOpportunityRecommendations
                career={analysis.recommendations[0].careerName}
                programme={analysis.recommendations[0].recommendedProgrammes[0] ?? ""}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
