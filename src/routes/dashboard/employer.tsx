import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Candidate = { id:string; full_name:string|null; avatar_url:string|null; university:string|null; program:string|null; graduation_year:number|null; skills:string[]|null; location:string|null; linkedin_url:string|null };

export const Route = createFileRoute("/dashboard/employer")({ component: EmployerDashboard });

function EmployerDashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [query,setQuery] = useState("");
  const [showPost,setShowPost] = useState(false);
  const [title,setTitle] = useState("");
  const [description,setDescription] = useState("");
  const [skills,setSkills] = useState("");
  const [location,setLocation] = useState("");
  const [remote,setRemote] = useState(false);
  const [applyUrl,setApplyUrl] = useState("");
  const [posting,setPosting] = useState(false);

  const postings = useQuery({
    queryKey:["employer-postings",user?.id],
    enabled:!!user,
    queryFn:async()=>{
      const {data,error}=await supabase.from("opportunities").select("id,title,company_name,location,remote,opportunity_type,application_url,created_at").eq("posted_by",user!.id).order("created_at",{ascending:false});
      if(error) throw error;
      return data ?? [];
    },
  });

  const candidates = useQuery({
    queryKey:["candidate-search",query],
    queryFn:async()=>{
      let request=supabase.from("profiles").select("id,full_name,avatar_url,university,program,graduation_year,skills,location,linkedin_url").eq("role","employee").eq("is_discoverable",true).limit(50);
      if(query.trim()) request=request.or("full_name.ilike.%" + query.trim() + "%,university.ilike.%" + query.trim() + "%,program.ilike.%" + query.trim() + "%,location.ilike.%" + query.trim() + "%");
      const {data,error}=await request;
      if(error) throw error;
      return (data ?? []) as Candidate[];
    },
    enabled:!!user,
  });

  const postJob=async()=>{
    if(!user || !title.trim()) { toast.error("Add a job or internship title."); return; }
    setPosting(true);
    const skillList=skills.split(",").map(x=>x.trim()).filter(Boolean);
    const {error}=await supabase.from("opportunities").insert({
      title:title.trim(), opportunity_type:"job", company_name:null, location:location.trim()||null,
      remote, description:description.trim()||null, skills:skillList, skills_required:skillList,
      application_url:applyUrl.trim()||null, source:"manual", source_name:"GhanaPathFinder",
      posted_by:user.id, is_active:true, status:"active"
    });
    setPosting(false);
    if(error){toast.error(error.message);return;}
    toast.success("Opportunity published");
    setShowPost(false); setTitle(""); setDescription(""); setSkills(""); setLocation(""); setApplyUrl("");
    await qc.invalidateQueries({queryKey:["employer-postings",user.id]});
  };

  const recommend=async(candidate:Candidate)=>{
    if(!user) return;
    const {error}=await supabase.from("notifications").insert({
      user_id:candidate.id,type:"match",title:"An employer recommended you",
      body:"An employer found your opted-in GhanaPathFinder profile relevant to an opportunity.",
      message:"An employer found your opted-in GhanaPathFinder profile relevant to an opportunity.",
      action_url:"/dashboard/employee",link:"/dashboard/employee"
    });
    if(error) toast.error(error.message); else toast.success("Recommendation sent");
  };

  return <div className="min-h-dvh bg-background"><Navbar/><main className="px-4 pb-14 pt-20 sm:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Employer workspace</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Hire opted-in African talent</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Search GhanaPathFinder's own candidate pool. LinkedIn is not scraped or used as a talent database.</p></div><button onClick={()=>setShowPost(true)} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Post a job</button></div>
    {showPost && <section className="mt-6 rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Post a real opportunity</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input className="rounded-lg border border-border bg-background px-3 py-2.5" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)}/><input className="rounded-lg border border-border bg-background px-3 py-2.5" placeholder="Location" value={location} onChange={e=>setLocation(e.target.value)}/><textarea className="rounded-lg border border-border bg-background px-3 py-2.5 sm:col-span-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)}/><input className="rounded-lg border border-border bg-background px-3 py-2.5" placeholder="Skills, comma separated" value={skills} onChange={e=>setSkills(e.target.value)}/><input className="rounded-lg border border-border bg-background px-3 py-2.5" placeholder="Application URL" value={applyUrl} onChange={e=>setApplyUrl(e.target.value)}/></div><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={remote} onChange={e=>setRemote(e.target.checked)}/> Remote</label><div className="mt-4 flex gap-2"><button onClick={postJob} disabled={posting} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">{posting?"Publishing...":"Publish"}</button><button onClick={()=>setShowPost(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button></div></section>}
    <div className="mt-8 grid gap-5 lg:grid-cols-5"><section className="lg:col-span-3 rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Recommended candidates</h2><span className="text-xs text-muted-foreground">{candidates.data?.length ?? 0} visible</span></div><input aria-label="Search candidates" className="mt-4 h-11 w-full rounded-lg border border-border bg-background px-3" placeholder="Search name, university, programme or location" value={query} onChange={e=>setQuery(e.target.value)}/><div className="mt-4 space-y-3">{candidates.isLoading?Array.from({length:5}).map((_,i)=><div key={i} className="h-24 animate-pulse rounded-lg bg-secondary"/>):(candidates.data??[]).map(candidate=><article key={candidate.id} className="rounded-lg border border-border p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-medium">{candidate.full_name||"GhanaPathFinder member"}</h3><p className="text-sm text-muted-foreground">{[candidate.university,candidate.program,candidate.graduation_year].filter(Boolean).join(" · ")}</p><p className="mt-1 text-xs text-muted-foreground">{candidate.location||""}{candidate.skills?.length?" · "+candidate.skills.slice(0,5).join(", "):""}</p></div><button onClick={()=>recommend(candidate)} className="rounded-lg border border-border px-3 py-2 text-xs font-medium hover:bg-secondary">Recommend</button></div>{candidate.linkedin_url&&<a href={candidate.linkedin_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-primary">LinkedIn</a>}</article>)}{!candidates.isLoading&&!candidates.data?.length&&<div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No opted-in candidates match this search.</div>}</div></section>
    <aside className="space-y-5"><section className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">My postings</h2><div className="mt-3 space-y-2">{postings.data?.map(p=><div key={p.id} className="rounded-lg border border-border p-3"><p className="text-sm font-medium">{p.title}</p><p className="text-xs text-muted-foreground">{p.location||"Remote"} · {p.opportunity_type}</p></div>)}{!postings.isLoading&&!postings.data?.length&&<p className="text-sm text-muted-foreground">You have not posted an opportunity yet.</p>}</div></section><section className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">AI hiring assistant</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Use the AI advisor to clarify role requirements, then use the opted-in candidate pool for actual people and verified profile facts.</p><a href="/ai" className="mt-3 inline-block text-sm text-primary">Open AI advisor</a></section></aside></div>
  </div></main><Footer/></div>;
}
