import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import PortalShell from "@/components/PortalShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/portal/student")({ component: StudentPortal });

function StudentPortal() {
  const stats = useQuery({ queryKey: ["student-portal-stats"], queryFn: async () => {
    const [u,s,o] = await Promise.all([
      supabase.from("universities").select("id",{count:"exact",head:true}),
      supabase.from("scholarships").select("id",{count:"exact",head:true}),
      supabase.from("opportunities").select("id",{count:"exact",head:true})
    ]);
    for (const r of [u,s,o]) if (r.error) throw r.error;
    return { universities:u.count??0, scholarships:s.count??0, opportunities:o.count??0 };
  }});
  return <PortalShell eyebrow="Student" title="Build your next academic step with real information." description="Your Ghana-track home for programmes, scholarships, admission matching, learning resources and opportunities.">
    <div className="grid gap-5 md:grid-cols-3">{[["Universities",stats.data?.universities??0,"/search"],["Scholarships",stats.data?.scholarships??0,"/scholarships"],["Opportunities",stats.data?.opportunities??0,"/careers"]].map(([label,value,href]) =>
      <Link key={String(label)} to={href as string} className="border border-[#151428]/12 bg-white/60 p-6 hover:bg-white"><p className="text-sm text-[#151428]/60">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p><p className="mt-5 text-sm font-medium text-[#006B3F]">Explore</p></Link>)}</div>
    <div className="mt-8 grid gap-5 md:grid-cols-2">
      <Link to="/matcher" className="border-t-4 border-[#CE1126] bg-white/60 p-6"><h2 className="text-xl font-semibold">Admission and programme matching</h2><p className="mt-2 text-sm leading-6 text-[#151428]/65">Use your qualifications and preferences to explore programmes.</p></Link>
      <Link to="/my-path" className="border-t-4 border-[#FCD116] bg-white/60 p-6"><h2 className="text-xl font-semibold">My Path</h2><p className="mt-2 text-sm leading-6 text-[#151428]/65">Keep applications, deadlines and next actions together.</p></Link>
    </div>
  </PortalShell>;
}
