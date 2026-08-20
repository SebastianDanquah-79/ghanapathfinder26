import { Link } from "@/lib/router-compat";
import {
  CATEGORY_HINTS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  skillById,
  skillMapForMajor,
} from "@/data/skillsMap";

const SkillsMap = ({ major }: { major: string }) => {
  const map = skillMapForMajor(major);
  if (!map) return null;

  return (
    <section className="mb-6">
      <h2 className="font-display font-semibold text-foreground mb-1">Skills you need</h2>
      <p className="text-xs text-muted-foreground mb-3">
        Tap any skill for what it is and free places to learn it. Sources are credited on the{" "}
        <Link to="/credits" className="text-primary">
          credits page
        </Link>
        .
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {CATEGORY_ORDER.map((cat) => {
          const ids = map[cat].filter((id) => skillById(id));
          if (!ids.length) return null;
          return (
            <div key={cat} className="bg-glass rounded-xl p-4">
              <h3 className="font-display text-sm font-semibold text-foreground">
                {CATEGORY_LABELS[cat]}
              </h3>
              <p className="text-[11px] text-muted-foreground mb-2">{CATEGORY_HINTS[cat]}</p>
              <ul className="flex flex-wrap gap-1.5">
                {ids.map((id) => {
                  const s = skillById(id)!;
                  return (
                    <li key={id}>
                      <Link
                        to={`/skills/${s.id}`}
                        className="inline-flex rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-primary/15 transition-colors"
                      >
                        {s.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default SkillsMap;
