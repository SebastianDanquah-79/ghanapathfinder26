import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portal/founder")({ component: FounderPortal });

function FounderPortal() {
  const profile = useQuery({ queryKey:["founder-profile"], queryFn:async()=>{ const {data,error}=await supabase.from("founder_profiles").select("startup_name,sector,stage").single(); if(error&&error.code!=="PGRST116") throw error; return data; }});
  const opportunities = useQuery({ queryKey:["founder-opportunities"], queryFn:async()=>{ const {data,error}=await supabase.from("opportunities").select("id,title,type,location").order("created_at",{ascending:false}).limit(12); if(error) throw error; return data??[]; }});
  return <PortalShell eyebrow="Startup Founder" title="Turn a startup idea into a path to capital and people." description="A founder workspace for funding opportunities, accelerators, investors, community and practical company-building information.">
    {!profile.data&&<div className="border border-[#FCD116]/50 bg-[#FCD116]/10 p-5"><h2 className="font-semibold">Complete your founder profile</h2><p className="mt-2 text-sm text-[#151428]/65">Matching needs your startup stage and sector first.</p><Link to="/onboarding" className="mt-4 inline-block font-medium text-[#006B3F]">Complete founder profile</Link></div>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{opportunities.data?.map(item=><Link key={item.id} to="/careers" className="border border-[#151428]/10 bg-white/60 p-5"><p className="text-sm text-[#151428]/50">{item.type??"Opportunity"}</p><h2 className="mt-2 font-semibold">{item.title}</h2><p className="mt-2 text-sm text-[#151428]/55">{item.location??"Africa"}</p></Link>)}</div>
  </PortalShell>;
}
