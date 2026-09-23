import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "@/lib/router-compat";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : null;
}

function AuthCallback() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    let active = true;

    const finish = async () => {
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("Supabase OAuth callback exchange failed:", error);
          if (active) navigate("/auth", { replace: true });
          return;
        }
      }

      const { data, error } = await supabase.auth.getSession();
      if (!active) return;

      if (error || !data.session?.user) {
        console.error("Supabase callback session missing:", error);
        navigate("/auth", { replace: true });
        return;
      }

      const next = safeNext(params.get("next"));
      const { data: profile, error: profileError } = await (supabase as any)
        .from("profiles")
        .select("onboarded, account_role")
        .eq("id", data.session.user.id)
        .maybeSingle();

      if (profileError) {
        console.error("Profile lookup after authentication failed:", profileError);
      }

      if (next) {
        window.location.replace(next);
        return;
      }

      if (!profile?.onboarded) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    };

    void finish();
    return () => {
      active = false;
    };
  }, [navigate, params]);

  return (
    <div className="min-h-dvh bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">Signing you in...</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Please wait while we finish authentication.
        </p>
      </div>
    </div>
  );
}
