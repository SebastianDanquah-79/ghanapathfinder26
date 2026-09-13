import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BrandLogo from "@/components/BrandLogo";
import { Loader2, ShieldCheck } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdminData";
import {
  GTEC_LIST_URL,
  useGtecCounts,
  useGtecDecision,
  useGtecInstitutions,
  type GtecFilter,
  type GtecRow,
} from "@/hooks/useGtecDashboard";

const FILTERS: { key: GtecFilter; label: string }[] = [
  { key: "all", label: "All published" },
  { key: "unconfirmed", label: "Not confirmed against GTEC" },
  { key: "confirmed", label: "Confirmed accredited" },
  { key: "no_source", label: "No regulator source" },
  { key: "in_review", label: "Back in review" },
];

const InstitutionRow = ({ row }: { row: GtecRow }) => {
  const decide = useGtecDecision();
  const [source, setSource] = useState(row.source_url ?? "");
  const [note, setNote] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const confirmed = row.gtec_accreditation_status === "Accredited";

  const gtecSearch = `https://www.google.com/search?q=${encodeURIComponent(`site:gtec.edu.gh ${row.name}`)}`;

  const run = async (decision: "approve" | "reject") => {
    try {
      await decide.mutateAsync({
        id: row.id,
        decision,
        name: row.name,
        sourceUrl: source.trim() || null,
        note,
      });
      setRejecting(false);
      setNote("");
      toast.success(decision === "approve" ? `${row.name} confirmed accredited` : `${row.name} sent back to review`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    }
  };

  return (
    <article className="rounded-xl border border-border bg-card p-4 space-y-3">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <BrandLogo name={row.name} websiteUrl={row.website_url} logoUrl={row.logo_source_url ?? row.logo_url} size={44} />
          <div className="min-w-0">
            <h3 className="font-display text-base font-semibold text-foreground">{row.name}</h3>
            <p className="text-[11px] text-muted-foreground">
              {[row.institution_type ?? row.category, row.location, row.region].filter(Boolean).join(" · ") || "—"}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-[11px] font-medium ${
            confirmed ? "border-primary text-primary" : "border-border text-muted-foreground"
          }`}
        >
          {row.needs_review ? "In review" : confirmed ? "GTEC accredited" : row.gtec_accreditation_status ?? "Unconfirmed"}
        </span>
      </header>

      <div className="flex flex-wrap gap-3 text-[11px]">
        <a href={GTEC_LIST_URL} target="_blank" rel="noreferrer noopener" className="text-primary underline underline-offset-2">
          Open GTEC list
        </a>
        <a href={gtecSearch} target="_blank" rel="noreferrer noopener" className="text-primary underline underline-offset-2">
          Find this institution on gtec.edu.gh
        </a>
        {row.website_url && (
          <a href={row.website_url} target="_blank" rel="noreferrer noopener" className="text-primary underline underline-offset-2">
            Institution website
          </a>
        )}
        <span className="text-muted-foreground">
          {row.last_verified_at ? `Last checked ${new Date(row.last_verified_at).toLocaleDateString("en-GB")}` : "Never checked"}
        </span>
        {row.logo_verification_status !== "verified" && <span className="text-muted-foreground">Logo unconfirmed</span>}
      </div>

      <label className="block text-xs text-muted-foreground space-y-1">
        <span>Regulator source link</span>
        <input
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="https://gtec.edu.gh/..."
          className="w-full min-h-[38px] rounded-lg border border-border bg-secondary px-2 text-sm text-foreground"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => run("approve")}
          disabled={decide.isPending}
          className="min-h-[38px] rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50"
        >
          Matches GTEC — approve
        </button>
        <button
          onClick={() => setRejecting((v) => !v)}
          className="min-h-[38px] rounded-lg border border-border px-3 text-xs text-destructive"
        >
          Not on the list — reject
        </button>
      </div>

      {rejecting && (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="What did GTEC show? (kept in the corrections log)"
            className="w-full rounded-lg border border-border bg-secondary p-2 text-sm text-foreground"
          />
          <button
            onClick={() => run("reject")}
            disabled={decide.isPending}
            className="min-h-[38px] rounded-lg bg-destructive px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50"
          >
            Confirm rejection
          </button>
        </div>
      )}
    </article>
  );
};

const AdminGtec = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const enabled = !!isAdmin;
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<GtecFilter>("unconfirmed");
  const counts = useGtecCounts(enabled);
  const list = useGtecInstitutions(search, filter, enabled);

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 px-4">
          <div className="max-w-2xl mx-auto rounded-xl border border-border p-5 text-center">
            <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-primary" />
            <h1 className="font-display text-xl font-bold text-foreground">Admin access required</h1>
            <p className="mt-2 text-sm text-muted-foreground">The accreditation dashboard is limited to administrators.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const c = counts.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl space-y-6">
          <header>
            <h1 className="font-display text-2xl font-bold text-foreground lg:text-3xl">Accreditation dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Every published institution, checked line by line against the regulator's live accredited list. Approve or
              reject in one click; rejected records go straight back to the review queue.
            </p>
          </header>

          {c && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                ["Published", c.total],
                ["Confirmed", c.confirmed],
                ["Unconfirmed", c.unconfirmed],
                ["No source", c.noSource],
                ["In review", c.inReview],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl border border-border bg-card p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
                  <p className="font-display text-xl font-bold text-foreground">{value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`min-h-[38px] rounded-lg border px-3 text-xs font-medium ${
                  filter === f.key ? "border-primary text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, town or region"
            className="w-full min-h-[42px] rounded-lg border border-border bg-secondary px-3 text-sm text-foreground"
          />

          {list.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (list.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing matches that filter.</p>
          ) : (
            <div className="space-y-3">
              {(list.data ?? []).map((row) => (
                <InstitutionRow key={row.id} row={row} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminGtec;
