import { Link, useParams } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import SaveButton from "@/components/SaveButton";
import { ArrowLeft, Globe } from "@/lib/icons";
import { careerSlug } from "@/data/careers";
import { majorsUsingSkill, skillById } from "@/data/skillsMap";

const SkillDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const skill = skillById(slug ?? "");

  if (!skill) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 text-center">
          <h1 className="font-display text-xl font-semibold text-foreground mb-2">Skill not found</h1>
          <Link to="/skills" className="text-sm text-primary">
            Browse all skills
          </Link>
        </main>
      </div>
    );
  }

  const majors = majorsUsingSkill(skill.id);
  const path = `/skills/${skill.id}`;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${skill.name} , how to learn it in Ghana | GhanaPathFinder`}
        description={`${skill.summary} ${skill.why}`.slice(0, 155)}
        path={path}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Skills", path: "/skills" },
            { name: skill.name, path },
          ]),
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/skills"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
          >
            <ArrowLeft className="h-4 w-4" /> All skills
          </Link>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">{skill.name}</h1>
          <p className="text-sm text-muted-foreground mb-2">{skill.summary}</p>
          <p className="text-sm text-muted-foreground mb-4">
            <span className="text-foreground font-medium">Why it matters: </span>
            {skill.why}
          </p>

          <div className="mb-6">
            <SaveButton
              item={{
                item_type: "skill",
                item_key: skill.id,
                title: skill.name,
                subtitle: skill.summary.slice(0, 120),
                metadata: { resources: skill.resources.length },
              }}
            />
          </div>

          <section className="bg-glass rounded-xl p-4 mb-3">
            <h2 className="font-display font-semibold text-foreground mb-1 text-sm sm:text-base">
              Where to learn it
            </h2>
            <p className="text-[11px] text-muted-foreground mb-3">
              Links go to the official page of the organisation that publishes the material. GhanaPathFinder
              is not affiliated with these providers and earns nothing from these links.
            </p>
            <ul className="space-y-2">
              {skill.resources.map((r) => (
                <li key={r.url + r.title} className="rounded-lg bg-secondary/60 p-3">
                  <a
                    href={r.url}
                    target={r.url.startsWith("http") ? "_blank" : undefined}
                    rel={r.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
                  >
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    {r.title}
                  </a>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.provider} • {r.type} • {r.cost}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {majors.length > 0 && (
            <section className="bg-glass rounded-xl p-4">
              <h2 className="font-display font-semibold text-foreground mb-2 text-sm sm:text-base">
                Career paths that use this skill
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {majors.map((m) => (
                  <Link
                    key={m}
                    to={`/careers/${careerSlug(m)}`}
                    className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {m}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SkillDetail;
