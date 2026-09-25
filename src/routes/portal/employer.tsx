import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portal/employer")({ component: EmployerPortal });

function EmployerPortal() {
  const profile = useQuery({ queryKey:["employer-profile"], queryFn:async()=>{ const {data,error}=await supabase.from("employer_profiles").select("organization_name,hiring_focus").single(); if(error&&error.code!=="PGRST116") throw error; return data; }});
  const postings = useQuery({ queryKey:["employer-postings"], queryFn:async()=>{ const {data,error}=await supabase.from("opportunities").select("id,title,organization,type").order("created_at",{ascending:false}).limit(10); if(error) throw error; return data??[]; }});
  return <PortalShell eyebrow="Employer" title="Hire from a trusted, opted-in talent pool." description="Publish opportunities, review applicants and build a hiring workflow around information GhanaPathFinder actually owns.">
    {!profile.data&&<div className="border border-[#FCD116]/50 bg-[#FCD116]/10 p-5"><h2 className="font-semibold">Complete your employer profile</h2><p className="mt-2 text-sm text-[#151428]/65">Add your organisation and hiring focus before candidate matching is enabled.</p><Link to="/onboarding" className="mt-4 inline-block font-medium text-[#006B3F]">Complete employer profile</Link></div>}
    <div className="mt-6 grid gap-5 md:grid-cols-2"><Link to="/careers" className="border-t-4 border-[#CE1126] bg-white/60 p-6"><h2 className="text-xl font-semibold">Post an opportunity</h2><p className="mt-2 text-sm text-[#151428]/65">Create a job or internship listing using the existing opportunities model.</p></Link><section className="border-t-4 border-[#006B3F] bg-white/60 p-6"><h2 className="text-xl font-semibold">Recent platform postings</h2><p className="mt-3 text-sm text-[#151428]/65">{postings.data?.length??0} recent listings loaded.</p></section></div>
  </PortalShell>;
}
