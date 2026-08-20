import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import SectionHeader from "@/components/SectionHeader";
import { Search } from "@/lib/icons";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  SKILL_MAPS,
  SKILLS,
  majorsUsingSkill,
  type SkillCategory,
} from "@/data/skillsMap";

const categoryOfSkill = (id: string): SkillCategory | null => {
  for (const map of Object.values(SKILL_MAPS)) {
    for (const cat of CATEGORY_ORDER) {
      if (map[cat].includes(id)) return cat;
    }
  }
  return null;
};

const Skills = () => {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<SkillCategory | "All">("All");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return SKILLS.filter((s) => {
      if (cat !== "All" && categoryOfSkill(s.id) !== cat) return false;
      if (!term) return true;
      return (
        s.name.toLowerCase().includes(term) ||
        s.summary.toLowerCase().includes(term) ||
        s.resources.some((r) => r.provider.toLowerCase().includes(term))
      );
    });
  }, [q, cat]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Skills to Learn for Every Career in Ghana | GhanaPathFinder"
        description="Browse the foundation, technical, soft, tool and advanced skills behind each university programme and career in Ghana — with free courses, YouTube channels and certifications for each one."
        path="/skills"
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Skills", path: "/skills" },
          ]),
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="Skills"
            title="Skills you can start"
            highlight="building today"
            description="Every skill lists free learning resources from the organisation that owns the material. Nothing here requires you to be at university yet."
          />

          <div className="relative max-w-xl mx-auto mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search skills, e.g. Python, epidemiology, negotiation"
              aria-label="Search skills"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex hscroll hscroll-bleed gap-2 mb-6 md:flex-wrap md:justify-center md:overflow-visible md:mx-0 md:px-0">
            {(["All", ...CATEGORY_ORDER] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCat(c as SkillCategory | "All")}
                className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  cat === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {c === "All" ? "All skills" : CATEGORY_LABELS[c as SkillCategory]}
              </button>
            ))}
          </div>

          {rows.length === 0 && (
            <p className="text-center py-10 text-muted-foreground">No skills match that search.</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((s) => {
              const majors = majorsUsingSkill(s.id);
              return (
                <Link
                  key={s.id}
                  to={`/skills/${s.id}`}
                  className="bg-glass rounded-xl p-4 card-hover flex flex-col"
                >
                  <h2 className="font-display font-semibold text-foreground text-sm">{s.name}</h2>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">{s.summary}</p>
                  <p className="text-[11px] text-muted-foreground mt-auto pt-3">
                    {s.resources.length} learning resource{s.resources.length === 1 ? "" : "s"}
                    {majors.length > 0 && ` • used in ${majors.length} career path${majors.length === 1 ? "" : "s"}`}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Skills;
