import { useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { careerPaths } from "@/data/careerPaths";
import { careerSlug } from "@/data/careers";
import { skillMapForMajor, skillById, CATEGORY_ORDER } from "@/data/skillsMap";
import { employersForMajor } from "@/data/employers";

/**
 * "Where this programme leads": links a programme to its careers, the skills
 * students should build, and Ghanaian employers offering internships.
 */
const ProgrammeEcosystem = ({
  programmeName,
  field,
}: {
  programmeName: string;
  field?: string | null;
}) => {
  const { careers, skills, employers } = useMemo(() => {
    const hay = `${programmeName} ${field ?? ""}`.toLowerCase();
    const matched = careerPaths.filter((c) => {
      const m = c.major.toLowerCase();
      return (
        hay.includes(m) ||
        m.includes(hay.trim()) ||
        c.recommended_programmes.some((p) => hay.includes(p.toLowerCase()))
      );
    });
    const primary = matched[0];
    const map = primary ? skillMapForMajor(primary.major) : undefined;
    const skillIds = map
      ? CATEGORY_ORDER.flatMap((cat) => (map[cat] ?? []).slice(0, 2)).slice(0, 8)
      : [];
    return {
      careers: matched.slice(0, 4),
      skills: skillIds.map((id) => skillById(id)).filter(Boolean),
      employers: primary ? employersForMajor(primary.major).slice(0, 6) : [],
    };
  }, [programmeName, field]);

  if (careers.length === 0 && skills.length === 0 && employers.length === 0) return null;

  return (
    <section className="bg-glass rounded-xl p-4 space-y-4">
      <div>
        <h2 className="font-display text-sm font-semibold text-foreground">Where this leads</h2>
        <p className="text-xs text-muted-foreground">
          Careers, skills and Ghanaian employers connected to this programme.
        </p>
      </div>

      {careers.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Careers</p>
          <div className="flex flex-wrap gap-2">
            {careers.map((c) => (
              <Link
                key={c.major}
                to={`/careers/${careerSlug(c.major)}`}
                className="px-3 py-1.5 rounded-full bg-secondary text-xs text-foreground hover:text-primary"
              >
                {c.career_name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
            Skills to build
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <Link
                key={s!.id}
                to={`/skills/${s!.id}`}
                className="px-3 py-1.5 rounded-full bg-secondary text-xs text-foreground hover:text-primary"
              >
                {s!.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {employers.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
            Internships &amp; employers
          </p>
          <ul className="space-y-1.5">
            {employers.map((e) => (
              <li key={e.id} className="text-xs">
                <Link to={`/internships/${e.id}`} className="text-foreground hover:text-primary font-medium">
                  {e.name}
                </Link>
                <span className="text-muted-foreground"> — {e.sector}</span>
              </li>
            ))}
          </ul>
          <Link to="/internships" className="inline-block mt-2 text-xs text-primary hover:underline">
            Browse all internships
          </Link>
        </div>
      )}
    </section>
  );
};

export default ProgrammeEcosystem;
