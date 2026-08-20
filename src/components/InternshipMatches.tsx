import { Link } from "@/lib/router-compat";
import OfficialLink from "@/components/OfficialLink";
import { useInternshipsForCareer } from "@/hooks/useOpportunities";

/** Internships / attachments relevant to one career major, shown on career pages. */
const InternshipMatches = ({ major }: { major: string }) => {
  const { rows, isLoading } = useInternshipsForCareer(major);

  if (isLoading || rows.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Where students on this path get experience
        </h2>
        <Link to="/internships" className="text-xs text-primary hover:underline">
          All opportunities
        </Link>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Employers with attachment, internship or graduate routes that suit this field. Intake dates are
        set by the employer — always confirm on their own careers page.
      </p>
      <div className="mt-3 grid sm:grid-cols-2 gap-3">
        {rows.slice(0, 6).map((i) => (
          <article key={i.id} className="bg-glass rounded-xl p-3.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-foreground">{i.title}</h3>
                {i.companies && (
                  <Link
                    to={`/companies/${i.companies.slug}`}
                    className="text-[11px] text-primary hover:underline"
                  >
                    {i.companies.name}
                  </Link>
                )}
              </div>
              <span className="shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-primary/15 text-primary">
                {i.opportunity_type}
              </span>
            </div>
            {i.duration && (
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                {i.duration} • {i.work_mode}
                {i.paid ? " • usually paid" : ""}
              </p>
            )}
            <div className="mt-2">
              <OfficialLink href={i.application_url} label="Employer careers page" variant="ghost" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default InternshipMatches;
