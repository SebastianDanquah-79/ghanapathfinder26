import EmployerPhoto from "@/components/EmployerPhoto";
import BrandLogo from "@/components/BrandLogo";
import OfficialLink from "@/components/OfficialLink";
import { useVerifiedEmployers } from "@/hooks/useEmployerDirectory";

/** Employers whose internship or graduate scheme was checked on the employer's own page. */
const VerifiedEmployers = () => {
  const { data, isLoading } = useVerifiedEmployers();
  const rows = data ?? [];
  if (isLoading || rows.length === 0) return null;

  return (
    <section className="mt-10 space-y-4">
      <header>
        <h2 className="font-display text-xl font-semibold text-foreground">Checked employer programmes</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Each employer below was confirmed on its own careers page, with the date of the last check. Photos come from
          Google Places.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {rows.map((row) => (
          <article key={row.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center gap-3">
              <BrandLogo name={row.name} websiteUrl={row.website_url} logoUrl={row.logo_source_url} size={40} />
              <div className="min-w-0">
                <h3 className="font-display text-base font-semibold text-foreground truncate">{row.name}</h3>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {row.sector ?? "Employer"}
                  {row.paid ? " · Paid" : ""}
                </p>
              </div>
            </div>

            <EmployerPhoto name={row.name} location="Ghana" limit={1} />

            {row.programme_summary && <p className="text-sm text-muted-foreground">{row.programme_summary}</p>}

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {row.application_url && <OfficialLink href={row.application_url} label="Apply on their site" />}
              {row.last_verified_at && (
                <span className="text-muted-foreground">
                  Checked {new Date(row.last_verified_at).toLocaleDateString("en-GB")}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default VerifiedEmployers;
