import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const destinationForRole = (role: string | null | undefined) => {
  switch (role) {
    case "student": return "/portal/student";
    case "employee": return "/portal/employee";
    case "employer": return "/portal/employer";
    case "startup_founder": return "/portal/founder";
    case "international_student": return "/portal/international-student";
    default: return "/onboarding";
  }
};

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const search = new URLSearchParams(window.location.search);
        const code = search.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!data.user) throw new Error("Authentication completed without a user session.");

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("onboarding_complete,account_role,role")
          .eq("id", data.user.id)
          .maybeSingle();
        if (profileError) throw profileError;

        const next = search.get("next");
        if (next && next.startsWith("/") && !next.startsWith("//")) {
          window.location.href = next;
          return;
        }

        if (active) {
          navigate(
            profile?.onboarding_complete
              ? destinationForRole(profile.account_role ?? profile.role)
              : "/onboarding",
            { replace: true },
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Authentication callback failed.";
        toast.error(message);
        if (active) navigate("/auth", { replace: true });
      }
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <main className="min-h-dvh grid place-items-center bg-background px-6">
      <p className="text-sm text-muted-foreground">Completing sign-in...</p>
    </main>
  );
}

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});
