import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard/founder")({ component: FounderDashboard });

const accelerators = [
  {name:"Y Combinator",url:"https://www.ycombinator.com/apply",text:"Global startup accelerator and funding programme."},
  {name:"Antler",url:"https://www.antler.co/apply",text:"Founder programme with Africa presence."},
  {name:"Founders Factory Africa",url:"https://foundersfactory.africa/",text:"Africa-focused venture builder and startup support."},
  {name:"MEST Africa",url:"https://meltwater.org/mest-africa/",text:"Ghana-rooted entrepreneurship and technology ecosystem."},
  {name:"Tony Elumelu Foundation",url:"https://www.tonyelumelufoundation.org/",text:"Pan-African entrepreneurship programme and founder support."},
];

function FounderDashboard() {
  const {user}=useAuth();
  const funding=useQuery({queryKey:["founder-funding"],enabled:!!user,queryFn:async()=>{
    const {data,error}=await supabase.from("opportunities").select("id,title,company_name,country_code,location,opportunity_type,description,application_url,deadline,source_name,source_url").eq("is_active",true).in("opportunity_type",["grant","fellowship","scholarship"]).order("deadline",{ascending:true,nullsFirst:false}).limit(20);
    if(error) throw error; return data??[];
  }});
  const investors=useQuery({queryKey:["founder-investors"],enabled:!!user,queryFn:async()=>{
    const {data,error}=await supabase.from("investors").select("id,name,type,country_code,description,website_url,sectors,stages").eq("verified",true).order("name").limit(30);
    if(error) throw error; return data??[];
  }});

  return <div className="min-h-dvh bg-background"><Navbar/><main className="px-4 pb-14 pt-20 sm:px-8"><div className="mx-auto max-w-7xl">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Founder workspace</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Build the company</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Funding, accelerators, investors and verified opportunities across Africa and beyond.</p>
    <div className="mt-8 grid gap-4 sm:grid-cols-3"><a href="/community" className="rounded-xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">Community</p><p className="mt-1 font-semibold">Founder conversations</p></a><a href="/ai" className="rounded-xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">AI strategy</p><p className="mt-1 font-semibold">Open AI advisor</p></a><a href="/opportunities" className="rounded-xl border border-border bg-card p-5"><p className="text-xs text-muted-foreground">Opportunities</p><p className="mt-1 font-semibold">Browse all</p></a></div>
    <section className="mt-6"><h2 className="font-semibold">Accelerators and founder programmes</h2><div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{accelerators.map(a=><a key={a.name} href={a.url} target="_blank" rel="noreferrer" className="rounded-xl border border-border bg-card p-5 hover:bg-secondary"><h3 className="font-semibold">{a.name}</h3><p className="mt-2 text-sm text-muted-foreground">{a.text}</p><span className="mt-3 inline-block text-xs text-primary">Official programme</span></a>)}</div></section>
    <div className="mt-8 grid gap-5 lg:grid-cols-2"><section className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Funding opportunities</h2><div className="mt-4 space-y-3">{funding.isLoading?Array.from({length:5}).map((_,i)=><div key={i} className="h-24 animate-pulse rounded-lg bg-secondary"/>):(funding.data??[]).map(x=><article key={x.id} className="rounded-lg border border-border p-4"><p className="text-xs text-primary">{x.opportunity_type}</p><h3 className="mt-1 font-medium">{x.title}</h3><p className="mt-1 text-sm text-muted-foreground">{x.description||"Verified opportunity"} </p>{x.application_url&&<a href={x.application_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-primary">Apply</a>}</article>)}{!funding.isLoading&&!funding.data?.length&&<p className="text-sm text-muted-foreground">No verified funding records are currently available.</p>}</div></section>
    <section className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Verified investor directory</h2><div className="mt-4 space-y-3">{investors.isLoading?Array.from({length:5}).map((_,i)=><div key={i} className="h-20 animate-pulse rounded-lg bg-secondary"/>):(investors.data??[]).map(x=><article key={x.id} className="rounded-lg border border-border p-4"><h3 className="font-medium">{x.name}</h3><p className="text-xs text-muted-foreground">{x.type||"Investor"}{x.country_code?" · "+x.country_code:""}</p>{x.description&&<p className="mt-2 text-sm text-muted-foreground line-clamp-2">{x.description}</p>}{x.website_url&&<a href={x.website_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-primary">Website</a>}</article>)}{!investors.isLoading&&!investors.data?.length&&<p className="text-sm text-muted-foreground">No verified investors are currently available.</p>}</div></section></div>
  </div></main><Footer/></div>;
}
