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
  const [countryCode,setCountryCode] = useState("");
  const [university,setUniversity] = useState("");
  const [program,setProgram] = useState("");
  const [graduationYear,setGraduationYear] = useState("");
  const [company,setCompany] = useState("");
  const [jobTitle,setJobTitle] = useState("");
  const [startupSector,setStartupSector] = useState("");
  const [startupStage,setStartupStage] = useState("Idea");
  const [startupWebsite,setStartupWebsite] = useState("");
  const [startupPitch,setStartupPitch] = useState("");
  const [startupDescription,setStartupDescription] = useState("");
  const [startupProblem,setStartupProblem] = useState("");
  const [startupSolution,setStartupSolution] = useState("");
  const [startupTargetMarket,setStartupTargetMarket] = useState("");
  const [startupBusinessModel,setStartupBusinessModel] = useState("");
  const [startupTeamSize,setStartupTeamSize] = useState("");
  const [startupFoundedYear,setStartupFoundedYear] = useState("");
  const [startupFundingStage,setStartupFundingStage] = useState("");
  const [startupFundingNeeded,setStartupFundingNeeded] = useState("");
  const [startupFundingCurrency,setStartupFundingCurrency] = useState("GHS");
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
    const selected = params.get("role") ?? localStorage.getItem("selectedRole");
    const raw = selected === "founder" ? "startup_founder" : selected === "international-student" ? "international_student" : selected;
    if (raw === "student" || raw === "employee" || raw === "employer" || raw === "startup_founder" || raw === "international_student") setRole(raw);
  }, [params]);

  useEffect(() => {
    if (!user) return;
    void supabase.from("profiles").select("full_name,role,account_role,bio,location,linkedin_url,avatar_url").eq("id",user.id).maybeSingle().then(({data}) => {
      if (!data) return;
      setFullName(data.full_name ?? "");
      if (!params.get("role") && (data.account_role || data.role)) {
        const savedRole = data.account_role || data.role;
        const normalizedRole = savedRole === "founder" ? "startup_founder" : savedRole === "international-student" ? "international_student" : savedRole;
        if (normalizedRole === "student" || normalizedRole === "employee" || normalizedRole === "employer" || normalizedRole === "startup_founder" || normalizedRole === "international_student") setRole(normalizedRole);
      }
      setBio(data.bio ?? "");
      setLocation(data.location ?? "");
      setLinkedinUrl(data.linkedin_url ?? "");
      setAvatarUrl(data.avatar_url ?? null);
    });
  }, [user, params]);

  useEffect(() => {
    if (!user || role !== "student") return;
    void Promise.all([
      supabase.from("student_profiles").select("school,region,country_code,target_career,interests,pathways").eq("user_id",user.id).maybeSingle(),
      supabase.from("wassce_results").select("subject,grade").eq("user_id",user.id),
    ]).then(([profileResult, gradesResult]) => {
      if (profileResult.data) {
        setSchool(profileResult.data.school ?? "");
        setRegion(profileResult.data.region ?? "");
        setCareer(profileResult.data.target_career ?? "");
        setInterests(profileResult.data.interests ?? []);
        setPathways(profileResult.data.pathways ?? []);
      }
      if (gradesResult.data?.length) {
        const saved = new Map(gradesResult.data.map(row => [row.subject, row.grade]));
        setResults(CORE_SUBJECTS.map(subject => ({subject, grade: saved.get(subject) ?? ""})));
      }
    });
  }, [user, role]);

  useEffect(() => {
    if (!user || role !== "employee") return;
    void supabase.from("employee_profiles").select("professional_title,employer_name,bio,skills,education_level,university,graduation_year,location,linkedin_url,discoverable,interests,preferred_locations,preferred_industries,preferred_opportunity_types").eq("user_id",user.id).maybeSingle().then(({data}) => {
      if (!data) return;
      setJobTitle(data.professional_title ?? "");
      setCompany(data.employer_name ?? "");
      setProgram(data.education_level ?? "");
      setUniversity(data.university ?? "");
      setGraduationYear(data.graduation_year ? String(data.graduation_year) : "");
      setLocation(data.location ?? "");
      setBio(data.bio ?? "");
      setLinkedinUrl(data.linkedin_url ?? "");
      setSkills((data.skills ?? []).join(", "));
      setInterests(data.interests ?? []);
      setDiscoverable(Boolean(data.discoverable));
    });
  }, [user, role]);

  useEffect(() => {
    if (!user || role !== "employer") return;
    void supabase.from("employer_profiles").select("organization_name,organization_type,hiring_focus").eq("user_id",user.id).maybeSingle().then(({data}) => {
      if (!data) return;
      setCompany(data.organization_name ?? "");
      setJobTitle(data.organization_type ?? "");
      setSkills((data.hiring_focus ?? []).join(", "));
    });
  }, [user, role]);

  useEffect(() => {
    if (!user || role !== "startup_founder") return;
    void supabase.from("founder_profiles").select("startup_name,sector,stage,website_url,pitch_url,description,problem_statement,solution_summary,target_market,business_model,team_size,founded_year,funding_stage,funding_needed,funding_currency,skills,interests").eq("user_id", user.id).maybeSingle().then(({data}) => {
      if (!data) return;
      setCompany(data.startup_name ?? "");
      setStartupSector(data.sector ?? "");
      setStartupStage(data.stage ?? "Idea");
      setStartupWebsite(data.website_url ?? "");
      setStartupPitch(data.pitch_url ?? "");
      setStartupDescription(data.description ?? "");
      setStartupProblem(data.problem_statement ?? "");
      setStartupSolution(data.solution_summary ?? "");
      setStartupTargetMarket(data.target_market ?? "");
      setStartupBusinessModel(data.business_model ?? "");
      setStartupTeamSize(data.team_size == null ? "" : String(data.team_size));
      setStartupFoundedYear(data.founded_year == null ? "" : String(data.founded_year));
      setStartupFundingStage(data.funding_stage ?? "");
      setStartupFundingNeeded(data.funding_needed == null ? "" : String(data.funding_needed));
      setStartupFundingCurrency(data.funding_currency ?? "GHS");
      setSkills((data.skills ?? []).join(", "));
      setInterests(data.interests ?? []);
    });
  }, [user, role]);

  useEffect(() => {
    if (!user || role !== "international_student") return;
    void supabase.from("international_students").select("country_code,university_name,programme_name,graduation_year,skills,interests,visible,open_to_collaboration,open_to_mentorship,looking_for_opportunities").eq("user_id", user.id).maybeSingle().then(({data}) => {
      if (!data) return;
      setCountryCode(data.country_code ?? "");
      setUniversity(data.university_name ?? "");
      setProgram(data.programme_name ?? "");
      setGraduationYear(data.graduation_year ? String(data.graduation_year) : "");
      setSkills((data.skills ?? []).join(", "));
      setInterests(data.interests ?? []);
      setDiscoverable(Boolean(data.visible));
      const savedPathways = [];
      if (data.open_to_collaboration) savedPathways.push("Meet people");
      if (data.looking_for_opportunities) savedPathways.push("Find a job");
      setPathways(savedPathways);
    });
  }, [user, role]);

  const togglePathway = (pathway:string) => setPathways(current => current.includes(pathway) ? current.filter(x => x !== pathway) : [...current,pathway]);
  const toggleInterest = (interest:string) => setInterests(current => current.includes(interest) ? current.filter(x => x !== interest) : [...current,interest]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const skillList = skills.split(",").map((x) => x.trim()).filter(Boolean);
      if (role === "employee" && discoverable && (!fullName.trim() || !jobTitle.trim())) throw new Error("Add your name and professional title before making your profile discoverable.");
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
            onboarding_complete:true,onboarded:true,
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
        }).eq("id",user.id);
        if(error) throw new Error(`Profile details could not be saved: ${error.message}`);
        const {error: studentProfileError}=await supabase.from("student_profiles").upsert({
          user_id:user.id,
          school:school.trim()||null,
          region:region||null,
          country_code:"GH",
          target_career:career.trim()||null,
          interests,
          pathways,
        },{onConflict:"user_id"});
        if(studentProfileError) throw new Error(`Student profile could not be saved: ${studentProfileError.message}`);
      } else {
        const {error}=await supabase.from("profiles").upsert({
          id:user.id,email:user.email??null,full_name:fullName.trim()||null,role,account_role:role,
          account_type:role,bio:bio.trim()||null,location:location.trim()||null,school:school.trim()||null,
          region:region||null,target_career:career.trim()||null,university:university.trim()||null,
          program:program.trim()||null,graduation_year:graduationYear?Number(graduationYear):null,
          company:company.trim()||null,job_title:jobTitle.trim()||null,linkedin_url:linkedinUrl.trim()||null,
          avatar_url:nextAvatarUrl,interests,skills:skillList,is_discoverable:discoverable,
          onboarding_complete:true,onboarded:true,
        },{onConflict:"id"});
        if(error) throw new Error(`Profile update failed: ${error.message}`);
      }

      if(role==="employee"){
        const {error}=await supabase.from("employee_profiles").upsert({
          user_id:user.id,
          professional_title:jobTitle.trim()||null,
          employer_name:company.trim()||null,
          bio:bio.trim()||null,
          skills:skillList,
          education_level:program.trim()||null,
          university:university.trim()||null,
          graduation_year:graduationYear?Number(graduationYear):null,
          location:location.trim()||null,
          linkedin_url:linkedinUrl.trim()||null,
          discoverable,
          interests,
          preferred_locations:location.trim() ? [location.trim()] : [],
          preferred_industries:interests,
        },{onConflict:"user_id"});
        if(error) throw new Error(`Employee profile could not be saved: ${error.message}`);

        // Publish a minimal directory projection only when the employee explicitly opts in.
        if (discoverable) {
          const { error: directoryError } = await supabase.from("talent_directory").upsert({
            user_id: user.id,
            full_name: fullName.trim(),
            professional_title: jobTitle.trim(),
            linkedin_url: linkedinUrl.trim() || null,
            city: location.trim() || null,
            preferred_locations: location.trim() ? [location.trim()] : [],
            preferred_industries: interests,
            skills: skillList,
            bio: bio.trim() || null,
            discoverable: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
          if (directoryError) throw new Error(`Public talent profile could not be updated: ${directoryError.message}`);
        } else {
          const { error: directoryError } = await supabase.from("talent_directory").delete().eq("user_id", user.id);
          if (directoryError) throw new Error(`Public talent profile could not be removed: ${directoryError.message}`);
        }
      } else {
        // A role change removes the employee-only public directory projection.
        const { error: directoryError } = await supabase.from("talent_directory").delete().eq("user_id", user.id);
        if (directoryError) throw new Error(`Public talent profile could not be removed: ${directoryError.message}`);
      }
      if(role==="employer"){
        const {error}=await supabase.from("employer_profiles").upsert({
          user_id:user.id,organization_name:company.trim()||fullName.trim()||null,
          organization_type:jobTitle.trim()||null,hiring_focus:skillList.length ? skillList : (career.trim() ? [career.trim()] : []),
        },{onConflict:"user_id"});
        if(error) throw new Error(`Employer profile could not be saved: ${error.message}`);
      }
      if(role==="startup_founder"){
        if (!company.trim() || !startupSector.trim()) throw new Error("Add your startup name and sector to continue.");
        const {error}=await supabase.from("founder_profiles").upsert({
          user_id:user.id,
          startup_name:company.trim(),
          sector:startupSector.trim(),
          stage:startupStage || "Idea",
          website_url:startupWebsite.trim() || null,
          pitch_url:startupPitch.trim() || null,
          description:startupDescription.trim() || null,
          problem_statement:startupProblem.trim() || null,
          solution_summary:startupSolution.trim() || null,
          target_market:startupTargetMarket.trim() || null,
          business_model:startupBusinessModel.trim() || null,
          team_size:startupTeamSize ? Number(startupTeamSize) : null,
          founded_year:startupFoundedYear ? Number(startupFoundedYear) : null,
          funding_stage:startupFundingStage || null,
          funding_needed:startupFundingNeeded ? Number(startupFundingNeeded) : null,
          funding_currency:startupFundingNeeded ? startupFundingCurrency : null,
          skills:skillList,
          interests,
        },{onConflict:"user_id"});
        if(error) throw new Error(`Startup profile could not be saved: ${error.message}`);
      }
      if(role==="international_student"){
        const {error}=await supabase.from("international_students").upsert({
          user_id:user.id,country_code:countryCode.trim().toUpperCase()||null,university_name:university.trim()||null,programme_name:program.trim()||null,
          graduation_year:graduationYear?Number(graduationYear):null,skills:skillList,interests,
          visible:discoverable,
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
          {role === "employee" && <>
            <input className={inputClass} placeholder="Professional title (e.g. software engineer)" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
            <input className={inputClass} placeholder="Current employer (optional)" value={company} onChange={e => setCompany(e.target.value)} />
            <input className={inputClass} placeholder="University or training provider (optional)" value={university} onChange={e => setUniversity(e.target.value)} />
            <input className={inputClass} placeholder="Qualification or education level" value={program} onChange={e => setProgram(e.target.value)} />
            <input className={inputClass} placeholder="Graduation year (optional)" inputMode="numeric" value={graduationYear} onChange={e => setGraduationYear(e.target.value.replace(/\\D/g,"").slice(0,4))} />
          </>}
          {role === "employer" && <>
            <input className={inputClass} placeholder="Organisation name" value={company} onChange={e => setCompany(e.target.value)} />
            <input className={inputClass} placeholder="Organisation type (e.g. startup, NGO, company)" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
          </>}
          {role === "international_student" && <>
            <input className={inputClass} placeholder="Home country code (e.g. GH, NG, SL)" value={countryCode} maxLength={2} onChange={e => setCountryCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} />
            <input className={inputClass} placeholder="Current university (optional)" value={university} onChange={e => setUniversity(e.target.value)} />
            <input className={inputClass} placeholder="Qualification or programme you are applying with" value={program} onChange={e => setProgram(e.target.value)} />
            <input className={inputClass} placeholder="Expected graduation year (optional)" inputMode="numeric" value={graduationYear} onChange={e => setGraduationYear(e.target.value.replace(/\\D/g,"").slice(0,4))} />
          </>}
          {role === "startup_founder" && <>
            <div className="sm:col-span-2 border-t border-border pt-4">
              <p className="text-sm font-semibold">Your startup profile</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">These details belong to your startup profile and are used to shape founder resources and recommendations.</p>
            </div>
            <input className={inputClass} placeholder="Startup name" value={company} maxLength={140} onChange={e => setCompany(e.target.value)} />
            <input className={inputClass} placeholder="Startup sector (e.g. education, AI, agriculture)" value={startupSector} maxLength={120} onChange={e => setStartupSector(e.target.value)} />
            <label className="block text-xs font-medium text-muted-foreground">Startup stage
              <select className={inputClass + " mt-1"} value={startupStage} onChange={e => setStartupStage(e.target.value)}>
                {["Idea","Building MVP","Testing with users","Early traction","Revenue-generating","Scaling"].map(stage => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-muted-foreground">Funding stage (optional)
              <select className={inputClass + " mt-1"} value={startupFundingStage} onChange={e => setStartupFundingStage(e.target.value)}>
                <option value="">Not currently fundraising / not set</option>
                {["Bootstrapped","Grant-funded","Pre-seed","Seed","Series A or later"].map(stage => <option key={stage} value={stage}>{stage}</option>)}
              </select>
            </label>
            <label className="block text-xs font-medium text-muted-foreground">Team size (optional)
              <input className={inputClass + " mt-1"} type="number" min="1" max="100000" value={startupTeamSize} onChange={e => setStartupTeamSize(e.target.value.replace(/\\D/g,"").slice(0,6))} placeholder="e.g. 2" />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">Year founded (optional)
              <input className={inputClass + " mt-1"} type="number" min="1900" max={new Date().getFullYear()} value={startupFoundedYear} onChange={e => setStartupFoundedYear(e.target.value.replace(/\\D/g,"").slice(0,4))} placeholder="e.g. 2026" />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">Funding sought (optional)
              <input className={inputClass + " mt-1"} type="number" min="0" step="0.01" value={startupFundingNeeded} onChange={e => setStartupFundingNeeded(e.target.value)} placeholder="Amount" />
            </label>
            <label className="block text-xs font-medium text-muted-foreground">Funding currency
              <select className={inputClass + " mt-1"} value={startupFundingCurrency} onChange={e => setStartupFundingCurrency(e.target.value)}>
                {["GHS","USD","EUR","GBP"].map(currency => <option key={currency} value={currency}>{currency}</option>)}
              </select>
            </label>
            <input className={inputClass} placeholder="Startup website (optional)" type="url" value={startupWebsite} onChange={e => setStartupWebsite(e.target.value)} />
            <input className={inputClass} placeholder="Pitch deck link (optional)" type="url" value={startupPitch} onChange={e => setStartupPitch(e.target.value)} />
            <label className="block text-xs font-medium text-muted-foreground sm:col-span-2">What does your startup do?
              <textarea className={inputClass + " mt-1 min-h-20"} maxLength={2500} value={startupDescription} onChange={e => setStartupDescription(e.target.value)} placeholder="Describe your product or service in plain language." />
            </label>
            <label className="block text-xs font-medium text-muted-foreground sm:col-span-2">What problem are you solving?
              <textarea className={inputClass + " mt-1 min-h-20"} maxLength={2500} value={startupProblem} onChange={e => setStartupProblem(e.target.value)} placeholder="Describe the problem and who experiences it." />
            </label>
            <label className="block text-xs font-medium text-muted-foreground sm:col-span-2">Your solution
              <textarea className={inputClass + " mt-1 min-h-20"} maxLength={2500} value={startupSolution} onChange={e => setStartupSolution(e.target.value)} placeholder="Explain how your startup addresses the problem." />
            </label>
            <label className="block text-xs font-medium text-muted-foreground sm:col-span-2">Target customers or market
              <input className={inputClass + " mt-1"} maxLength={500} value={startupTargetMarket} onChange={e => setStartupTargetMarket(e.target.value)} placeholder="Who will use or pay for this product?" />
            </label>
            <label className="block text-xs font-medium text-muted-foreground sm:col-span-2">Business model (optional)
              <input className={inputClass + " mt-1"} maxLength={500} value={startupBusinessModel} onChange={e => setStartupBusinessModel(e.target.value)} placeholder="e.g. subscription, marketplace, service fees" />
            </label>
          </>}
          <input className={inputClass} placeholder="LinkedIn URL (optional)" value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} />
          <input className={inputClass} placeholder="Skills, separated by commas" value={skills} onChange={e => setSkills(e.target.value)} />
          {(role === "employee" || role === "international_student") && <label className="flex items-center gap-3 text-sm text-muted-foreground"><input type="checkbox" checked={discoverable} onChange={e => setDiscoverable(e.target.checked)} /> {role === "international_student" ? "Show my profile in the international student directory" : "Make my professional profile discoverable to opted-in employers"}</label>}
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
