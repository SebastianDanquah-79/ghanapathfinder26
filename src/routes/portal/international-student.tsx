import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portal/international-student")({ component: InternationalStudentPortal });

function InternationalStudentPortal() {
  const students = useQuery({ queryKey:["international-students"], queryFn:async()=>{ const {data,error}=await supabase.from("international_students").select("id,university_name,programme_name,country_code,open_to_collaboration,open_to_mentorship,looking_for_opportunities").eq("is_discoverable",true).limit(30); if(error) throw error; return data??[]; }});
  return <PortalShell eyebrow="International Student" title="Study across borders without losing the community around you." description="Explore international peers, study destinations, university information and practical embassy resources.">
    <div className="grid gap-5 md:grid-cols-2"><Link to="/international-community" className="border-t-4 border-[#CE1126] bg-white/60 p-6"><h2 className="text-xl font-semibold">International community</h2><p className="mt-2 text-sm text-[#151428]/65">Embassies, visa information and destination contacts.</p></Link><Link to="/search" className="border-t-4 border-[#FCD116] bg-white/60 p-6"><h2 className="text-xl font-semibold">Explore study destinations</h2><p className="mt-2 text-sm text-[#151428]/65">Use the existing education directory to compare options.</p></Link></div>
    <section className="mt-8"><h2 className="text-xl font-semibold">Discoverable students</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{students.data?.map(item=><article key={item.id} className="border border-[#151428]/10 bg-white/60 p-5"><p className="font-medium">{item.university_name??"University not listed"}</p><p className="mt-1 text-sm text-[#151428]/60">{item.programme_name??"Programme not listed"} · {item.country_code??"Country"}</p><div className="mt-4 flex flex-wrap gap-3 text-xs text-[#006B3F]">{item.open_to_mentorship&&<span>Mentorship</span>}{item.open_to_collaboration&&<span>Collaboration</span>}{item.looking_for_opportunities&&<span>Opportunities</span>}</div></article>)}</div></section>
  </PortalShell>;
}
