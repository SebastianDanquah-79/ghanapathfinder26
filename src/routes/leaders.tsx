import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type Leader={id:string;country_name:string|null;country_code:string;country_code_alpha2:string|null;name:string;title:string|null;biography:string|null;official_source_url:string|null;took_office:string|null;left_office:string|null;is_current:boolean|null;photo_url:string|null;key_policies:string[]|null;notable_achievements:string[]|null};

export const Route=createFileRoute("/leaders")({component:Leaders});

function Leaders(){
 const [search,setSearch]=useState(""); const [filter,setFilter]=useState<"all"|"current"|"past"|"longest"|"recent">("current");
 const q=useQuery({queryKey:["africa-leaders"],queryFn:async()=>{const {data,error}=await supabase.from("africa_leaders").select("id,country_name,country_code,country_code_alpha2,name,title,biography,official_source_url,took_office,left_office,is_current,photo_url,key_policies,notable_achievements").order("country_name");if(error)throw error;return (data??[]) as Leader[];},staleTime:300000});
 const rows=useMemo(()=>{
  const now=Date.now(); const base=(q.data??[]).filter(x=>[x.name,x.country_name,x.title].filter(Boolean).join(" ").toLowerCase().includes(search.trim().toLowerCase()));
  if(filter==="current")return base.filter(x=>x.is_current);
  if(filter==="past")return base.filter(x=>!x.is_current);
  if(filter==="longest")return [...base].sort((a,b)=>(a.took_office?new Date(a.took_office).getTime():now)-(b.took_office?new Date(b.took_office).getTime():now));
  if(filter==="recent")return [...base].sort((a,b)=>(b.took_office?new Date(b.took_office).getTime():0)-(a.took_office?new Date(a.took_office).getTime():0));
  return base;
 },[q.data,search,filter]);
 return <div className="min-h-dvh bg-background"><Seo title="Leaders of Africa | GhanaPathFinder" description="Source-linked directory of African leaders and leadership history." path="/leaders"/><Navbar/><main className="px-4 pb-14 pt-20 sm:px-8"><div className="mx-auto max-w-7xl">
  <div className="h-1 rounded-full bg-gradient-to-r from-[#CE1126] via-[#FCD116] to-[#006B3F]"/><p className="mt-7 text-xs font-semibold uppercase tracking-[.18em] text-primary">Africa</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Leaders of Africa</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Source-linked records from GhanaPathFinder's leadership dataset. Dates and office status are shown as recorded in the database.</p>
  <input value={search} onChange={e=>setSearch(e.target.value)} aria-label="Search leaders" placeholder="Search country or leader" className="mt-6 h-11 w-full max-w-xl rounded-lg border border-border bg-background px-3"/>
  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{(["current","all","past","longest","recent"] as const).map(f=><button key={f} onClick={()=>setFilter(f)} className={"shrink-0 rounded-full border px-3 py-2 text-xs font-medium capitalize "+(filter===f?"border-primary bg-primary/10 text-primary":"border-border text-muted-foreground")}>{f==="longest"?"Longest serving":f==="recent"?"Most recent":f}</button>)}</div>
  {q.isLoading?<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-56 animate-pulse rounded-xl bg-secondary"/></div>):
  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{rows.map(x=>{const code=(x.country_code_alpha2||x.country_code||"").toLowerCase().slice(0,2);const start=x.took_office?new Date(x.took_office):null;const years=start?Math.max(0,Math.floor((Date.now()-start.getTime())/31557600000)):null;return <article key={x.id} className="overflow-hidden rounded-xl border border-border bg-card"><div className="flex h-32 items-center justify-center bg-secondary">{code&&<img src={"https://flagcdn.com/w160/"+code+".png"} alt="" loading="lazy" className="max-h-20 w-auto object-contain"/>}</div><div className="p-4"><p className="text-xs text-muted-foreground">{x.country_name||x.country_code}</p><h2 className="mt-1 font-semibold">{x.name}</h2><p className="mt-1 text-sm text-primary">{x.title||x.role}</p>{x.took_office&&<p className="mt-2 text-xs text-muted-foreground">In office since {new Date(x.took_office).getFullYear()}{x.is_current&&years!==null?" · "+years+" years":""}</p>}{x.biography&&<details className="mt-3"><summary className="cursor-pointer text-xs font-medium text-primary">Read profile</summary><p className="mt-2 text-sm leading-6 text-muted-foreground">{x.biography}</p>{x.key_policies?.length&&<p className="mt-2 text-xs text-muted-foreground"><strong>Policies:</strong> {x.key_policies.join(", ")}</p>}{x.notable_achievements?.length&&<p className="mt-2 text-xs text-muted-foreground"><strong>Achievements:</strong> {x.notable_achievements.join(", ")}</p>}</details>}{x.official_source_url&&<a href={x.official_source_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-primary hover:underline">Source</a>}</div></article>})}</div>}
  {!q.isLoading&&!rows.length&&<div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No leadership records match this filter.</div>}
  <aside className="mt-8 rounded-xl border border-border bg-secondary/40 p-5"><h2 className="font-semibold">Today in African history</h2><p className="mt-2 text-sm text-muted-foreground">On September 21, GhanaPathFinder highlights the birth of Kwame Nkrumah in 1909.</p></aside>
 </div></main><Footer/></div>;
}
