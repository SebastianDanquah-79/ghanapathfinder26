import { Link } from "@/lib/router-compat";
import OfficialLink from "@/components/OfficialLink";
import { employersForMajor } from "@/data/employers";

/** Employers in Ghana that take students on this career path. */
const EmployerMatches = ({ major }: { major: string }) => {
  const employers = employersForMajor(major).slice(0, 6);
  if (!employers.length) return null;

  return (
    <section className="mb-6">
      <h2 className="font-display font-semibold text-foreground mb-1">
        Where to get experience
      </h2>
      <p className="text-xs text-muted-foreground mb-3">
        Organisations in Ghana that take interns, attachment students and graduate trainees on this
        path.{" "}
        <Link to="/internships" className="text-primary">
          See all employers
        </Link>
        .
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {employers.map((e) => (
          <div key={e.id} className="bg-glass rounded-xl p-4">
            <h3 className="font-display text-sm font-semibold text-foreground">{e.name}</h3>
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
            <OfficialLink href={e.url} label="Official page" variant="ghost" />
          </div>
        ))}
      </div>
    </section>
  );
};

export default EmployerMatches;
