import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/dashboard/founder")({ component: Dashboard });

function Dashboard(){
 const {user}=useAuth();
 const q=useQuery({queryKey:["dashboard",user?.id],queryFn:async()=>{
  const {data,error}=await supabase.from("investors").select("id,name,type,country_code,description,website_url,sectors,stages").eq("verified",true).order("name").limit(20);
  if(error)throw error; return data??[];
 },enabled:!!user});
 return <div className="min-h-dvh bg-background"><Navbar/><main className="pt-20 pb-14 px-4 sm:px-8"><div className="max-w-7xl mx-auto"><p className="text-xs uppercase tracking-[.18em] text-primary font-semibold">Workspace</p><h1 className="text-3xl sm:text-4xl font-bold mt-2">Startup Founder Dashboard</h1><p className="mt-2 text-muted-foreground max-w-2xl">Explore funding, investors, accelerators and founder resources.</p><div className="mt-8 grid lg:grid-cols-3 gap-4"><section className="lg:col-span-2 rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Verified investors</h2><div className="mt-4 space-y-3">{q.isLoading?Array.from({length:5}).map((_,i)=><div key={i} className="h-20 rounded-lg bg-secondary animate-pulse"/>):q.data?.map((x:any)=><article key={x.id} className="border border-border rounded-lg p-4"><h3 className="font-medium">{x.title??x.name}</h3><p className="text-sm text-muted-foreground mt-1">{x.company_name??x.type??x.country_code??""}</p>{x.description&&<p className="text-sm text-muted-foreground mt-2 line-clamp-2">{x.description}</p>}{x.apply_url&&<a className="text-sm text-primary mt-2 inline-block" href={x.apply_url} target="_blank" rel="noreferrer">View opportunity</a>}</article>)}</div>{!q.isLoading&&!q.data?.length&&<p className="mt-6 text-sm text-muted-foreground">No verified records are available yet.</p>}</section><aside className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">AI-powered matching</h2><p className="text-sm text-muted-foreground mt-2">Recommendations use your saved profile, skills and interests together with verified GhanaPathFinder records. The system does not invent opportunities or candidate facts.</p><a href="/profile" className="inline-block mt-4 text-sm text-primary">Complete profile</a></aside></div></div></main><Footer/></div>;
}