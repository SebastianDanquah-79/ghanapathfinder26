import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  ArrowLeft,
  Bell,
  Download,
  ExternalLink,
  RefreshCw,
  Scale,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { scholarships } from "@/data/scholarships";
import { matchScholarships } from "@/lib/scholarshipMatcher";
import { estimateDeadlineDate, toISODate, daysUntil, urgencyLabel } from "@/lib/scholarshipDates";
import { buildPlanText, downloadPlan } from "@/lib/scholarshipPlan";
import SaveButton from "@/components/SaveButton";

const GRADE_POINTS: Record<string, number> = { A1: 1, B2: 2, B3: 3, C4: 4, C5: 5, C6: 6, D7: 7, E8: 8, F9: 9 };

interface AiMatch {
  name: string;
  score: number;
  why: string;
  gaps?: string[];
  nextStep?: string;
}

const Scholarships = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [ai, setAi] = useState<{ matches: AiMatch[]; summary?: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading, user, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: results = [] } = useQuery({
    queryKey: ["results", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("wassce_results").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: saved = [] } = useQuery({
    queryKey: ["saved_items", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("saved_items").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: deadlines = [] } = useQuery({
    queryKey: ["deadlines", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("deadlines").select("*").order("due_date");
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: checklist = [] } = useQuery({
    queryKey: ["checklist", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("application_checklist").select("*").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const graded = results.filter((r) => GRADE_POINTS[r.grade]);
  const aggregate = graded.length
    ? graded.map((r) => GRADE_POINTS[r.grade]).sort((a, b) => a - b).slice(0, 6).reduce((a, b) => a + b, 0)
    : null;

  const savedScholarships = saved.filter((s) => s.item_type === "scholarship");

  // Eligibility recheck against the CURRENT profile + results
  const recheck = useMemo(
    () =>
      matchScholarships({
        level: "Undergraduate",
        field: profile?.target_career ?? "Any",
        region: profile?.region ?? "",
        needBased: true,
        aggregate,
        gender: "Prefer not to say",
      }),
    [profile, aggregate],
  );

  const statusFor = (name: string) => recheck.find((m) => m.scholarship.name === name);

  const runAi = async () => {
    setBusy(true);
    setAi(null);
    try {
      const { data, error } = await supabase.functions.invoke("scholarship-match", {
        body: {
          profile: {
            aggregate,
            subjects: graded.map((r) => `${r.subject}: ${r.grade}`),
            targetCareer: profile?.target_career,
            region: profile?.region,
            school: profile?.school,
            interests: profile?.interests,
            savedScholarships: savedScholarships.map((s) => s.title),
          },
          scholarships: scholarships.map((s) => ({
            name: s.name,
            provider: s.provider,
            type: s.type,
            coverage: s.coverage,
            level: s.level,
            eligibility: s.eligibility,
            deadline: s.deadline,
          })),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.details || data.error);
      setAi(data);
      toast.success("AI matches ready");
    } catch (e) {
      toast.error((e as Error).message || "Could not generate AI matches");
    } finally {
      setBusy(false);
    }
  };

  const trackDeadline = async (name: string, deadlineText: string) => {
    if (!user) return;
    const date = estimateDeadlineDate(deadlineText);
    if (!date) return toast.error("This scholarship has no fixed month — add a reminder manually.");
    const iso = toISODate(date);
    if (deadlines.some((d) => d.title === name)) return toast.info("Already tracking this deadline");
    const { error } = await supabase
      .from("deadlines")
      .insert({ user_id: user.id, title: name, due_date: iso, category: "scholarship", notes: deadlineText });
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["deadlines"] });
    toast.success(`Reminder set for ${iso}`);
  };

  const exportPlan = () => {
    const text = buildPlanText({
      studentName: profile?.full_name,
      aggregate,
      targetCareer: profile?.target_career,
      region: profile?.region,
      school: profile?.school,
      summary: ai?.summary,
      scholarships: savedScholarships.map((s) => {
        const source = scholarships.find((x) => x.name === s.title);
        const aiMatch = ai?.matches?.find((m) => m.name === s.title);
        return {
          name: s.title,
          provider: s.subtitle,
          coverage: source?.coverage,
          deadline: source?.deadline,
          score: aiMatch?.score ?? statusFor(s.title)?.score,
          why: aiMatch?.why,
          gaps: aiMatch?.gaps ?? statusFor(s.title)?.gaps,
          nextStep: aiMatch?.nextStep ?? source?.howToApply,
        };
      }),
      deadlines: deadlines.map((d) => ({ title: d.title, due_date: d.due_date })),
      checklist: checklist.map((c) => ({ task: c.task, done: c.done })),
    });
    downloadPlan(text);
    toast.success("Plan downloaded");
  };

  const card = "bg-glass rounded-xl p-5";
  const scholarshipDeadlines = deadlines.filter((d) => d.category === "scholarship");

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" /> My Scholarship Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              AI matches, deadline alerts, eligibility rechecks and your exportable plan.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/compare-scholarships"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary text-sm text-muted-foreground hover:text-foreground"
            >
              <Scale className="h-4 w-4" /> Compare
            </Link>
            <button
              onClick={exportPlan}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              <Download className="h-4 w-4" /> Export my plan
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {/* AI matches */}
          <div className={`${card} lg:col-span-2`}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI scholarship matches
              </h2>
              <button
                onClick={runAi}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" /> {busy ? "Thinking..." : "Generate AI matches"}
              </button>
            </div>

            {!ai && !busy && (
              <p className="text-sm text-muted-foreground">
                Uses your WASSCE grades, target career and region to rank the funding you should actually chase.
              </p>
            )}

            {ai?.summary && <p className="text-sm text-foreground mb-4">{ai.summary}</p>}

            <div className="space-y-3">
              {ai?.matches?.map((m) => {
                const source = scholarships.find((s) => s.name === m.name);
                return (
                  <div key={m.name} className="rounded-lg bg-secondary/60 p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-medium text-foreground text-sm">{m.name}</h3>
                      <span className="shrink-0 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
                        {m.score}% match
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{m.why}</p>
                    {m.gaps?.map((g) => (
                      <p key={g} className="text-xs text-ghana-gold">! {g}</p>
                    ))}
                    {m.nextStep && (
                      <p className="text-xs text-foreground mt-2">
                        <span className="font-medium">Next step: </span>
                        {m.nextStep}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {source && (
                        <>
                          <SaveButton
                            item={{
                              item_type: "scholarship",
                              item_key: source.name,
                              title: source.name,
                              subtitle: source.provider,
                              metadata: { deadline: source.deadline, coverage: source.coverage },
                            }}
                          />
                          <button
                            onClick={() => trackDeadline(source.name, source.deadline)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Bell className="h-3.5 w-3.5" /> Alert me
                          </button>
                          {source.link && (
                            <a
                              href={source.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground"
                            >
                              Official page <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deadline alerts */}
          <div className={card}>
            <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> Deadline alerts
            </h2>
            {scholarshipDeadlines.length ? (
              <ul className="space-y-2">
                {scholarshipDeadlines.map((d) => {
                  const u = urgencyLabel(daysUntil(d.due_date));
                  return (
                    <li key={d.id} className="flex items-start justify-between gap-2 text-sm">
                      <div>
                        <p className="text-foreground">{d.title}</p>
                        <p className="text-xs text-muted-foreground">{d.due_date}</p>
                      </div>
                      <span className={`text-xs shrink-0 ${u.tone}`}>{u.text}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Tap “Alert me” on any scholarship to track its closing date here.
              </p>
            )}
          </div>

          {/* Eligibility recheck */}
          <div className={card}>
            <h2 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-primary" /> Eligibility recheck
            </h2>
            <p className="text-xs text-muted-foreground mb-3">
              Checked against your current aggregate {aggregate ?? "—"} and profile.
            </p>
            {savedScholarships.length ? (
              <ul className="space-y-3">
                {savedScholarships.map((s) => {
                  const st = statusFor(s.title);
                  const ok = (st?.score ?? 0) >= 60 && !(st?.gaps.length);
                  return (
                    <li key={s.id} className="text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-foreground">{s.title}</span>
                        <span className={`text-xs shrink-0 ${ok ? "text-primary" : "text-ghana-gold"}`}>
                          {ok ? "Still eligible" : "Check requirements"}
                        </span>
                      </div>
                      {st?.gaps.map((g) => (
                        <p key={g} className="text-xs text-muted-foreground mt-0.5">! {g}</p>
                      ))}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Save scholarships to have them rechecked automatically.</p>
            )}
          </div>

          {/* Saved scholarships */}
          <div className={`${card} lg:col-span-2`}>
            <h2 className="font-display font-semibold text-foreground mb-3">Saved scholarships</h2>
            {savedScholarships.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {savedScholarships.map((s) => {
                  const source = scholarships.find((x) => x.name === s.title);
                  return (
                    <div key={s.id} className="rounded-lg bg-secondary/60 p-4">
                      <p className="text-sm text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.subtitle}</p>
                      {source && (
                        <>
                          <p className="text-xs text-muted-foreground mt-2">Deadline: {source.deadline}</p>
                          <button
                            onClick={() => trackDeadline(source.name, source.deadline)}
                            className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Bell className="h-3.5 w-3.5" /> Alert me
                          </button>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nothing saved yet — <Link to="/matcher" className="text-primary">run the matcher</Link> to find options.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scholarships;
