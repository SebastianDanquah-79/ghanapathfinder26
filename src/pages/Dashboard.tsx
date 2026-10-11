import { useEffect } from "react";
import { useNavigate } from "@/lib/router-compat";
import { Loader2, RefreshCw } from "@/lib/icons";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type AccountRole = "student" | "employee" | "employer" | "startup_founder" | "international_student";

const portalFor = (role: string | null | undefined) => {
  switch (role) {
    case "student": return "/portal/student";
    case "employee": return "/portal/employee";
    case "employer": return "/portal/employer";
    case "startup_founder":
    case "founder": return "/portal/founder";
    case "international_student": return "/portal/international-student";
    default: return null;
  }
};

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const profile = useQuery({
    queryKey: ["dashboard-role", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("account_role,onboarding_complete,role")
        .eq("id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/auth?next=%2Fdashboard", { replace: true });
      return;
    }
    if (profile.isLoading || profile.isError) return;
    const role = profile.data?.account_role || profile.data?.role;
    const destination = profile.data?.onboarding_complete ? portalFor(role) : null;
    if (destination) {
      if (window.location.pathname !== destination) navigate(destination, { replace: true });
      return;
    }
    if (!profile.data) navigate("/", { replace: true });
    else navigate("/onboarding" + (role ? "?role=" + encodeURIComponent(role) : ""), { replace: true });
  }, [loading, user, profile.isLoading, profile.isError, profile.data, navigate]);

  if (profile.isError) {
    return <main className="min-h-dvh grid place-items-center bg-background px-4 text-foreground">
      <div className="max-w-md text-center">
        <p className="font-semibold">Your portal could not be opened.</p>
        <p className="mt-2 text-sm text-muted-foreground">Your account details could not be loaded. Please try again.</p>
        <button type="button" onClick={() => void profile.refetch()} className="mt-4 inline-flex items-center gap-2 border border-border px-4 py-2 text-sm"><RefreshCw className="h-4 w-4" /> Retry</button>
      </div>
    </main>;
  }

  return <main className="min-h-dvh grid place-items-center bg-background" aria-live="polite">
    <div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /> Opening your personal portal…</div>
  </main>;
}
