import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Globe2, Rocket, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({ component: RoleGateway });

const roles = [
  { role: "student", title: "Student", text: "Universities, programmes, scholarships, careers and opportunities.", icon: GraduationCap },
  { role: "employee", title: "Job Seeker", text: "Jobs, internships, remote work and a professional profile.", icon: BriefcaseBusiness },
  { role: "employer", title: "Employer", text: "Publish opportunities and discover opted-in African talent.", icon: BriefcaseBusiness },
  { role: "startup_founder", title: "Startup Founder", text: "Funding, investors, accelerators and founder intelligence.", icon: Rocket },
  { role: "international_student", title: "International Student", text: "Study abroad, peer connections, embassies and global opportunities.", icon: Globe2 },
] as const;

function RoleGateway() {
  const navigate = useNavigate();
  const stats = useQuery({
    queryKey: ["gateway-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("platform_analytics");
      if (error) throw error;
      return (data ?? {}) as { total_users?: number; active_users?: number; recommendation_runs?: number };
    },
    staleTime: 60_000,
  });

  const choose = (role: (typeof roles)[number]["role"]) => {
    localStorage.setItem("selectedRole", role);
    navigate({ to: "/auth", search: { role } });
  };

  const birthday = new Date().getMonth() === 8 && new Date().getDate() === 21;

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#0A0A0F] text-white">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#CE1126] via-[#FCD116] to-[#006B3F]" />
      <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#CE1126]/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-[#006B3F]/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-4 py-12 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#FCD116]">GhanaPathFinder</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Your path to Africa's future starts here.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/65 sm:text-lg">Education, work, entrepreneurship, opportunities and knowledge in one platform.</p>
        </div>
        {birthday && <div className="mt-6 max-w-3xl rounded-xl border border-[#FCD116]/30 bg-[#FCD116]/10 p-4 text-sm text-white/85">Today is Kwame Nkrumah's birthday. We face neither East nor West: we face forward.</div>}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {roles.map(({ role, title, text, icon: Icon }) => (
            <button key={role} onClick={() => choose(role)} className="group text-left rounded-2xl border border-white/10 bg-white/[0.045] p-6 transition duration-200 hover:scale-[1.01] hover:border-[#FCD116]/40 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-[#FCD116]">
              <Icon className="h-7 w-7 text-[#FCD116]" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#FCD116]">Continue <ArrowRight className="h-4 w-4" /></span>
            </button>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/60">
          <span>{stats.data?.total_users ?? 0} accounts</span>
          <span>{stats.data?.active_users ?? 0} active users</span>
          <span>{stats.data?.recommendation_runs ?? 0} recommendation runs</span>
        </div>
        <div className="mt-6 flex items-center gap-4 text-sm">
          <Link to="/auth" className="text-white/70 underline underline-offset-4 hover:text-white">Already have an account? Sign in</Link>
          <Link to="/ai" className="inline-flex items-center gap-2 text-[#FCD116]"><Sparkles className="h-4 w-4" /> AI advisor</Link>
        </div>
      </div>
    </main>
  );
}
