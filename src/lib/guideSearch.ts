/**
 * Client-side search across the guide content that does not live in the
 * database: career paths, skills and employers/internships.
 * Keeps the global search page truly global.
 */
import { careerPaths } from "@/data/careerPaths";
import { SKILLS } from "@/data/skillsMap";
import { EMPLOYERS } from "@/data/employers";
import { careerSlug } from "@/data/careers";

export type GuideKind = "career" | "skill" | "employer";

export interface GuideResult {
  kind: GuideKind;
  id: string;
  title: string;
  subtitle: string;
  blurb: string;
  to: string;
  tags: string[];
}

const hit = (q: string, ...fields: (string | string[] | undefined)[]) => {
  if (!q) return true;
  return fields.some((f) => {
    if (!f) return false;
    const text = Array.isArray(f) ? f.join(" ") : f;
    return text.toLowerCase().includes(q);
  });
};

export const searchGuide = (rawQuery: string, kinds?: GuideKind[]): GuideResult[] => {
  const q = rawQuery.trim().toLowerCase();
  const want = (k: GuideKind) => !kinds || kinds.includes(k);
  const out: GuideResult[] = [];

  if (want("career")) {
    for (const c of careerPaths) {
      if (
        hit(q, c.career_name, c.major, c.description, c.related_careers, c.industries, c.entry_level_roles)
      ) {
        out.push({
          kind: "career",
          id: c.major,
          title: c.career_name,
          subtitle: `Career path · ${c.major}`,
          blurb: c.description,
          to: `/careers/${careerSlug(c.major)}`,
          tags: c.industries.slice(0, 3),
        });
      }
    }
  }

  if (want("skill")) {
    for (const s of SKILLS) {
      if (hit(q, s.name, s.summary, s.why)) {
        out.push({
          kind: "skill",
          id: s.id,
          title: s.name,
          subtitle: "Skill · learning resources",
          blurb: s.summary,
          to: `/skills/${s.id}`,
          tags: [],
        });
      }
    }
  }

  if (want("employer")) {
    for (const e of EMPLOYERS) {
      if (hit(q, e.name, e.about, e.sector, e.locations, e.majors, e.opportunities)) {
        out.push({
          kind: "employer",
          id: e.id,
          title: e.name,
          subtitle: `${e.sector} · ${e.locations.slice(0, 2).join(", ")}`,
          blurb: e.about,
          to: `/internships/${e.id}`,
          tags: e.opportunities.slice(0, 3),
        });
      }
    }
  }

  if (!q) return out.slice(0, 24);

  return out
    .sort((a, b) => {
      const rank = (r: GuideResult) => (r.title.toLowerCase().startsWith(q) ? 0 : r.title.toLowerCase().includes(q) ? 1 : 2);
      return rank(a) - rank(b) || a.title.localeCompare(b.title);
    })
    .slice(0, 40);
};
