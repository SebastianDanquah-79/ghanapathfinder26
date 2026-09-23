import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard/employee")({ component: EmployeeDashboard });

function EmployeeDashboard() {
  const { user } = useAuth();
  const profile = useQuery({
    queryKey:["employee-profile",user?.id],
    enabled:!!user,
    queryFn:async()=>{
      const {data,error}=await supabase.from("profiles").select("full_name,skills,interests,preferred_opportunity_types").eq("id",user!.id).maybeSingle();
      if(error) throw error;
      return data;
    },
  });
  const opportunities = useQuery({
    queryKey:["employee-opportunities"],
    enabled:!!user,
    queryFn:async()=>{
      const {data,error}=await supabase.from("opportunities").select("id,title,company_name,country_code,location,remote,opportunity_type,description,skills,skills_required,application_url,source,source_url,source_name,posted_at,created_at").eq("is_active",true).order("created_at",{ascending:false}).limit(80);
      if(error) throw error;
      return data ?? [];
    },
  });
  const skills = profile.data?.skills ?? [];
  const interests = profile.data?.interests ?? [];
  const matched = useMemo(() => {
    const terms = new Set([...skills,...interests].map(x=>x.toLowerCase()));
    return (opportunities.data ?? []).map(item => {
      const itemSkills=[...(item.skills??[]),...(item.skills_required??[])].map(x=>x.toLowerCase());
      const score=itemSkills.filter(x=>terms.has(x)).length;
      return {item,score};
    }).sort((a,b)=>b.score-a.score);
  },[opportunities.data,skills,interests]);

  return <div className="min-h-dvh bg-background"><Navbar/><main className="px-4 pb-14 pt-20 sm:px-8"><div className="mx-auto max-w-7xl">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Career workspace</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Opportunities matched to you</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Your profile, skills and interests shape the ranking. Every listing shown comes from a real GhanaPathFinder posting or an attributed remote source.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-4"><a href="/careers" className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Career paths</p><p className="mt-1 font-semibold">Explore careers</p></a><a href="/skills" className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Skills gap</p><p className="mt-1 font-semibold">Build skills</p></a><a href="/applications" className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Applications</p><p className="mt-1 font-semibold">Track applications</p></a><a href="/profile" className="rounded-xl border border-border bg-card p-4"><p className="text-xs text-muted-foreground">Profile</p><p className="mt-1 font-semibold">Improve matching</p></a></div>
    <section className="mt-6 rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">Recommended for you</h2><span className="text-xs text-muted-foreground">{matched.length} active opportunities</span></div><div className="mt-4 grid gap-3 md:grid-cols-2">{opportunities.isLoading?Array.from({length:6}).map((_,i)=><div key={i} className="h-36 animate-pulse rounded-lg bg-secondary"/>):matched.slice(0,20).map(({item,score})=><article key={item.id} className="rounded-lg border border-border p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-primary">{item.opportunity_type}{item.remote?" · Remote":""}</p><h3 className="mt-1 font-semibold">{item.title}</h3><p className="mt-1 text-sm text-muted-foreground">{item.company_name||"GhanaPathFinder employer"} · {item.location||item.country_code||"Africa"}</p></div>{score>0&&<span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{score} skill match</span>}</div>{item.description&&<p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>}<div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span>{item.source_name||item.source||"GhanaPathFinder"}</span>{item.application_url&&<a href={item.application_url} target="_blank" rel="noreferrer" className="font-medium text-primary">Apply / view</a>}</div></article>)}</div>{!opportunities.isLoading&&!matched.length&&<div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No active opportunities are available yet. Complete your profile and check again.</div>}</section>
    <section className="mt-6 rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">AI career assistant</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Ask the AI advisor to identify skill gaps or explain how to qualify for a role. It does not invent job listings.</p><a href="/ai" className="mt-3 inline-block text-sm text-primary">Open AI advisor</a></section>
  </div></main><Footer/></div>;
}
