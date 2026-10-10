import { useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Loader2 } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";

const safeNext = (value: string | null) =>
  value && value.startsWith("/") && !value.startsWith("//") ? value : null;

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const next = safeNext(params.get("next"));
      const oauthError = params.get("error_description") ?? params.get("error");
      if (oauthError) {
        navigate("/auth?oauth_error=" + encodeURIComponent(oauthError), { replace: true });
        return;
      }

      // Supabase's client processes the PKCE callback during initialization.
      // Wait for that initialization before checking the session.
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError || !sessionData.session?.user) {
        navigate("/auth", { replace: true });
        return;
      }

      const user = sessionData.session.user;
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_complete,account_role")
        .eq("id", user.id)
        .maybeSingle();
      if (!active) return;

      if (next) {
        window.location.replace(next);
        return;
      }
      if (profile?.onboarding_complete && profile.account_role) {
        navigate(
          profile.account_role === "startup_founder"
            ? "/portal/founder"
            : "/portal/" + profile.account_role,
          { replace: true },
        );
      } else {
        navigate("/onboarding", { replace: true });
      }
    })().catch((error) => {
      console.error("OAuth callback failed", error);
      if (active) navigate("/auth", { replace: true });
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-dvh grid place-items-center bg-background">
      <div className="text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Finishing sign-in…</p>
      </div>
    </div>
  );
}
