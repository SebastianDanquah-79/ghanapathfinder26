import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "@/lib/router-compat";

export const Route = createFileRoute("/career-report/$slug")({ component: PublicCareerReport });

function PublicCareerReport(){
 const {slug}=Route.useParams();
 const {data:report,isLoading}=useQuery({queryKey:["public-report",slug],queryFn:async()=>{const {data,error}=await supabase.from("shareable_reports").select("title,payload,created_at,expires_at").eq("slug",slug).eq("is_public",true).maybeSingle();if(error)throw error;return data;}});
 if(isLoading)return <div className="min-h-screen bg-background pt-20"><Navbar/><main className="mx-auto max-w-2xl px-4 py-12 text-muted-foreground">Loading report...</main></div>;
 if(!report)return <div className="min-h-screen bg-background pt-20"><Navbar/><main className="mx-auto max-w-2xl px-4 py-12"><h1 className="text-2xl font-bold">Report not found</h1><p className="mt-2 text-muted-foreground">This report may have been removed or expired.</p></main></div>;
 const p=(report.payload as any)?.profile||{}; const goals=(report.payload as any)?.goals||[];
 return <div className="min-h-screen bg-background pt-20 pb-24"><Navbar/><main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"><section className="rounded-2xl border border-border bg-card p-6 sm:p-8"><p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">GhanaPathFinder Career Report</p><h1 className="mt-2 text-3xl font-bold">{p.full_name||"Career profile"}</h1><p className="mt-2 text-lg text-muted-foreground">{p.target_career||"Exploring career options"}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-border/70 p-4"><p className="text-xs text-muted-foreground">Education</p><p className="mt-1 text-sm font-medium">{p.program||p.education_level||"Not specified"}</p><p className="text-xs text-muted-foreground mt-1">{p.university||p.country_code||""}</p></div><div className="rounded-xl border border-border/70 p-4"><p className="text-xs text-muted-foreground">Interests</p><p className="mt-1 text-sm">{(p.interests||[]).join(" · ")||"Not specified"}</p></div></div><h2 className="mt-7 text-lg font-semibold">Path goals</h2><div className="mt-3 space-y-2">{goals.map((g:any)=><div key={g.title} className="rounded-xl border border-border/70 p-3"><div className="flex justify-between gap-3"><span className="text-sm font-medium">{g.title}</span><span className="text-xs text-primary">{g.progress}%</span></div></div>)}</div><Link to="/for-you" className="mt-7 inline-flex rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">Build your own path</Link></section></main></div>
}
export default PublicCareerReport;