import { useEffect, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { Bell, BriefcaseBusiness, ChevronRight, CircleUserRound, LogOut, ShieldAlert, Trash2 } from "lucide-react";
import { toast } from "sonner";

const roleNames: Record<string, string> = {
  student: "Student",
  employee: "Job seeker",
  employer: "Employer",
  founder: "Startup founder",
  startup_founder: "Startup founder",
  "international-student": "International student",
  international_student: "International student",
};

export default function AccountSettings() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?next=%2Faccount", { replace: true });
      return;
    }
    if (!user) return;
    let active = true;
    void supabase.from("profiles").select("account_role,role").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (active) setRole(data?.account_role ?? data?.role ?? null);
    });
    return () => { active = false; };
  }, [loading, user?.id, navigate]);

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  async function handleDeleteAccount() {
    if (!user || confirmation !== "DELETE" || deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const { data, error } = await supabase.functions.invoke("delete-account", {
        body: { confirmation: "DELETE" },
      });
      if (error) {
        const context = (error as { context?: Response }).context;
        let message = "Account deletion did not complete. Uploaded media may already have been removed. Contact support before retrying so the account state can be checked.";
        if (context) {
          try {
            const payload = await context.clone().json() as { error?: string };
            if (payload.error) message = payload.error;
          } catch { /* use the safe default */ }
        }
        throw new Error(message);
      }
      if (data?.error) throw new Error(String(data.error));
      await supabase.auth.signOut({ scope: "local" });
      toast.success("Your account has been deleted.");
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Account deletion failed", error);
      setDeleteError(error instanceof Error ? error.message : "Your account could not be deleted. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !user) {
    return <div className="min-h-dvh grid place-items-center bg-background text-sm text-muted-foreground">Loading account settings…</div>;
  }

  return (
    <div className="min-h-dvh bg-background pb-24 pt-20 text-foreground">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 sm:px-6">
        <Seo title="Account settings | GhanaPathFinder" description="Manage your GhanaPathFinder account, portal and privacy choices." path="/account" />
        <header className="mb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your account</p>
          <h1 className="mt-2 text-3xl font-bold">Account settings</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Manage your active portal, notifications and account access from one place.</p>
        </header>

        <section className="border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center border border-border bg-background text-primary"><CircleUserRound className="h-5 w-5" /></span>
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold">{String(user.user_metadata?.full_name ?? user.email ?? "Your account")}</h2>
              <p className="mt-1 break-all text-xs text-muted-foreground">{user.email ?? "Signed-in account"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Active portal: {role ? (roleNames[role] ?? role.replace(/[_-]/g, " ")) : "Choose your portal"}</p>
            </div>
          </div>
        </section>

        <section className="mt-4 divide-y divide-border border border-border bg-card">
          <Link to="/?switchRole=1" className="flex items-center gap-3 p-4 transition hover:bg-secondary/50">
            <BriefcaseBusiness className="h-5 w-5 text-primary" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Change portal</span><span className="mt-1 block text-xs text-muted-foreground">Switch between student, job seeker, employer, founder and international student.</span></span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link to="/notifications" className="flex items-center gap-3 p-4 transition hover:bg-secondary/50">
            <Bell className="h-5 w-5 text-primary" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Notifications</span><span className="mt-1 block text-xs text-muted-foreground">View updates and mark messages as read.</span></span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <button type="button" onClick={() => void handleSignOut()} className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-secondary/50">
            <LogOut className="h-5 w-5 text-primary" />
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Sign out</span><span className="mt-1 block text-xs text-muted-foreground">Sign out of this account on this device.</span></span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>

        <section className="mt-8 border border-destructive/40 p-5">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-destructive">Delete account</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">This permanently deletes your account and personal portal data. It also removes posts and comments tied to your account where supported. This action cannot be undone.</p>
              {!showDelete ? (
                <button type="button" onClick={() => setShowDelete(true)} className="mt-4 inline-flex items-center gap-2 border border-destructive px-3 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5"><Trash2 className="h-4 w-4" /> Delete my account</button>
              ) : (
                <div className="mt-4 space-y-3">
                  <label htmlFor="delete-confirmation" className="block text-sm font-medium">Type <span className="font-bold">DELETE</span> to confirm.</label>
                  <input id="delete-confirmation" value={confirmation} onChange={event => setConfirmation(event.target.value)} autoComplete="off" spellCheck={false} className="w-full max-w-xs border border-border bg-background px-3 py-2 text-sm outline-none focus:border-destructive" placeholder="DELETE" />
                  {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={confirmation !== "DELETE" || deleting} onClick={() => void handleDeleteAccount()} className="border border-destructive bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-50">{deleting ? "Deleting account…" : "Permanently delete account"}</button>
                    <button type="button" disabled={deleting} onClick={() => { setShowDelete(false); setConfirmation(""); setDeleteError(null); }} className="border border-border px-4 py-2 text-sm font-medium disabled:opacity-50">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <p className="mt-5 text-xs leading-5 text-muted-foreground">Your active portal controls which dashboard and private profile fields are shown. Public platform information remains available across portals.</p>
      </main>
    </div>
  );
}
