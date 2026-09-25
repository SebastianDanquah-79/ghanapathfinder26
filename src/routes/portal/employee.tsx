import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portal/employee")({ component: EmployeePortal });

function EmployeePortal() {
  const profile = useQuery({ queryKey:["employee-profile"], queryFn:async()=>{ const {data,error}=await supabase.from("profiles").select("full_name,skills,preferred_locations,onboarding_complete").single(); if(error) throw error; return data; }});
  const opportunities = useQuery({ queryKey:["employee-opportunities"], queryFn:async()=>{ const {data,error}=await supabase.from("opportunities").select("id,title,organization,location,type").order("created_at",{ascending:false}).limit(12); if(error) throw error; return data??[]; }});
  return <PortalShell eyebrow="Job Seeker" title="Find work that fits the profile you built." description="A focused workspace for jobs, internships, remote opportunities, applications and skills gaps.">
    {!profile.data?.onboarding_complete && <div className="border border-[#CE1126]/25 bg-[#CE1126]/5 p-5"><h2 className="font-semibold">Complete your professional profile</h2><p className="mt-2 text-sm text-[#151428]/65">Matching becomes useful once your skills and target preferences are filled in.</p><Link to="/onboarding" className="mt-4 inline-block font-medium text-[#006B3F]">Complete profile</Link></div>}
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]"><section><h2 className="text-xl font-semibold">Recent opportunities</h2><div className="mt-4 space-y-3">{opportunities.data?.map(item=><Link key={item.id} to="/careers" className="block border-b border-[#151428]/10 py-4 hover:bg-white/50"><p className="font-medium">{item.title}</p><p className="mt-1 text-sm text-[#151428]/55">{item.organization??"Organisation"} · {item.location??"Location not listed"} · {item.type??"Opportunity"}</p></Link>)}</div></section><aside className="border-t-4 border-[#006B3F] bg-white/60 p-6"><h2 className="font-semibold">Your matching signals</h2><p className="mt-3 text-sm text-[#151428]/65">{profile.data?.skills?.length??0} skills · {profile.data?.preferred_locations?.length??0} preferred locations</p><Link to="/skills" className="mt-5 inline-block font-medium text-[#006B3F]">Close your skills gaps</Link></aside></div>
  </PortalShell>;
}
