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
      const { data: profile } = await supabase.from("profiles").select("onboarding_complete,account_role,role").eq("id", session.user.id).maybeSingle();
      if (!active) return;
      if (!profile?.onboarding_complete) navigate({ to: "/onboarding", replace: true });
      else navigate({ to: "/dashboard", replace: true });
    };
    void finish();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) void finish();
    });
    return () => { active = false; data.subscription.unsubscribe(); };
  }, [navigate]);
  return <div className="min-h-dvh grid place-items-center bg-background"><div className="text-center"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto"/><p className="mt-4 text-sm text-muted-foreground">Signing you in...</p></div></div>;
}
