import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/callback")({ component: AuthCallback });

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const finish = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("onboarding_complete,onboarded,account_role,role").eq("id", session.user.id).maybeSingle();
      if (!active) return;

      if (!profile?.onboarding_complete && !profile?.onboarded) {
        navigate({ to: "/onboarding", replace: true });
        return;
      }

      const role = profile.role ?? profile.account_role ?? "student";
      const rawNext = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") : null;
      const next = rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : null;
      const destination = next ?? (role === "employer" ? "/portal/employer" : role === "employee" ? "/portal/employee" : role === "startup_founder" ? "/portal/founder" : role === "international_student" ? "/portal/international-student" : "/portal/student");
      navigate({ to: destination, replace: true });
    };

    void finish();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) void finish();
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [navigate]);

  return <div className="min-h-dvh grid place-items-center bg-background"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /><p className="mt-4 text-sm text-muted-foreground">Signing you in...</p></div></div>;
}
