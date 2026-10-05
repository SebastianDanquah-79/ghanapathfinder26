import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
// Some tables used here are not yet in the generated database types.
const db = supabase as unknown as SupabaseClient;
import Navbar from "@/components/Navbar";
import { Briefcase, Building2, ExternalLink, Plus, Search, Users } from "@/lib/icons";
import { toast } from "sonner";

type Job = {
  id:string; title:string; opportunity_type:string; employment_type:string|null;
  location:string|null; remote:boolean; description:string|null; requirements:string|null;
  skills:string[]; application_url:string|null; apply_url:string|null; compensation:string|null;
  organisation:string|null; company_name:string|null; employer_id:string|null; source_name:string|null; source:string|null; source_url:string|null; last_verified_at:string|null; posted_at:string|null; created_at:string|null; city:string|null;
};
type Applicant = {
  id:string; user_id:string; opportunity_id:string; status:string; applied_at:string|null;
  jobTitle?:string; name?:string; email?:string; skills?:string[]; stage?:string;
};
const input="w-full rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30";
const card="rounded-xl border border-border bg-card p-5";

export default function CareerMarketplace(){
  const {user,loading}=useAuth(); const navigate=useNavigate();
  const [jobs,setJobs]=useState<Job[]>([]); const [q,setQ]=useState(""); const [mode,setMode]=useState<"candidate"|"employer">("candidate"); const [typeFilter,setTypeFilter]=useState("all"); const [workFilter,setWorkFilter]=useState("all"); const [locationFilter,setLocationFilter]=useState("all"); const [sourceFilter,setSourceFilter]=useState("all"); const [sortBy,setSortBy]=useState("newest");
  const [employerId,setEmployerId]=useState<string|null>(null); const [apps,setApps]=useState<Applicant[]>([]); const [busy,setBusy]=useState(false);
  const [company,setCompany]=useState({name:"",industry:"",city:"",website_url:"",description:""});
  const [job,setJob]=useState({title:"",type:"job",employment_type:"full-time",location:"",description:"",requirements:"",skills:"",compensation:"",remote:false});

  const load=async()=>{
    const {data}=await db.from("opportunities").select("id,title,opportunity_type,employment_type,location,remote,description,requirements,skills,application_url,apply_url,compensation,organisation,company_name,employer_id,source_name,source,source_url,last_verified_at,posted_at,created_at,city").eq("status","active").order("posted_at",{ascending:false}).limit(100);
    const list=(data??[]) as Job[]; setJobs(list); if(!user)return;
    const {data:members}=await db.from("employer_users").select("employer_id").eq("user_id",user.id);
    const eid=members?.[0]?.employer_id??null; setEmployerId(eid); if(!eid)return;
    setMode("employer"); const ids=list.filter(j=>j.employer_id===eid).map(j=>j.id); if(!ids.length){setApps([]);return;}
    const {data:raw}=await db.from("opportunity_applications").select("id,user_id,opportunity_id,status,applied_at").in("opportunity_id",ids).order("applied_at",{ascending:false});
    const rows=raw??[]; if(!rows.length){setApps([]);return;}
    const uids=[...new Set(rows.map(x=>x.user_id))];
    const [{data:profiles},{data:reviews}]=await Promise.all([
      db.from("profiles").select("id,full_name,email,skills").in("id",uids),
      db.from("employer_application_reviews").select("application_id,stage").eq("employer_id",eid)
    ]);
    const pm=new Map((profiles??[]).map(p=>[p.id,p])); const rm=new Map((reviews??[]).map(r=>[r.application_id,r.stage]));
    setApps(rows.map(a=>({...a,jobTitle:list.find(j=>j.id===a.opportunity_id)?.title??"",name:pm.get(a.user_id)?.full_name??"Candidate",email:pm.get(a.user_id)?.email??"",skills:pm.get(a.user_id)?.skills??[],stage:rm.get(a.id)??"new"})));
  };
  useEffect(()=>{if(!loading&&!user)navigate(`/auth?next=${encodeURIComponent("/career-marketplace")}`,{replace:true});},[loading,user,navigate]);
  useEffect(()=>{if(user)void load();},[user]);

  const sources=useMemo(()=>[...new Set(jobs.map(j=>j.source_name||j.source||"Employer"))].sort(),[jobs]); const locations=useMemo(()=>[...new Set(jobs.map(j=>j.city||j.location).filter(Boolean) as string[])].sort(),[jobs]); const filtered=useMemo(()=>{const x=q.trim().toLowerCase();const list=jobs.filter(j=>{const hay=[j.title,j.organisation,j.company_name,j.location,j.description,...(j.skills??[])].filter(Boolean).join(" ").toLowerCase();const typeOk=typeFilter==="all"||j.opportunity_type===typeFilter;const workOk=workFilter==="all"||(workFilter==="remote"&&j.remote)||(workFilter==="hybrid"&&!j.remote&&((j.employment_type??"").toLowerCase().includes("hybrid")||(j.location??"").toLowerCase().includes("hybrid")));const locOk=locationFilter==="all"||(j.city||j.location)===locationFilter;const sourceOk=sourceFilter==="all"||(j.source_name||j.source||"Employer")===sourceFilter;return (!x||hay.includes(x))&&typeOk&&workOk&&locOk&&sourceOk;});return [...list].sort((a,b)=>{if(sortBy==="company")return (a.company_name||a.organisation||"").localeCompare(b.company_name||b.organisation||"");return new Date(b.posted_at||b.created_at||0).getTime()-new Date(a.posted_at||a.created_at||0).getTime();});},[jobs,q,typeFilter,workFilter,locationFilter,sourceFilter,sortBy]);

  const setup=async()=>{
    if(!user||!company.name.trim())return;setBusy(true);
    const {data:e,error}=await db.from("employers").insert({...company,name:company.name.trim(),organization_type:"company",verification_status:"pending",created_by:user.id}).select("id").single();
    if(error||!e){toast.error(error?.message??"Could not create employer");setBusy(false);return;}
    const {error:me}=await db.from("employer_users").insert({employer_id:e.id,user_id:user.id,role:"owner"});
    if(me){toast.error(me.message);setBusy(false);return;}
    await db.from("employer_profiles").upsert({user_id:user.id,organization_name:company.name,organization_type:"company",hiring_focus:company.industry?[company.industry]:[]});
    await db.from("profiles").update({account_role:"employer",account_type:"employer"}).eq("id",user.id);
    toast.success("Employer workspace created");setEmployerId(e.id);setCompany(company);setMode("employer");setBusy(false);await load();
  };

  const post=async()=>{
    if(!user||!employerId||!job.title.trim())return;setBusy(true);
    const skills=job.skills.split(",").map(s=>s.trim()).filter(Boolean);
    const {error}=await db.from("opportunities").insert({
      title:job.title.trim(),opportunity_type:job.type,employment_type:job.employment_type,location:job.location||null,
      city:job.location||null,country:"GH",remote:job.remote,is_remote:job.remote,description:job.description||null,
      requirements:job.requirements||null,skills,skills_required:skills,compensation:job.compensation||null,
      organisation:company.name||null,company_name:company.name||null,employer_id:employerId,posted_by:user.id,
      status:"active",published:true,is_active:true,verified:false,posted_at:new Date().toISOString()
    });
    if(error)toast.error(error.message);else{toast.success("Opportunity published");setJob({title:"",type:"job",employment_type:"full-time",location:"",description:"",requirements:"",skills:"",compensation:"",remote:false});await load();}setBusy(false);
  };

  const apply=async(id:string)=>{
    if(!user)return;const {error}=await db.from("opportunity_applications").insert({user_id:user.id,opportunity_id:id,status:"applied",applied_at:new Date().toISOString()});
    if(error)toast.error(error.code==="23505"?"You already applied to this opportunity.":error.message);else toast.success("Application saved");
  };
  const stage=async(a:Applicant,value:string)=>{
    if(!user||!employerId)return;const {error}=await db.from("employer_application_reviews").upsert({application_id:a.id,employer_id:employerId,candidate_user_id:a.user_id,stage:value,updated_by:user.id},{onConflict:"application_id"});
    if(error)toast.error(error.message);else{toast.success("Applicant updated");await load();}
  };

  if(loading||!user)return <div className="min-h-screen bg-background"><Navbar/><main className="mx-auto max-w-7xl px-4 pt-28 text-sm text-muted-foreground">Loading career marketplace…</main></div>;

  return <div className="min-h-screen bg-background pb-16 pt-20"><Navbar/><main className="mx-auto max-w-7xl px-4 sm:px-8">
    <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div>
      <p className="text-sm font-medium text-primary">GhanaPathFinder Career Marketplace</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-foreground">From education to opportunity</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Connect students, job seekers, professionals and employers around skills, opportunities and applications.</p>
    </div><div className="flex gap-2"><button onClick={()=>setMode("candidate")} className={`rounded-lg px-4 py-2 text-sm ${mode==="candidate"?"bg-primary text-primary-foreground":"bg-secondary text-foreground"}`}>Candidate</button><button onClick={()=>setMode("employer")} className={`rounded-lg px-4 py-2 text-sm ${mode==="employer"?"bg-primary text-primary-foreground":"bg-secondary text-foreground"}`}>Employer</button></div></div>

    {mode==="candidate"&&<><div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Active opportunities</p><p className="mt-1 text-2xl font-bold text-foreground">{jobs.length}</p></div><div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Sources</p><p className="mt-1 text-2xl font-bold text-foreground">{sources.length}</p></div><div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Remote</p><p className="mt-1 text-2xl font-bold text-foreground">{jobs.filter(j=>j.remote).length}</p></div><div className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Internships</p><p className="mt-1 text-2xl font-bold text-foreground">{jobs.filter(j=>j.opportunity_type==="internship").length}</p></div></div><div className={`${card} mb-6`}><div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><input className={`${input} pl-9`} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search jobs, internships, skills or companies"/></div><select className={input+" lg:max-w-44"} value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="all">All opportunity types</option><option value="job">Jobs</option><option value="internship">Internships</option><option value="apprenticeship">Apprenticeships</option><option value="graduate_trainee">Graduate trainees</option><option value="freelance">Freelance</option></select><select className={input+" lg:max-w-36"} value={workFilter} onChange={e=>setWorkFilter(e.target.value)}><option value="all">All work modes</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select><select className={input+" lg:max-w-40"} value={locationFilter} onChange={e=>setLocationFilter(e.target.value)}><option value="all">All locations</option>{locations.map(x=><option key={x}>{x}</option>)}</select><select className={input+" lg:max-w-40"} value={sourceFilter} onChange={e=>setSourceFilter(e.target.value)}><option value="all">All sources</option>{sources.map(x=><option key={x}>{x}</option>)}</select><select className={input+" lg:max-w-32"} value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="newest">Newest</option><option value="company">Company</option></select></div><div className="mt-3 flex items-center justify-between gap-3"><p className="text-xs text-muted-foreground">{filtered.length} matching opportunities. Listings show their source so candidates can verify details before applying.</p><Link to="/applications" className="rounded-lg bg-secondary px-4 py-2.5 text-center text-sm">Track applications</Link></div>
      <div className="grid gap-4 lg:grid-cols-2">{filtered.map(j=><article key={j.id} className={card}><div className="flex justify-between gap-4"><div><p className="text-xs uppercase tracking-wide text-primary">{j.opportunity_type}</p><h2 className="mt-1 text-lg font-semibold text-foreground">{j.title}</h2><p className="text-sm text-muted-foreground">{j.company_name||j.organisation||"Employer"}</p><p className="mt-1 text-xs text-muted-foreground">{j.source_name||j.source||"Employer-submitted"}{j.last_verified_at?" · verified "+new Date(j.last_verified_at).toLocaleDateString():""}</p></div><Briefcase className="h-5 w-5 text-muted-foreground"/></div><div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{j.remote?"Remote":j.location||"Location flexible"}</span>{j.employment_type&&<span>{j.employment_type}</span>}{j.compensation&&<span>{j.compensation}</span>}</div>{j.description&&<p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{j.description}</p>}{j.source_url&&<p className="mt-3 text-xs text-muted-foreground">Source: <a className="underline" href={j.source_url} target="_blank" rel="noreferrer">{j.source_name||j.source||"Original listing"}</a></p>}<div className="mt-4 flex flex-wrap gap-2">{(j.skills??[]).slice(0,6).map(s=><span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-xs">{s}</span>)}</div><div className="mt-5 flex gap-2"><button onClick={()=>apply(j.id)} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Apply</button>{(j.application_url||j.apply_url)&&<a href={j.application_url||j.apply_url||"#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-border px-4 py-2 text-sm">External application <ExternalLink className="h-3.5 w-3.5"/></a>}</div></article>)}</div>
      {!filtered.length&&<div className={card}><p className="text-sm text-muted-foreground">No matching opportunities yet.</p></div>}</div></>}

    {mode==="employer"&&!employerId&&<section className={`${card} max-w-2xl`}><div className="mb-5 flex items-center gap-3"><Building2 className="h-6 w-6 text-primary"/><div><h2 className="text-xl font-semibold text-foreground">Create employer workspace</h2><p className="text-sm text-muted-foreground">Your company begins as pending for verification.</p></div></div><div className="grid gap-3 sm:grid-cols-2"><input className={input} placeholder="Company name" value={company.name} onChange={e=>setCompany({...company,name:e.target.value})}/><input className={input} placeholder="Industry" value={company.industry} onChange={e=>setCompany({...company,industry:e.target.value})}/><input className={input} placeholder="City" value={company.city} onChange={e=>setCompany({...company,city:e.target.value})}/><input className={input} placeholder="Website" value={company.website_url} onChange={e=>setCompany({...company,website_url:e.target.value})}/><textarea className={`${input} sm:col-span-2 min-h-24`} placeholder="Company description" value={company.description} onChange={e=>setCompany({...company,description:e.target.value})}/></div><button disabled={busy||!company.name.trim()} onClick={setup} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">Create employer workspace</button></section>}

    {mode==="employer"&&employerId&&<div className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]"><section className={card}><div className="mb-4 flex items-center gap-3"><Plus className="h-5 w-5 text-primary"/><div><h2 className="font-semibold text-foreground">Post an opportunity</h2><p className="text-xs text-muted-foreground">Jobs, internships, apprenticeships and graduate trainee programmes.</p></div></div><div className="grid gap-3 sm:grid-cols-2"><input className={input} placeholder="Title" value={job.title} onChange={e=>setJob({...job,title:e.target.value})}/><select className={input} value={job.type} onChange={e=>setJob({...job,type:e.target.value})}><option value="job">Job</option><option value="internship">Internship</option><option value="apprenticeship">Apprenticeship</option><option value="graduate_trainee">Graduate trainee</option><option value="freelance">Freelance</option></select><select className={input} value={job.employment_type} onChange={e=>setJob({...job,employment_type:e.target.value})}><option>full-time</option><option>part-time</option><option>contract</option><option>temporary</option></select><input className={input} placeholder="Location" value={job.location} onChange={e=>setJob({...job,location:e.target.value})}/><input className={input} placeholder="Skills, comma separated" value={job.skills} onChange={e=>setJob({...job,skills:e.target.value})}/><input className={input} placeholder="Compensation" value={job.compensation} onChange={e=>setJob({...job,compensation:e.target.value})}/><textarea className={`${input} sm:col-span-2 min-h-24`} placeholder="Description" value={job.description} onChange={e=>setJob({...job,description:e.target.value})}/><textarea className={`${input} sm:col-span-2 min-h-20`} placeholder="Requirements" value={job.requirements} onChange={e=>setJob({...job,requirements:e.target.value})}/></div><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={job.remote} onChange={e=>setJob({...job,remote:e.target.checked})}/> Remote opportunity</label><button disabled={busy||!job.title.trim()} onClick={post} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">Publish opportunity</button></section>
      <section className={card}><div className="mb-4 flex items-center gap-3"><Users className="h-5 w-5 text-primary"/><div><h2 className="font-semibold text-foreground">Applicant pipeline</h2><p className="text-xs text-muted-foreground">{apps.length} applications.</p></div></div><div className="space-y-3">{apps.map(a=><div key={a.id} className="rounded-lg border border-border p-3"><div className="flex items-start justify-between gap-3"><div><p className="font-medium text-foreground">{a.name}</p><p className="text-xs text-muted-foreground">{a.jobTitle} · {a.email}</p></div><select className="rounded-md border border-border bg-secondary px-2 py-1 text-xs" value={a.stage} onChange={e=>stage(a,e.target.value)}><option value="new">New</option><option value="reviewing">Reviewing</option><option value="shortlisted">Shortlisted</option><option value="interview">Interview</option><option value="offer">Offer</option><option value="rejected">Rejected</option><option value="hired">Hired</option></select></div>{a.skills?.length?<p className="mt-2 text-xs text-muted-foreground">Skills: {a.skills.slice(0,8).join(", ")}</p>:null}</div>)}{!apps.length&&<p className="text-sm text-muted-foreground">Applications will appear here when candidates apply.</p>}</div></section></div>}
  </main></div>;
}
