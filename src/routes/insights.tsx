import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type Analytics = {
  total_users:number; active_users:number; website_visits:number; recommendation_runs:number;
  countries:number; university_count:number; programme_count:number; scholarship_count:number;
  opportunity_count:number; internship_count:number; international_student_count:number; international_university_count:number;
  countries_list:string[];
};

export const Route=createFileRoute("/insights")({component:Insights});
function Insights(){
 const q=useQuery({queryKey:["platform-analytics"],queryFn:async()=>{const {data,error}=await supabase.rpc("platform_analytics");if(error)throw error;return data as unknown as Analytics;},staleTime:300000});
 const cards=q.data?[["Total users",q.data.total_users],["Active users",q.data.active_users],["Visits",q.data.website_visits],["Recommendation runs",q.data.recommendation_runs],["Universities",q.data.university_count],["Programmes",q.data.programme_count],["Scholarships",q.data.scholarship_count],["Countries",q.data.countries],["Jobs and opportunities",q.data.opportunity_count],["Internships",q.data.internship_count],["International students",q.data.international_student_count],["International universities",q.data.international_university_count]]:[];
 return <div className="min-h-dvh bg-background"><Navbar/><main className="pt-20 pb-14 px-4 sm:px-8"><div className="max-w-7xl mx-auto"><p className="text-xs uppercase tracking-[.18em] text-primary font-semibold">Insights</p><h1 className="text-3xl sm:text-4xl font-bold mt-2">GhanaPathFinder live intelligence</h1><p className="text-sm text-muted-foreground mt-2 max-w-2xl">Live aggregates from GhanaPathFinder's database and existing platform counters. No numbers are seeded or invented.</p><div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">{q.isLoading?Array.from({length:12}).map((_,i)=><div key={i} className="h-24 rounded-xl bg-secondary animate-pulse"/>):cards.map(([label,value])=><div key={String(label)} className="border border-border bg-card rounded-xl p-4"><p className="text-xs text-muted-foreground">{String(label)}</p><p className="text-2xl font-semibold mt-1">{Number(value).toLocaleString("en-GB")}</p></div>)}</div><section className="mt-8 rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">Countries represented in the catalogue</h2><div className="mt-4 flex flex-wrap gap-2">{(q.data?.countries_list??[]).map(c=><span key={c} className="px-3 py-1.5 rounded-full bg-secondary text-sm">{c}</span>)}</div>{!q.isLoading&&!q.data?.countries_list?.length&&<p className="mt-3 text-sm text-muted-foreground">No country records are currently available.</p>}</section></div></main><Footer/></div>;
}