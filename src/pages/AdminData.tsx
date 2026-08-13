import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Database, ShieldCheck, AlertTriangle, Upload, Search as SearchIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  ACCREDITATION_STATUSES,
  VERIFICATION_STATUSES,
  useAdminInstitutions,
  useCompletenessReport,
  useImportInstitutions,
  useIsAdmin,
  useUpdateInstitution,
  type ImportRow,
} from "@/hooks/useAdminData";

const Stat = ({ label, value, tone = "default" }: { label: string; value: number | string; tone?: string }) => (
  <div className="bg-glass rounded-xl p-4">
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
    <p
      className={`font-display text-2xl font-bold mt-1 ${
        tone === "warn" ? "text-destructive" : tone === "good" ? "text-primary" : "text-foreground"
      }`}
    >
      {value}
    </p>
  </div>
);

const AdminData = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const enabled = !!isAdmin;
  const report = useCompletenessReport(enabled);
  const [search, setSearch] = useState("");
  const institutions = useAdminInstitutions(search, enabled);
  const update = useUpdateInstitution();
  const importer = useImportInstitutions();
  const [csv, setCsv] = useState("");

  const parsed = useMemo<ImportRow[]>(() => {
    const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return [];
    const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
    return lines.slice(1).map((line) => {
      const cells = line.split(",").map((c) => c.trim());
      const row: Record<string, string> = {};
      header.forEach((h, i) => (row[h] = cells[i] ?? ""));
      return row as unknown as ImportRow;
    });
  }, [csv]);

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
        <main className="pt-24 pb-16 px-4 sm:px-8 lg:px-12">
          <div className="max-w-2xl mx-auto bg-glass rounded-xl p-6 text-center">
            <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-3" />
            <h1 className="font-display text-xl font-bold text-foreground">Admin access required</h1>
            <p className="text-sm text-muted-foreground mt-2">
              The data console is limited to GhanaPath administrators.
            </p>
            <Link to="/dashboard" className="inline-block mt-4 text-sm text-primary font-medium">
              Back to dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const r = report.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-8">
          <header>
            <h1 className="font-display text-2xl lg:text-4xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-7 w-7 text-primary" /> Tertiary data console
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Reconcile GhanaPath against GTEC, NMC and institutional sources. Import, verify and clean records.
            </p>
          </header>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Completeness report</h2>
            {report.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : r ? (
              <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
                <Stat label="Institutions" value={r.institutions} />
                <Stat label="Verified institutions" value={r.institutionsVerified} tone="good" />
                <Stat label="Marked accredited" value={r.institutionsAccredited} tone="good" />
                <Stat label="Missing website" value={r.institutionsMissingWebsite} tone="warn" />
                <Stat label="No programme data" value={r.institutionsMissingProgrammes} tone="warn" />
                <Stat label="Programmes" value={r.programmes} />
                <Stat label="Verified programmes" value={r.programmesVerified} tone="good" />
                <Stat label="Programmes w/o requirements" value={r.programmesMissingRequirements} tone="warn" />
                <Stat label="Cut-off records" value={r.cutoffs} />
                <Stat label="Source records" value={r.sources} />
              </div>
            ) : null}

            {r && (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-glass rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">By category</p>
                  <ul className="space-y-1 text-sm">
                    {r.byCategory.map((c: any) => (
                      <li key={c.category} className="flex justify-between text-muted-foreground">
                        <span>{c.category}</span>
                        <span className="text-foreground font-medium">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-glass rounded-xl p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">By region</p>
                  <ul className="space-y-1 text-sm">
                    {r.byRegion.map((c: any) => (
                      <li key={c.region} className="flex justify-between text-muted-foreground">
                        <span>{c.region}</span>
                        <span className="text-foreground font-medium">{c.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" /> Import institutions
            </h2>
            <p className="text-xs text-muted-foreground mb-2">
              Paste CSV with headers: name, category, type, location, region, website_url, admissions_url,
              accreditation_status, source_url. Duplicates (names, short names, aliases) are detected and skipped.
            </p>
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={6}
              placeholder="name,category,type,location,region,source_url"
              className="w-full rounded-xl bg-secondary border border-border p-3 text-sm text-foreground font-mono"
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                disabled={!parsed.length || importer.isPending}
                onClick={async () => {
                  try {
                    const res = await importer.mutateAsync(parsed);
                    toast.success(`Imported ${res.inserted.length}, skipped ${res.skipped.length} duplicates`);
                    setCsv("");
                  } catch (e: any) {
                    toast.error(e.message ?? "Import failed");
                  }
                }}
                className="px-4 min-h-[44px] rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
              >
                {importer.isPending ? "Importing…" : `Import ${parsed.length} row(s)`}
              </button>
              {importer.data?.skipped?.length ? (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  Last run skipped: {importer.data.skipped.map((s) => s.name).join(", ")}
                </span>
              ) : null}
            </div>
          </section>

          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Manage institutions</h2>
            <div className="relative mb-3 max-w-md">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, town, region or category"
                className="w-full pl-10 pr-3 min-h-[44px] rounded-xl bg-secondary border border-border text-sm text-foreground"
              />
            </div>

            {institutions.isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <div className="space-y-3">
                {(institutions.data ?? []).map((i) => (
                  <div key={i.id} className="bg-glass rounded-xl p-4 grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm break-words">{i.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {[i.location, i.region, i.category].filter(Boolean).join(" • ")}
                      </p>
                      {i.source_url && (
                        <p className="text-[11px] text-muted-foreground mt-1 truncate">Source: {i.source_url}</p>
                      )}
                    </div>
                    <select
                      value={i.accreditation_status}
                      onChange={(e) => update.mutate({ id: i.id, patch: { accreditation_status: e.target.value } })}
                      className="min-h-[44px] rounded-lg bg-secondary border border-border text-xs text-foreground px-2"
                    >
                      {ACCREDITATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <select
                      value={i.verification_status}
                      onChange={(e) =>
                        update.mutate({
                          id: i.id,
                          patch: {
                            verification_status: e.target.value,
                            verified: e.target.value === "verified",
                            last_verified_at: e.target.value === "verified" ? new Date().toISOString() : i.last_verified_at,
                          },
                        })
                      }
                      className="min-h-[44px] rounded-lg bg-secondary border border-border text-xs text-foreground px-2"
                    >
                      {VERIFICATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      defaultValue={i.website_url ?? ""}
                      placeholder="Official website"
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v !== (i.website_url ?? "")) update.mutate({ id: i.id, patch: { website_url: v || null } });
                      }}
                      className="min-h-[44px] rounded-lg bg-secondary border border-border text-xs text-foreground px-3"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminData;
