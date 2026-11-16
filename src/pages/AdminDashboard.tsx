import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Database,
  Loader2,
  LogOut,
  MessageCircle,
  ShieldCheck,
  UserCheck,
} from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ADMIN_EMAIL, useCompletenessReport, useIsAdmin } from "@/hooks/useAdminData";
import { useReviewCounts } from "@/hooks/useReviewQueue";

const modules = [
  {
    title: "Verify universities and programmes",
    description:
      "Review institutions, universities, programmes, internship providers, skills providers and opportunity listings before they are published.",
    href: "/admin/review",
    icon: ShieldCheck,
    action: "Open verification queue",
  },
  {
    title: "University catalogue and sources",
    description:
      "Manage institution records, accreditation and verification status, import catalogue records, and maintain source references.",
    href: "/admin/data",
    icon: Database,
    action: "Manage catalogue and sources",
  },
  {
    title: "People and mentor verification",
    description:
      "Review mentor applications and publish only eligible applicants whose institution or fellowship details have been independently checked.",
    href: "/mentorship",
    icon: UserCheck,
    action: "Review mentor applicants",
  },
  {
    title: "Community moderation",
    description:
      "Review reported student insights, approve appropriate content, hide or reject submissions, and remove content when necessary.",
    href: "/admin/insights",
    icon: MessageCircle,
    action: "Open moderation queue",
  },
  {
    title: "Platform analytics",
    description:
      "Review platform activity, usage trends and key engagement metrics.",
    href: "/admin/analytics",
    icon: BarChart3,
    action: "View analytics",
  },
];

const Metric = ({ label, value, detail }: { label: string; value: number | string; detail?: string }) => (
  <div className="rounded-2xl border border-border bg-card p-4">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="mt-2 font-display text-2xl font-bold tabular-nums text-foreground">{value}</p>
    {detail && <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>}
  </div>
);

const AdminDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const { data: isAdmin, isLoading: roleLoading, isError: roleError } = useIsAdmin();
  const enabled = !!user && user.email?.trim().toLowerCase() === ADMIN_EMAIL && isAdmin === true;

  const reviewCounts = useReviewCounts(enabled);
  const catalogue = useCompletenessReport(enabled);
  const mentorQueue = useQuery({
    queryKey: ["admin_pending_mentor_applications"],
    enabled,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("mentor_applications")
        .select("id", { count: "exact", head: true })
        .eq("application_status", "pending");
      if (error) throw error;
      return count ?? 0;
    },
    staleTime: 60_000,
  });

  const pendingCatalogue = useMemo(
    () => Object.values(reviewCounts.data ?? {}).reduce((sum, count) => sum + count, 0),
    [reviewCounts.data],
  );

  const switchAccount = async () => {
    await signOut();
    window.location.assign("/auth?next=%2Fadmin");
  };

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Seo title="Admin sign in | GhanaPathFinder" description="Restricted GhanaPathFinder administrator sign-in." path="/admin" />
        <Navbar />
        <main className="px-4 pb-16 pt-24">
          <section className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 text-center">
            <ShieldCheck className="mx-auto h-9 w-9 text-primary" />
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">GhanaPathFinder Admin</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This control centre is restricted to {ADMIN_EMAIL}. Sign in with that Google account to continue.
            </p>
            <Link
              to="/auth?next=%2Fadmin"
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
            >
              Continue to secure sign in <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-xs text-muted-foreground">
              Use the Google sign-in option on the sign-in page. GhanaPathFinder never asks for or stores your Gmail password.
            </p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const allowedEmail = user.email?.trim().toLowerCase() === ADMIN_EMAIL;

  if (!allowedEmail) {
    return (
      <div className="min-h-screen bg-background">
        <Seo title="Admin access restricted | GhanaPathFinder" description="Restricted GhanaPathFinder administrator area." path="/admin" />
        <Navbar />
        <main className="px-4 pb-16 pt-24">
          <section className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 text-center">
            <ShieldCheck className="mx-auto h-9 w-9 text-destructive" />
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Access not permitted</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This account is not on the GhanaPathFinder administrator allow-list.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">Signed in as: {user.email ?? "Unknown account"}</p>
            <button
              type="button"
              onClick={() => void switchAccount()}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-4 text-sm font-semibold text-foreground"
            >
              <LogOut className="h-4 w-4" /> Sign out and switch account
            </button>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin || roleError) {
    return (
      <div className="min-h-screen bg-background">
        <Seo title="Admin role required | GhanaPathFinder" description="Restricted GhanaPathFinder administrator area." path="/admin" />
        <Navbar />
        <main className="px-4 pb-16 pt-24">
          <section className="mx-auto max-w-lg rounded-2xl border border-border bg-card p-6 text-center">
            <ShieldCheck className="mx-auto h-9 w-9 text-primary" />
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Administrator role required</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your account is recognised, but its administrator permission is not active. No admin data has been opened.
            </p>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Admin Control Centre | GhanaPathFinder" description="Restricted GhanaPathFinder operations, verification, moderation and analytics." path="/admin" />
      <Navbar />
      <main className="px-4 pb-16 pt-24 sm:px-8">
        <div className="mx-auto max-w-7xl space-y-7">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Restricted workspace</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Admin Control Centre</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Manage GhanaPathFinder's catalogue quality, verification queues, community safety and platform operations.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Authenticated admin</p>
                <p className="text-xs font-medium text-foreground">{ADMIN_EMAIL}</p>
              </div>
            </div>
          </header>

          <section aria-label="Admin overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Pending catalogue reviews"
              value={reviewCounts.isLoading ? "…" : pendingCatalogue}
              detail="Universities, programmes, providers and listings"
            />
            <Metric
              label="Pending mentor applications"
              value={mentorQueue.isLoading ? "…" : mentorQueue.data ?? "—"}
              detail="People awaiting eligibility review"
            />
            <Metric
              label="Universities in catalogue"
              value={catalogue.isLoading ? "…" : catalogue.data?.institutions ?? "—"}
              detail="Catalogue snapshot"
            />
            <Metric
              label="Programmes in catalogue"
              value={catalogue.isLoading ? "…" : catalogue.data?.programmes ?? "—"}
              detail="Catalogue snapshot"
            />
          </section>

          {(reviewCounts.isError || mentorQueue.isError || catalogue.isError) && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              Some overview figures could not be loaded. Open the relevant module to inspect its queue.
            </p>
          )}

          <section>
            <div className="mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground">Administration modules</h2>
              <p className="mt-1 text-sm text-muted-foreground">Choose an area to review or manage.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.href} className="flex flex-col rounded-2xl border border-border bg-card p-5">
                    <Icon className="h-6 w-6 text-primary" />
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                    <Link
                      to={item.href}
                      className="mt-5 inline-flex min-h-10 items-center gap-2 self-start text-sm font-semibold text-primary hover:underline"
                    >
                      {item.action} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-secondary/30 p-5">
            <h2 className="font-display text-base font-semibold text-foreground">Verification standards</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground md:grid-cols-2">
              <li>Use official university, regulator or organisation sources before marking catalogue records as verified.</li>
              <li>Keep source URLs and verification notes with the record so future reviews can be repeated.</li>
              <li>Mentor approval is limited to the existing adult-applicant review process; do not collect passwords or private identity documents in platform notes.</li>
              <li>Only publish user-submitted content after it has passed the relevant review.</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
