import { Link } from "@/lib/router-compat";
import OfficialLink from "@/components/OfficialLink";
import { useBestFitExperience } from "@/hooks/useBestFitExperience";

/** Employers in Ghana that take students on this career path, ranked for the student. */
const EmployerMatches = ({ major }: { major: string }) => {
  const { data } = useBestFitExperience(major);
  const results = (data?.results ?? []).slice(0, 6);
  if (!results.length) return null;

  return (
    <section className="mb-6">
      <h2 className="font-display font-semibold text-foreground mb-1">
        Best-fit experience for you
      </h2>
      <p className="text-xs text-muted-foreground mb-3">
        {data?.personalised
          ? `Ranked using your WASSCE results${data.aggregate ? ` (aggregate ${data.aggregate})` : ""}, region and intended programme.`
          : "Organisations in Ghana that take interns, attachment students and graduate trainees on this path. Sign in and add your WASSCE results for a personalised ranking."}{" "}
        <Link to="/internships" className="text-primary">
          See all employers
        </Link>
        .
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {results.map(({ employer: e, reasons }) => (
          <div key={e.id} className="bg-glass rounded-xl p-4">
            <Link
              to={`/internships/${e.id}`}
              className="font-display text-sm font-semibold text-foreground hover:text-primary"
            >
              {e.name}
            </Link>
            <p className="text-[11px] text-muted-foreground">
              {e.sector} · {e.locations.join(", ")}
            </p>
            <ul className="mt-2 mb-2 flex flex-wrap gap-1.5">
              {e.opportunities.map((o) => (
                <li key={o} className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px]">
                  {o}
                </li>
              ))}
            </ul>
            {reasons.length > 0 && (
              <ul className="mb-2 text-[11px] text-muted-foreground space-y-0.5">
                {reasons.map((r) => (
                  <li key={r}>• {r}</li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/internships/${e.id}`}
                className="inline-flex items-center rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Requirements & checklist
              </Link>
              <OfficialLink href={e.url} label="Official page" variant="ghost" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EmployerMatches;
