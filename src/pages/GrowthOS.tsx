import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { toast } from "sonner";
import { BriefcaseBusiness, CheckCircle2, GraduationCap, Loader2, Plus, Save, Trash2, Users } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Journey = {
  education_stage: string;
  institution: string;
  programme: string;
  graduation_year: string;
  target_career: string;
  preferred_sectors: string[];
  preferred_region: string;
  nss_status: string;
  nss_organisation: string;
  notes: string;
};

const emptyJourney: Journey = {
  education_stage: "secondary_school",
  institution: "",
  programme: "",
  graduation_year: "",
  target_career: "",
  preferred_sectors: [],
  preferred_region: "",
  nss_status: "not_applicable",
  nss_organisation: "",
  notes: "",
};

const stageOptions = [
  ["secondary_school", "Senior high school"],
  ["tertiary_year_1", "Tertiary · Year 1"],
  ["tertiary_year_2", "Tertiary · Year 2"],
  ["tertiary_year_3", "Tertiary · Year 3"],
  ["tertiary_year_4", "Tertiary · Year 4"],
  ["tertiary_year_5_plus", "Tertiary · Year 5 or above"],
  ["graduate", "Graduated"],
  ["national_service", "National service"],
  ["employed", "Employed"],
];

const nssOptions = [
  ["not_applicable", "Not applicable yet"],
  ["not_started", "Not started"],
  ["preparing", "Preparing documents"],
  ["seeking_placement", "Seeking a placement"],
  ["posted", "Posted"],
  ["completed", "Completed"],
];

const defaultMilestones = [
  { title: "Write down my course, career direction and graduation year", category: "study", sort_order: 1 },
  { title: "Build a CV and a professional profile", category: "career", sort_order: 2 },
  { title: "Complete a relevant project or practical skills course", category: "skills", sort_order: 3 },
  { title: "Find an internship or industrial attachment", category: "experience", sort_order: 4 },
  { title: "Prepare for NSS registration and placement", category: "nss", sort_order: 5 },
];

const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40";
const cardClass = "rounded-xl border border-border bg-card p-5";

const GrowthOS = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const db = supabase as any;
  const seeded = useRef(false);
  const [journey, setJourney] = useState<Journey>(emptyJourney);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState("");

  const profileQuery = useQuery({
    queryKey: ["growth-journey", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("student_growth_journey").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const milestoneQuery = useQuery({
    queryKey: ["growth-milestones", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("student_growth_milestones").select("*").eq("user_id", user!.id).order("sort_order").order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const opportunitiesQuery = useQuery({
    queryKey: ["growth-current-opportunities"],
    queryFn: async () => {
      const { data, error } = await db.from("opportunities")
        .select("id,title,company_name,organisation,city,country,country_code,description,opportunity_type,type,category,application_url,apply_url,source_url,deadline_date,last_verified_at,skills,skills_required,fields,eligibility,requirements")
        .eq("published", true).eq("is_active", true).eq("verified", true)
        .or("country_code.eq.GH,country.eq.Ghana")
        .in("opportunity_type", ["internship", "national_service", "attachment", "graduate_programme"])
        .order("posted_at", { ascending: false }).limit(24);
      if (error) throw error;
      const now = Date.now();
      return (data ?? []).filter((item: any) => !item.deadline_date || new Date(item.deadline_date).getTime() >= now);
    },
    staleTime: 120_000,
  });

  const pipelineQuery = useQuery({
    queryKey: ["growth-opportunity-pipeline", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await db.from("opportunity_pipeline")
        .select("id,item_kind,item_ref,title,organisation,stage,deadline_date,url,notes,updated_at")
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false })
        .limit(60);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      const data = profileQuery.data;
      setJourney({
        education_stage: data.education_stage ?? "secondary_school",
        institution: data.institution ?? "",
        programme: data.programme ?? "",
        graduation_year: data.graduation_year ? String(data.graduation_year) : "",
        target_career: data.target_career ?? "",
        preferred_sectors: data.preferred_sectors ?? [],
        preferred_region: data.preferred_region ?? "",
        nss_status: data.nss_status ?? "not_applicable",
        nss_organisation: data.nss_organisation ?? "",
        notes: data.notes ?? "",
      });
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (!user || !milestoneQuery.isSuccess || milestoneQuery.data.length || seeded.current) return;
    seeded.current = true;
    void db.from("student_growth_milestones")
      .insert(defaultMilestones.map((item) => ({ ...item, user_id: user.id })))
      .then(({ error }: { error: unknown }) => {
        if (error) {
          console.error("Default growth milestones could not be added", error);
          return;
        }
        void queryClient.invalidateQueries({ queryKey: ["growth-milestones", user.id] });
      });
  }, [user, milestoneQuery.isSuccess, milestoneQuery.data, db, queryClient]);

  const completedCount = useMemo(() => (milestoneQuery.data ?? []).filter((item: any) => item.is_complete).length, [milestoneQuery.data]);
  const totalCount = milestoneQuery.data?.length ?? 0;

  const saveJourney = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const year = journey.graduation_year.trim() ? Number(journey.graduation_year) : null;
      if (year !== null && (!Number.isInteger(year) || year < 2000 || year > 2100)) throw new Error("Enter a valid graduation year.");
      const { error } = await db.from("student_growth_journey").upsert({
        user_id: user.id,
        education_stage: journey.education_stage,
        institution: journey.institution.trim() || null,
        programme: journey.programme.trim() || null,
        graduation_year: year,
        target_career: journey.target_career.trim() || null,
        preferred_sectors: journey.preferred_sectors,
        preferred_region: journey.preferred_region || null,
        nss_status: journey.nss_status,
        nss_organisation: journey.nss_organisation.trim() || null,
        notes: journey.notes.trim() || null,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });
      if (error) throw error;
      toast.success("Your education and career journey has been saved.");
      void queryClient.invalidateQueries({ queryKey: ["growth-journey", user.id] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your journey could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const toggleMilestone = async (id: string, checked: boolean) => {
    const { error } = await db.from("student_growth_milestones").update({ is_complete: checked, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) toast.error("This milestone could not be updated.");
    else void queryClient.invalidateQueries({ queryKey: ["growth-milestones", user?.id] });
  };

  const addMilestone = async () => {
    if (!user || !newTask.trim()) return;
    const { error } = await db.from("student_growth_milestones").insert({
      user_id: user.id, title: newTask.trim().slice(0, 180), category: "career", sort_order: 20,
    });
    if (error) toast.error("Your milestone could not be added.");
    else {
      setNewTask("");
      void queryClient.invalidateQueries({ queryKey: ["growth-milestones", user.id] });
    }
  };

  const deleteMilestone = async (id: string) => {
    const { error } = await db.from("student_growth_milestones").delete().eq("id", id);
    if (error) toast.error("This milestone could not be removed.");
    else void queryClient.invalidateQueries({ queryKey: ["growth-milestones", user?.id] });
  };

  const trackOpportunity = async (item: any) => {
    if (!user) return;
    const itemKind = item.opportunity_type || "internship";
    const url = item.application_url || item.apply_url || item.source_url || null;
    const { error } = await db.from("opportunity_pipeline").upsert({
      user_id: user.id,
      item_kind: itemKind,
      item_ref: String(item.id),
      title: item.title,
      organisation: item.company_name || item.organisation || null,
      stage: "interested",
      deadline_date: item.deadline_date || null,
      url,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,item_kind,item_ref", ignoreDuplicates: true });
    if (error) {
      toast.error(error.message || "This opportunity could not be added.");
      return;
    }
    toast.success("Added to your opportunity pipeline.");
    void queryClient.invalidateQueries({ queryKey: ["growth-opportunity-pipeline", user.id] });
  };

  const updateOpportunityStage = async (id: string, stage: string) => {
    const { error } = await db.from("opportunity_pipeline").update({
      stage,
      updated_at: new Date().toISOString(),
    }).eq("id", id);
    if (error) toast.error("The application stage could not be updated.");
    else void queryClient.invalidateQueries({ queryKey: ["growth-opportunity-pipeline", user?.id] });
  };

  const removeOpportunityFromPipeline = async (id: string) => {
    const { error } = await db.from("opportunity_pipeline").delete().eq("id", id);
    if (error) toast.error("This opportunity could not be removed.");
    else void queryClient.invalidateQueries({ queryKey: ["growth-opportunity-pipeline", user?.id] });
  };

  const setField = <K extends keyof Journey>(key: K, value: Journey[K]) => setJourney((current) => ({ ...current, [key]: value }));
  const toggleSector = (sector: string) => setField("preferred_sectors", journey.preferred_sectors.includes(sector) ? journey.preferred_sectors.filter((item) => item !== sector) : [...journey.preferred_sectors, sector]);

  if (!loading && !user) {
    void navigate("/auth?next=/growth", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-20 sm:px-8">
      <Seo title="My Growth OS | GhanaPathFinder" description="Track your education journey from school to university, internships, national service and early career opportunities." path="/growth" />
      <Navbar />
      <main className="mx-auto max-w-5xl">
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">My Path · Growth OS</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Your education-to-career journey</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Keep your study plans, practical experience, national service preparation and early-career goals in one place. Your records are private to your account.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/waec-scan" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Scan WASSCE results</Link>
            <Link to="/mentorship" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground">Find a mentor</Link>
            <Link to="/internships" className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground">Explore internships</Link>
          </div>
        </header>

        <section className={cardClass + " mb-5"}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /><h2 className="font-semibold">My education and career profile</h2></div>
            {profileQuery.isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="text-xs text-muted-foreground">Current stage
              <select className={inputClass + " mt-1"} value={journey.education_stage} onChange={(event) => setField("education_stage", event.target.value)}>
                {stageOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">Expected graduation year
              <input className={inputClass + " mt-1"} type="number" min="2000" max="2100" placeholder="e.g. 2030" value={journey.graduation_year} onChange={(event) => setField("graduation_year", event.target.value)} />
            </label>
            <label className="text-xs text-muted-foreground">School or university
              <input className={inputClass + " mt-1"} placeholder="Institution name" value={journey.institution} onChange={(event) => setField("institution", event.target.value)} />
            </label>
            <label className="text-xs text-muted-foreground">Course or programme
              <input className={inputClass + " mt-1"} placeholder="e.g. Computer Science" value={journey.programme} onChange={(event) => setField("programme", event.target.value)} />
            </label>
            <label className="text-xs text-muted-foreground sm:col-span-2">Target career
              <input className={inputClass + " mt-1"} placeholder="What kind of work are you working towards?" value={journey.target_career} onChange={(event) => setField("target_career", event.target.value)} />
            </label>
            <label className="text-xs text-muted-foreground">Preferred region
              <select className={inputClass + " mt-1"} value={journey.preferred_region} onChange={(event) => setField("preferred_region", event.target.value)}>
                <option value="">No preference</option>
                {["Greater Accra","Ashanti","Central","Eastern","Western","Volta","Northern","Upper East","Upper West","Bono","Ahafo","Oti","Savannah","North East","Western North","Bono East"].map((region) => <option key={region} value={region}>{region}</option>)}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">NSS progress
              <select className={inputClass + " mt-1"} value={journey.nss_status} onChange={(event) => setField("nss_status", event.target.value)}>
                {nssOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            {journey.nss_status === "posted" && <label className="text-xs text-muted-foreground sm:col-span-2">NSS organisation / placement
              <input className={inputClass + " mt-1"} value={journey.nss_organisation} onChange={(event) => setField("nss_organisation", event.target.value)} placeholder="Organisation or institution" />
            </label>}
            <label className="text-xs text-muted-foreground sm:col-span-2">Notes for my future self
              <textarea className={inputClass + " mt-1 min-h-20 resize-y"} value={journey.notes} onChange={(event) => setField("notes", event.target.value)} maxLength={1200} placeholder="Record your preferred industries, questions or next steps." />
            </label>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-foreground">Industries I am interested in</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Technology","Finance","Engineering","Healthcare","Education","Agriculture","Energy","Public service","Creative industries","Research"].map((sector) => (
                <button key={sector} type="button" aria-pressed={journey.preferred_sectors.includes(sector)} onClick={() => toggleSector(sector)} className={`rounded-full border px-3 py-1.5 text-xs ${journey.preferred_sectors.includes(sector) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>{sector}</button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => void saveJourney()} disabled={saving} className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save my journey
          </button>
        </section>

        <section className={cardClass + " mb-5"}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-primary" /><h2 className="font-semibold">My milestones</h2></div><p className="mt-1 text-xs text-muted-foreground">Track real actions as you move through school, tertiary education and work.</p></div>
            <p className="text-sm font-semibold tabular-nums">{completedCount}/{totalCount} complete</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all" style={{ width: totalCount ? `${(completedCount / totalCount) * 100}%` : "0%" }} /></div>
          {milestoneQuery.isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading milestones…</p> : (
            <div className="mt-4 space-y-2">
              {(milestoneQuery.data ?? []).map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-3">
                  <input type="checkbox" checked={item.is_complete} onChange={(event) => void toggleMilestone(item.id, event.target.checked)} className="h-4 w-4 shrink-0 accent-[hsl(var(--primary))]" />
                  <span className={`flex-1 text-sm ${item.is_complete ? "text-muted-foreground line-through" : "text-foreground"}`}>{item.title}</span>
                  <span className="hidden text-[10px] uppercase tracking-wide text-muted-foreground sm:inline">{item.category}</span>
                  <button type="button" aria-label="Remove milestone" onClick={() => void deleteMilestone(item.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input className={inputClass} value={newTask} maxLength={180} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void addMilestone(); } }} placeholder="Add a milestone you want to complete" />
            <button type="button" onClick={() => void addMilestone()} disabled={!newTask.trim()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground disabled:opacity-40"><Plus className="h-4 w-4" /> Add</button>
          </div>
        </section>

        <section className={cardClass + " mb-5"}>
          <div className="flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-primary" /><h2 className="font-semibold">Internship and NSS opportunity pipeline</h2></div>
          <p className="mt-1 text-sm text-muted-foreground">Only source-verified, published listings from the platform database appear here. Confirm each opening and its deadline on the organisation's official page.</p>
          {opportunitiesQuery.isLoading ? <p className="mt-4 text-sm text-muted-foreground">Checking current opportunities…</p> : opportunitiesQuery.isError ? <p className="mt-4 text-sm text-destructive">Current opportunity listings could not be loaded. Open the internships directory to browse employer information.</p> : opportunitiesQuery.data?.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {opportunitiesQuery.data.map((item: any) => (
                <article key={item.id} className="rounded-lg border border-border p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">{item.category || item.opportunity_type}</p>
                  <h3 className="mt-1 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.company_name || item.organisation || "Organisation"}{item.city ? ` · ${item.city}` : ""}</p>
                  {item.description && <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.description}</p>}
                  {item.deadline_date && <p className="mt-2 text-xs text-muted-foreground">Deadline: {new Date(item.deadline_date).toLocaleDateString("en-GB")}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {(item.application_url || item.apply_url || item.source_url) && <a className="inline-flex text-xs font-semibold text-primary underline underline-offset-4" href={item.application_url || item.apply_url || item.source_url} target="_blank" rel="noopener noreferrer">Open source listing</a>}
                    <button type="button" onClick={() => void trackOpportunity(item)} disabled={(pipelineQuery.data ?? []).some((entry: any) => entry.item_ref === String(item.id) && entry.item_kind === item.opportunity_type)} className="min-h-8 rounded-lg border border-border px-3 text-xs font-semibold text-foreground disabled:opacity-50">
                      {(pipelineQuery.data ?? []).some((entry: any) => entry.item_ref === String(item.id) && entry.item_kind === item.opportunity_type) ? "In your pipeline" : "Track this opening"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : <div className="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">There are no current verified NSS or internship listings in this feed. The employer directory still has general application guidance and links.</div>}
          <div className="mt-6 border-t border-border pt-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground">My tracked applications</h3>
              <span className="text-xs text-muted-foreground">{pipelineQuery.data?.length ?? 0} tracked</span>
            </div>
            {pipelineQuery.isLoading ? <p className="mt-3 text-sm text-muted-foreground">Loading your pipeline…</p> : pipelineQuery.data?.length ? (
              <div className="mt-3 space-y-2">
                {pipelineQuery.data.map((entry: any) => (
                  <article key={entry.id} className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{entry.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{entry.organisation || "Organisation"}{entry.deadline_date ? ` · Deadline ${new Date(entry.deadline_date).toLocaleDateString("en-GB")}` : ""}</p>
                      {entry.url && <a href={entry.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex text-xs text-primary underline underline-offset-4">Open application source</a>}
                    </div>
                    <label className="text-xs text-muted-foreground">Stage
                      <select className={inputClass + " mt-1 min-w-32"} value={entry.stage} onChange={(event) => void updateOpportunityStage(entry.id, event.target.value)}>
                        {["interested","preparing","applied","interview","offered","completed","not_selected"].map((stage) => <option key={stage} value={stage}>{stage.replaceAll("_"," ")}</option>)}
                      </select>
                    </label>
                    <button type="button" onClick={() => void removeOpportunityFromPipeline(entry.id)} aria-label={`Remove ${entry.title} from pipeline`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </article>
                ))}
              </div>
            ) : <p className="mt-3 text-sm text-muted-foreground">Save an opportunity above to track its stage here: interested, preparing, applied, interview, offer or completed.</p>}
          </div>
          <Link to="/internships/" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Browse the Ghana employer directory <BriefcaseBusiness className="h-4 w-4" /></Link>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <Link to="/mentorship" className="rounded-xl border border-border bg-card p-5 hover:border-primary"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><h2 className="font-semibold">Verified local mentors</h2></div><p className="mt-2 text-sm text-muted-foreground">Find opted-in, reviewed upper-year students and fellows who can share peer-to-peer programme advice.</p></Link>
          <Link to="/admission-match" className="rounded-xl border border-border bg-card p-5 hover:border-primary"><div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /><h2 className="font-semibold">Admission and programme match</h2></div><p className="mt-2 text-sm text-muted-foreground">Use your reviewed WASSCE grades to compare programme reference data.</p></Link>
        </section>
      </main>
    </div>
  );
};

export default GrowthOS;
