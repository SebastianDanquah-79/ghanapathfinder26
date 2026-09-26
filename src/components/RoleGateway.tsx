
import { useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { ArrowRight, Briefcase, Building2, GraduationCap, Rocket, Globe, Loader2 } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const roles = [
  { key: "student", label: "Student", description: "Universities, scholarships, WASSCE matching, learning and deadlines.", icon: GraduationCap },
  { key: "employee", label: "Job Seeker", description: "Jobs, internships, skills gaps, applications and matched opportunities.", icon: BriefcaseBusiness },
  { key: "employer", label: "Employer", description: "Hire talent, publish opportunities and discover opted-in candidates.", icon: Building2 },
  { key: "startup_founder", label: "Startup Founder", description: "Funding, accelerators, investors, peers and founder resources.", icon: Rocket },
  { key: "international_student", label: "International Student", description: "Study destinations, qualification matching, embassies and peer connections.", icon: Globe2 },
] as const;

type Role = typeof roles[number]["key"];

export default function RoleGateway() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!user || loading) return;
    let cancelled = false;
    void supabase.from("profiles").select("account_role,onboarding_complete").eq("id", user.id).maybeSingle().then(function(result) {
      if (cancelled || !result.data || !result.data.onboarding_complete || !result.data.account_role) return;
      const destination = result.data.account_role === "startup_founder" ? "/portal/founder" : "/portal/" + result.data.account_role;
      navigate(destination, { replace: true });
    });
    return function() { cancelled = true; };
  }, [loading, user, navigate]);

  if (loading) return <div className="min-h-dvh grid place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  function chooseRole(role: Role) {
    localStorage.setItem("selectedRole", role);
    navigate("/onboarding?role=" + role);
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-primary">GhanaPathFinder</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">Your path is bigger than one decision.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">Choose the path that describes what you are trying to do right now. GhanaPathFinder will build the right starting point around it.</p>
        </div>
        <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Choose your path">
          {roles.map(function(item) {
            const Icon = item.icon;
            return (
              <button key={item.key} type="button" onClick={function(){chooseRole(item.key);}} className="group border border-border bg-card p-5 text-left transition hover:border-primary hover:bg-primary/[0.03] focus:outline-none focus:ring-2 focus:ring-primary">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-11 w-11 place-items-center border border-border bg-background text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </div>
                <h2 className="mt-6 text-lg font-semibold">{item.label}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </button>
            );
          })}
        </section>
        <p className="mt-8 text-xs text-muted-foreground">You can change your path later from your profile.</p>
      </div>
    </main>
  );
}
