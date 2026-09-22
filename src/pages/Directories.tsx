import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import MobileTabBar from "@/components/MobileTabBar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { EMPLOYERS } from "@/data/employers";

const shell="min-h-dvh bg-background text-foreground";
const card="rounded-xl border border-border bg-card p-5";
function Layout({title,children}:{title:string;children:React.ReactNode}){return <div className={shell}><Navbar/><main className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8"><p className="text-sm font-semibold text-primary">DIRECTORY</p><h1 className="mt-1 text-3xl font-bold">{title}</h1>{children}</main><MobileTabBar/><Footer/></div>}

export function StudentDirectory(){
 const [q,setQ]=useState("");
 const {data=[],isLoading,error}=useQuery({queryKey:["student-directory"],queryFn:async()=>{const {data,error}=await supabase.from("universities").select("id,name,short_name,location,region,slug,verified").order("name").limit(100);if(error)throw error;return data??[];}});
 const rows=useMemo(()=>data.filter((x:any)=>String(x.name??"").toLowerCase().includes(q.toLowerCase())||String(x.short_name??"").toLowerCase().includes(q.toLowerCase())),[data,q]);
 return <Layout title="Student Directory"><p className="mt-2 max-w-2xl text-muted-foreground">Browse institutions and continue into each university profile. Data is loaded from the GhanaPathFinder catalogue.</p><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search universities" className="mt-6 w-full max-w-xl rounded-lg border border-border bg-background px-3 py-2.5"/>{isLoading?<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><div className={card+" h-28 animate-pulse"} key={i}/>)}</div>:error?<div className={card+" mt-6"}>The student directory could not load from the backend.</div>:<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.map((u:any)=><Link key={u.id} to={"/university/"+u.slug} className={card+" block hover:border-primary"}><h2 className="font-semibold">{u.short_name||u.name}</h2><p className="mt-1 text-sm text-muted-foreground">{u.location||u.region||"Ghana"}</p><span className="mt-4 inline-block text-sm font-semibold text-primary">Open university →</span></Link>)}</div>}</Layout>
}

export function EmployerDirectory(){
 const [q,setQ]=useState("");
 const {data=[]}=useQuery({queryKey:["employer-directory"],queryFn:async()=>{const {data}=await supabase.from("employers").select("id,name,organization_type,industry,country_code,city,website_url,description,verification_status").order("name").limit(100);return data??[];}});
 const dbRows=data as any[];
 const merged=[...dbRows.map(x=>({...x,source:"GhanaPathFinder employer registry"})),...EMPLOYERS.map(x=>({id:"catalog-"+x.id,name:x.name,organization_type:"Employer",industry:x.sector,country_code:"GH",city:x.locations[0],website_url:x.url,description:x.about,verification_status:"source-linked",source:"Employer career directory"}))];
 const seen=new Set<string>(); const rows=merged.filter(x=>{const k=String(x.name).toLowerCase();if(seen.has(k))return false;seen.add(k);return k.includes(q.toLowerCase())});
 return <Layout title="Employer Directory"><p className="mt-2 max-w-2xl text-muted-foreground">Explore employer profiles and official career pages. External links go to the organisation's own source.</p><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search employers" className="mt-6 w-full max-w-xl rounded-lg border border-border bg-background px-3 py-2.5"/><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.slice(0,100).map((x:any)=><article key={x.id} className={card}><h2 className="font-semibold">{x.name}</h2><p className="mt-1 text-xs text-muted-foreground">{x.industry||"Employer"} · {x.city||"Africa"}</p><p className="mt-2 text-sm text-muted-foreground line-clamp-3">{x.description||"Employer profile and career information."}</p>{x.website_url&&<a href={x.website_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-primary">Official careers / website →</a>}</article>)}</div></Layout>
}

export function StartupDirectory(){
 const {data=[],isLoading}=useQuery({queryKey:["startup-directory"],queryFn:async()=>{const {data,error}=await supabase.from("founder_profiles").select("user_id,startup_name,sector,stage,website_url,pitch_url").order("startup_name");if(error)throw error;return data??[];}});
 return <Layout title="Startup Directory"><p className="mt-2 max-w-2xl text-muted-foreground">A source-linked directory of startups whose founders have created GhanaPathFinder startup profiles.</p>{isLoading?<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><div className={card+" h-28 animate-pulse"} key={i}/>)}</div>:data.length===0?<div className={card+" mt-6"}><h2 className="font-semibold">No public startup profiles yet</h2><p className="mt-2 text-sm text-muted-foreground">Create a startup founder profile to appear here.</p><Link to="/startup" className="mt-4 inline-block text-sm font-semibold text-primary">Open startup workspace →</Link></div>:<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.map((x:any)=><article key={x.user_id} className={card}><h2 className="font-semibold">{x.startup_name||"Startup"}</h2><p className="mt-1 text-xs text-muted-foreground">{x.sector||"Technology"} · {x.stage||"Stage not specified"}</p>{x.website_url&&<a href={x.website_url} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-primary">Startup website →</a>}</article>)}</div>}</Layout>
}
