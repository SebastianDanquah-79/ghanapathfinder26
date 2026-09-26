import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "@/lib/router-compat";
import { Loader2, Plus, Trash2 } from "@/lib/icons";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const REGIONS = ["Greater Accra","Ashanti","Central","Eastern","Western","Volta","Northern","Upper East","Upper West","Bono","Ahafo","Oti","Savannah","North East","Western North","Bono East"];
const GRADES = ["A1","B2","B3","C4","C5","C6","D7","E8","F9"];
const CORE_SUBJECTS = ["English Language","Mathematics","Integrated Science","Social Studies"];
const PATHWAYS = ["Learn","Find a job","Build a business","Find funding","Explore Africa","Travel","Meet people","Research","Hire talent","Study in Africa","Discover African companies","Discover African culture"];
const INTERESTS = ["AI","Robotics","Technology","Business","Startups","Education","Engineering","Science","Finance","Agriculture","Music","Fashion","Food","Tourism","History","Culture","Sports","Research","Careers","Entrepreneurship"];
type Role = "student" | "employee" | "employer" | "startup_founder" | "international_student";

const roleLabels: Record<Role,string> = {
  student: "Student",
  employee: "Job Seeker",
  employer: "Employer",
  startup_founder: "Startup Founder",
  international_student: "International Student",
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
  const [pathways,setPathways] = useState<string[]>([]);
  const [interests,setInterests] = useState<string[]>([]);
  const [skills,setSkills] = useState("");
  const [discoverable,setDiscoverable] = useState(false);
  const [avatarUrl,setAvatarUrl] = useState<string | null>(null);
  const [avatarFile,setAvatarFile] = useState<File | null>(null);
  const [results,setResults] = useState(CORE_SUBJECTS.map(subject => ({subject,grade:""})));

  useEffect(() => {
    if (!loading && !user) navigate("/auth", { replace: true });
  }, [loading,user,navigate]);

  useEffect(() => {
    const raw = params.get("role") ?? localStorage.getItem("selectedRole");
    if (raw === "student" || raw === "employee" || raw === "employer" || raw === "startup_founder" || raw === "international_student") setRole(raw);
  }, [params]);

  useEffect(() => {
    if (!user) return;
    void supabase.from("profiles").select("full_name,role,account_role,bio,location,university,program,graduation_year,company,job_title,linkedin_url,skills,is_discoverable,avatar_url").eq("id",user.id).maybeSingle().then(({data}) => {
      if (!data) return;
      setFullName(data.full_name ?? "");
      if (data.role === "student" || data.role === "employee" || data.role === "employer" || data.role === "startup_founder" || data.role === "international_student") setRole(data.role);
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
      setAvatarUrl(data.avatar_url ?? null);
    });
  }, [user]);

  const togglePathway = (pathway:string) => setPathways(current => current.includes(pathway) ? current.filter(x => x !== pathway) : [...current,pathway]);
  const toggleInterest = (interest:string) => setInterests(current => current.includes(interest) ? current.filter(x => x !== interest) : [...current,interest]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const skillList = skills.split(",").map((x) => x.trim()).filter(Boolean);
      let nextAvatarUrl = avatarUrl;

      if (avatarFile) {
        if (!["image/jpeg","image/png","image/webp"].includes(avatarFile.type)) throw new Error("Use a JPG, PNG or WebP image.");
        if (avatarFile.size > 5 * 1024 * 1024) throw new Error("Profile photo must be 5 MB or smaller.");
        const extension = avatarFile.type === "image/png" ? "png" : avatarFile.type === "image/webp" ? "webp" : "jpg";
        const objectPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(objectPath, avatarFile, {
          upsert:false, contentType:avatarFile.type, cacheControl:"3600",
        });
        if (uploadError) {
          console.error("Profile photo upload failed",uploadError);
          throw new Error(/bucket not found/i.test(uploadError.message)
            ? "Photo storage is unavailable for this app configuration. Please refresh and try again."
            : /row-level security|policy|unauthorized|403/i.test(uploadError.message)
              ? "You do not have permission to upload this photo. Please sign in again."
              : `Profile photo upload failed: ${uploadError.message}`);
        }
        const {data:publicData}=supabase.storage.from("avatars").getPublicUrl(objectPath);
        nextAvatarUrl=`${publicData.publicUrl}?v=${Date.now()}`;
      }

      const wassceRows=results.filter((r)=>r.subject.trim()&&r.grade).map((r)=>({subject:r.subject.trim(),grade:r.grade}));

      if (role === "student") {
        const {error:rpcError}=await (supabase.rpc as any)("save_profile_bundle",{
          p_full_name:fullName.trim()||"User", p_email:user.email??null, p_school:school.trim()||null,
          p_region:region||null, p_country_code:"GH", p_target_career:career.trim()||null,
          p_interests:interests, p_pathways:pathways, p_account_role:"student", p_wassce_results:wassceRows,
        });
        if (rpcError) {
          console.error("save_profile_bundle failed",rpcError);
          const missing=rpcError.code==="PGRST202"||rpcError.code==="42883";
          if (!missing) throw new Error(`Profile save failed: ${rpcError.message}`);
          const {error}=await supabase.from("profiles").upsert({
            id:user.id,email:user.email??null,full_name:fullName.trim()||null,role,account_role:role,
            account_type:"student",bio:bio.trim()||null,location:location.trim()||null,school:school.trim()||null,
            region:region||null,target_career:career.trim()||null,university:university.trim()||null,
            program:program.trim()||null,graduation_year:graduationYear?Number(graduationYear):null,
            company:company.trim()||null,job_title:jobTitle.trim()||null,linkedin_url:linkedinUrl.trim()||null,
            avatar_url:nextAvatarUrl,interests,skills:skillList,is_discoverable:discoverable,
            onboarding_complete:true,onboarded:true,pathways:pathways.length?pathways:[role],
          },{onConflict:"id"});
          if(error) throw new Error(`Profile update failed: ${error.message}`);
          const {error:de}=await supabase.from("wassce_results").delete().eq("user_id",user.id);
          if(de) throw new Error(`WASSCE results could not be updated: ${de.message}`);
          if(wassceRows.length){
            const {error:ie}=await supabase.from("wassce_results").insert(wassceRows.map((r)=>({...r,user_id:user.id})));
            if(ie) throw new Error(`WASSCE results could not be saved: ${ie.message}`);
          }
        }
        const {error}=await supabase.from("profiles").update({
          role,account_role:role,account_type:"student",bio:bio.trim()||null,location:location.trim()||null,
          university:university.trim()||null,program:program.trim()||null,graduation_year:graduationYear?Number(graduationYear):null,
          company:company.trim()||null,job_title:jobTitle.trim()||null,linkedin_url:linkedinUrl.trim()||null,
          avatar_url:nextAvatarUrl,skills:skillList,is_discoverable:discoverable,onboarding_complete:true,onboarded:true,
          pathways:pathways.length?pathways:[role],
        }).eq("id",user.id);
        if(error) throw new Error(`Profile details could not be saved: ${error.message}`);
      } else {
        const {error}=await supabase.from("profiles").upsert({
          id:user.id,email:user.email??null,full_name:fullName.trim()||null,role,account_role:role,
          account_type:role,bio:bio.trim()||null,location:location.trim()||null,school:school.trim()||null,
          region:region||null,target_career:career.trim()||null,university:university.trim()||null,
          program:program.trim()||null,graduation_year:graduationYear?Number(graduationYear):null,
          company:company.trim()||null,job_title:jobTitle.trim()||null,linkedin_url:linkedinUrl.trim()||null,
          avatar_url:nextAvatarUrl,interests,skills:skillList,is_discoverable:discoverable,
          onboarding_complete:true,onboarded:true,pathways:pathways.length?pathways:[role],
        },{onConflict:"id"});
        if(error) throw new Error(`Profile update failed: ${error.message}`);
      }

      if(role==="employee"){
        const {error}=await supabase.from("employee_profiles").upsert({
          user_id:user.id,professional_title:jobTitle.trim()||career.trim()||null,employer_name:company.trim()||null,
        },{onConflict:"user_id"});
        if(error) throw new Error(`Employee profile could not be saved: ${error.message}`);
      }
      if(role==="employer"){
        const {error}=await supabase.from("employer_profiles").upsert({
          user_id:user.id,organization_name:company.trim()||fullName.trim()||null,
          organization_type:jobTitle.trim()||null,hiring_focus:skills.trim()||career.trim()||null,
        },{onConflict:"user_id"});
        if(error) throw new Error(`Employer profile could not be saved: ${error.message}`);
      }
      if(role==="startup_founder"){
        const {error}=await supabase.from("founder_profiles").upsert({
          user_id:user.id,startup_name:company.trim()||null,sector:interests[0]||null,
        },{onConflict:"user_id"});
        if(error) throw new Error(`Founder profile could not be saved: ${error.message}`);
      }
      if(role==="international_student"){
        const {error}=await supabase.from("international_students").upsert({
          user_id:user.id,university_name:university.trim()||null,programme_name:program.trim()||null,
          graduation_year:graduationYear?Number(graduationYear):null,skills:skillList,interests,
          is_discoverable:discoverable,visible:discoverable,
          open_to_collaboration:pathways.includes("Meet people")||pathways.includes("Build a business"),
          open_to_mentorship:pathways.includes("Meet people"),
          looking_for_opportunities:pathways.includes("Find a job")||pathways.includes("Find funding"),
        },{onConflict:"user_id"});
        if(error) throw new Error(`International student profile could not be saved: ${error.message}`);
      }

      if(nextAvatarUrl){
        const {error}=await supabase.auth.updateUser({data:{avatar_url:nextAvatarUrl}});
        if(error) console.warn("Avatar display metadata update failed",error);
      }
      setAvatarUrl(nextAvatarUrl); setAvatarFile(null); localStorage.setItem("selectedRole",role);
      toast.success("Profile saved");
      const destination=role==="student"?"/portal/student":role==="employee"?"/portal/employee":role==="employer"?"/portal/employer":role==="startup_founder"?"/portal/founder":"/portal/international-student";
      navigate(destination,{replace:true});
    } catch(error) {
      const message=error instanceof Error?error.message:"Could not save profile";
      console.error("Onboarding save failed",{error,userId:user.id,role});
      toast.error(message);
    } finally { setSaving(false); }
  };


  const inputClass = "w-full px-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50";

  return <div className="min-h-dvh bg-background px-4 py-8 pb-24">
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">GhanaPathFinder</p>
      <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-foreground">Build your path</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your profile powers matching across education, work, startups and international opportunities.</p>

      <section className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display font-semibold text-foreground">What brings you here?</h2>
        <p className="mt-1 text-xs text-muted-foreground">Choose as many as you want. These choices shape your discovery experience.</p>
        <div className="mt-3 flex flex-wrap gap-2">{PATHWAYS.map(item => <button key={item} type="button" onClick={() => togglePathway(item)} aria-pressed={pathways.includes(item)} className={"rounded-full border px-3 py-2 text-xs font-medium " + (pathways.includes(item) ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground")}>{item}</button>)}</div>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(Object.keys(roleLabels) as Role[]).map(item => <button key={item} type="button" onClick={() => setRole(item)} className={"rounded-lg border px-3 py-3 text-sm font-medium " + (role === item ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground")}>{roleLabels[item]}</button>)}
      </div>

      <div className="mt-5 space-y-4">
        <section className="bg-glass rounded-xl p-5 space-y-3">
          <h2 className="font-display font-semibold text-foreground">About you</h2>
          <div className="flex items-center gap-4 rounded-lg border border-border bg-secondary/40 p-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-border bg-background grid place-items-center">
              {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : <span className="text-xs text-muted-foreground">Photo</span>}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Profile photo</p>
              <p className="text-xs text-muted-foreground">Optional. JPG, PNG or WebP, up to 5 MB.</p>
              <label className="mt-2 inline-flex cursor-pointer rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium hover:bg-secondary">
                {avatarFile ? avatarFile.name : "Choose photo"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={e => { const file=e.target.files?.[0] ?? null; if(file && file.size > 5*1024*1024){toast.error("Profile photo must be 5 MB or smaller.");return;} setAvatarFile(file); if(file) setAvatarUrl(URL.createObjectURL(file)); }} />
              </label>
            </div>
          </div>
          <input className={inputClass} placeholder="Full name" value={fullName} maxLength={100} onChange={e => setFullName(e.target.value)} />
          <input className={inputClass} placeholder="Location" value={location} maxLength={120} onChange={e => setLocation(e.target.value)} />
          <textarea className={inputClass} placeholder="Short bio" value={bio} maxLength={500} onChange={e => setBio(e.target.value)} />
          {role === "student" && <>
            <input className={inputClass} placeholder="Senior High School" value={school} maxLength={120} onChange={e => setSchool(e.target.value)} />
            <select className={inputClass} value={region} onChange={e => setRegion(e.target.value)}><option value="">Select your region</option>{REGIONS.map(r => <option key={r} value={r}>{r}</option>)}</select>
            <input className={inputClass} placeholder="Target career" value={career} maxLength={100} onChange={e => setCareer(e.target.value)} />
          </>}
          {(role === "employee" || role === "employer" || role === "startup_founder" || role === "international_student") && <>
            <input className={inputClass} placeholder={role === "employee" || role === "international_student" ? "University" : "Company / organisation"} value={role === "employee" || role === "international_student" ? university : company} onChange={e => role === "employee" ? setUniversity(e.target.value) : setCompany(e.target.value)} />
            <input className={inputClass} placeholder={role === "employee" || role === "international_student" ? "Programme" : "Job title / founder role"} value={role === "employee" || role === "international_student" ? program : jobTitle} onChange={e => role === "employee" ? setProgram(e.target.value) : setJobTitle(e.target.value)} />
            <input className={inputClass} placeholder="Graduation year (optional)" inputMode="numeric" value={graduationYear} onChange={e => setGraduationYear(e.target.value.replace(/\\D/g,"").slice(0,4))} />
          </>}
          <input className={inputClass} placeholder="LinkedIn URL (optional)" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
          <input className={inputClass} placeholder="Skills, separated by commas" value={skills} onChange={e => setSkills(e.target.value)} />
          <label className="flex items-center gap-3 text-sm text-muted-foreground"><input type="checkbox" checked={discoverable} onChange={e => setDiscoverable(e.target.checked)} /> Make my professional profile discoverable to opted-in employers</label>
        </section>

        <section className="bg-glass rounded-xl p-5">
          <h2 className="font-display font-semibold text-foreground mb-1">What are you interested in?</h2>
          <p className="text-xs text-muted-foreground mb-3">Select multiple topics. You can change these later in Preferences.</p>
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
