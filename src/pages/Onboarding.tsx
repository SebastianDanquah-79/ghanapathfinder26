import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "@/lib/router-compat";
import { Loader2, Plus, Trash2 } from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const REGIONS = ["Greater Accra","Ashanti","Central","Eastern","Western","Volta","Northern","Upper East","Upper West","Bono","Ahafo","Oti","Savannah","North East","Western North","Bono East"];
const GRADES = ["A1","B2","B3","C4","C5","C6","D7","E8","F9"];
const CORE_SUBJECTS = ["English Language","Mathematics","Integrated Science","Social Studies"];
const INTERESTS = ["Technology","Medicine & Health","Engineering","Business","Law","Education","Agriculture","Creative Arts","Media","Public Service"];
type Role = "student" | "employee" | "employer" | "startup_founder";

const roleLabels: Record<Role,string> = {
  student: "Student",
  employee: "Job Seeker",
  employer: "Employer",
  startup_founder: "Startup Founder",
};

const Onboarding = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user, loading } = useAuth();
  const [saving,setSaving] = useState(false);
  const [role,setRole] = useState<Role>("student");
  const [fullName,setFullName] = useState("");
  const [school,setSchool] = useState("");
  const [region,setRegion] = useState("");
  const [career,setCareer] = useState("");
  const [bio,setBio] = useState("");
  const [location,setLocation] = useState("");
  const [university,setUniversity] = useState("");
  const [program,setProgram] = useState("");
  const [graduationYear,setGraduationYear] = useState("");
  const [company,setCompany] = useState("");
  const [jobTitle,setJobTitle] = useState("");
  const [linkedinUrl,setLinkedinUrl] = useState("");
  const [interests,setInterests] = useState<string[]>([]);
  const [skills,setSkills] = useState("");
  const [discoverable,setDiscoverable] = useState(false);
  const [results,setResults] = useState(CORE_SUBJECTS.map(subject => ({subject,grade:""})));

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading,user,navigate]);

  useEffect(() => {
    const raw = params.get("role") ?? localStorage.getItem("selectedRole");
    if (raw === "student" || raw === "employee" || raw === "employer" || raw === "startup_founder") setRole(raw);
  }, [params]);

  useEffect(() => {
    if (!user) return;
    void supabase.from("profiles").select("full_name,role,account_role,bio,location,university,program,graduation_year,company,job_title,linkedin_url,skills,is_discoverable").eq("id",user.id).maybeSingle().then(({data}) => {
      if (!data) return;
      setFullName(data.full_name ?? "");
      if (data.role === "student" || data.role === "employee" || data.role === "employer" || data.role === "startup_founder") setRole(data.role);
      setBio(data.bio ?? "");
      setLocation(data.location ?? "");
      setUniversity(data.university ?? "");
      setProgram(data.program ?? "");
      setGraduationYear(data.graduation_year ? String(data.graduation_year) : "");
      setCompany(data.company ?? "");
      setJobTitle(data.job_title ?? "");
      setLinkedinUrl(data.linkedin_url ?? "");
      setSkills((data.skills ?? []).join(", "));
      setDiscoverable(Boolean(data.is_discoverable));
    });
  }, [user]);

  const toggleInterest = (interest:string) => setInterests(current => current.includes(interest) ? current.filter(x => x !== interest) : [...current,interest]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const skillList = skills.split(",").map(x => x.trim()).filter(Boolean);
      const { error } = await supabase.from("profiles").upsert({
        id:user.id,
        email:user.email ?? null,
        full_name:fullName.trim() || null,
        role,
        account_role:role,
        account_type:role === "student" ? "student" : role,
        bio:bio.trim() || null,
        location:location.trim() || null,
        school:school.trim() || null,
        region:region || null,
        target_career:career.trim() || null,
        university:university.trim() || null,
        program:program.trim() || null,
        graduation_year:graduationYear ? Number(graduationYear) : null,
        company:company.trim() || null,
        job_title:jobTitle.trim() || null,
        linkedin_url:linkedinUrl.trim() || null,
        interests,
        skills:skillList,
        is_discoverable:discoverable,
        onboarding_complete:true,
        onboarded:true,
      }, {onConflict:"id"});
      if (error) throw error;

      const rows = results.filter(r => r.subject.trim() && r.grade).map(r => ({user_id:user.id,subject:r.subject.trim(),grade:r.grade}));
      const {error:deleteError} = await supabase.from("wassce_results").delete().eq("user_id",user.id);
      if (deleteError) throw deleteError;
      if (rows.length) {
        const {error:insertError} = await supabase.from("wassce_results").insert(rows);
        if (insertError) throw insertError;
      }

      localStorage.setItem("selectedRole",role);
      toast.success("Profile saved");
      const destination = role === "student" ? "/dashboard" : role === "employee" ? "/dashboard/employee" : role === "employer" ? "/dashboard/employer" : "/dashboard/founder";
      navigate(destination,{replace:true});
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not save profile";
      console.error("Profile save failed",error);
      toast.error("Could not save profile: " + message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50";

  return <div className="min-h-dvh bg-background px-4 py-8 pb-24">
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">GhanaPathFinder</p>
      <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-foreground">Build your path</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your profile powers matching across education, work, startups and international opportunities.</p>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(roleLabels) as Role[]).map(item => <button key={item} type="button" onClick={() => setRole(item)} className={"rounded-lg border px-3 py-3 text-sm font-medium " + (role === item ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground")}>{roleLabels[item]}</button>)}
      </div>

      <div className="mt-5 space-y-4">
        <section className="bg-glass rounded-xl p-5 space-y-3">
          <h2 className="font-display font-semibold text-foreground">About you</h2>
          <input className={inputClass} placeholder="Full name" value={fullName} maxLength={100} onChange={e => setFullName(e.target.value)} />
          <input className={inputClass} placeholder="Location" value={location} maxLength={120} onChange={e => setLocation(e.target.value)} />
          <textarea className={inputClass} placeholder="Short bio" value={bio} maxLength={500} onChange={e => setBio(e.target.value)} />
          {role === "student" && <>
            <input className={inputClass} placeholder="Senior High School" value={school} maxLength={120} onChange={e => setSchool(e.target.value)} />
            <select className={inputClass} value={region} onChange={e => setRegion(e.target.value)}><option value="">Select your region</option>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select>
            <input className={inputClass} placeholder="Target career" value={career} maxLength={100} onChange={e => setCareer(e.target.value)} />
          </>}
          {(role === "employee" || role === "employer" || role === "startup_founder") && <>
            <input className={inputClass} placeholder={role === "employee" ? "University" : "Company / organisation"} value={role === "employee" ? university : company} onChange={e => role === "employee" ? setUniversity(e.target.value) : setCompany(e.target.value)} />
            <input className={inputClass} placeholder={role === "employee" ? "Programme" : "Job title / founder role"} value={role === "employee" ? program : jobTitle} onChange={e => role === "employee" ? setProgram(e.target.value) : setJobTitle(e.target.value)} />
            <input className={inputClass} placeholder="Graduation year (optional)" inputMode="numeric" value={graduationYear} onChange={e => setGraduationYear(e.target.value.replace(/\\D/g,"").slice(0,4))} />
          </>}
          <input className={inputClass} placeholder="LinkedIn URL (optional)" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
          <input className={inputClass} placeholder="Skills, separated by commas" value={skills} onChange={e => setSkills(e.target.value)} />
          <label className="flex items-center gap-3 text-sm text-muted-foreground"><input type="checkbox" checked={discoverable} onChange={e => setDiscoverable(e.target.checked)} /> Make my professional profile discoverable to opted-in employers</label>
        </section>

        <section className="bg-glass rounded-xl p-5">
          <h2 className="font-display font-semibold text-foreground mb-3">Interests</h2>
          <div className="flex flex-wrap gap-2">{INTERESTS.map(i => <button key={i} type="button" onClick={() => toggleInterest(i)} className={"px-3 py-1.5 rounded-full text-xs font-medium " + (interests.includes(i) ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>{i}</button>)}</div>
        </section>

        {role === "student" && <section className="bg-glass rounded-xl p-5">
          <h2 className="font-display font-semibold text-foreground mb-1">WASSCE results</h2>
          <p className="text-xs text-muted-foreground mb-4">Add your subjects to power the existing admission and programme matching.</p>
          <div className="space-y-2">{results.map((r,index) => <div key={index} className="flex gap-2">
            <input className={inputClass} placeholder="Subject" value={r.subject} onChange={e => setResults(prev => prev.map((x,i) => i === index ? {...x,subject:e.target.value} : x))} />
            <select className="w-28 rounded-lg border border-border bg-secondary px-3 py-3 text-sm" value={r.grade} onChange={e => setResults(prev => prev.map((x,i) => i === index ? {...x,grade:e.target.value} : x))}><option value="">Grade</option>{GRADES.map(g => <option key={g}>{g}</option>)}</select>
            <button type="button" onClick={() => setResults(prev => prev.filter((_,i) => i !== index))} className="p-3 text-muted-foreground hover:text-destructive" aria-label="Remove subject"><Trash2 className="h-4 w-4" /></button>
          </div>)}</div>
          <button type="button" onClick={() => setResults(prev => [...prev,{subject:"",grade:""}])} className="mt-3 inline-flex items-center gap-1.5 text-sm text-primary font-medium"><Plus className="h-4 w-4" /> Add subject</button>
        </section>}

        <button onClick={handleSave} disabled={saving || !user} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-semibold text-primary-foreground disabled:opacity-50">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save and continue as {roleLabels[role]}
        </button>
      </div>
    </div>
  </div>;
};

export default Onboarding;
