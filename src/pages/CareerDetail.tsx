import { Link, useParams } from "@/lib/router-compat";
import { ArrowLeft, Briefcase, Building, DollarSign, Globe, GraduationCap, Loader2 } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import SaveButton from "@/components/SaveButton";
import CareerPathway, { type PathwayStep } from "@/components/CareerPathway";
import { careerBySlug, careerSlug } from "@/data/careers";
import { careerPathByMajor } from "@/data/careerPaths";
import { useCareerProgrammes } from "@/hooks/useCareerProgrammes";

const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((i) => (
      <span key={i} className="rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
        {i}
      </span>
    ))}
  </div>
);

const Section = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="bg-glass rounded-xl p-4 mb-3">
    <h2 className="flex items-center gap-2 font-display font-semibold text-foreground mb-2 text-sm sm:text-base">
      {icon}
      {title}
    </h2>
    {children}
  </section>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
);

const CareerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const career = careerBySlug(slug ?? "");
  const path = careerPathByMajor(career?.major ?? "");

  const keywords = path
    ? [...path.recommended_programmes, ...path.alternative_programmes].slice(0, 12)
    : [];
  const { data: programmes = [], isLoading } = useCareerProgrammes(keywords);

  if (!career) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 text-center">
          <h1 className="font-display text-xl font-semibold text-foreground mb-2">Career not found</h1>
          <Link to="/careers" className="text-sm text-primary">
            Browse all career paths
          </Link>
        </main>
      </div>
    );
  }

  const routePath = `/careers/${careerSlug(career.major)}`;
  const description =
    path?.description ??
    `${career.major} careers in Ghana: typical roles (${career.roles
      .slice(0, 3)
      .join(", ")}), employers hiring locally and reported salary range ${career.salary}.`;

  const universities = Array.from(
    new Map(
      programmes
        .filter((p) => p.universities)
        .map((p) => [p.universities!.id, p.universities!]),
    ).values(),
  );

  const steps: PathwayStep[] = path
    ? [
        { label: "SHS", detail: "Build a strong WASSCE profile in the subjects below." },
        {
          label: "WASSCE subjects",
          detail: path.relevant_subjects.join(", "),
          to: "/admission-match",
        },
        {
          label: "Programme",
          detail: path.recommended_programmes.slice(0, 3).join(", ") + " and related programmes",
          to: "/programmes",
        },
        {
          label: "University / institution",
          detail: "Accredited Ghanaian institutions offering these programmes.",
          to: "/search?kind=university",
        },
        {
          label: "Skills",
          detail: path.skills.technical.slice(0, 4).join(", "),
        },
        { label: "Projects", detail: path.projects[0] ?? "Build a public portfolio of work." },
        { label: "Internship", detail: path.internships[0] ?? "Industrial attachment or national service." },
        { label: "Entry-level role", detail: path.entry_level_roles.slice(0, 3).join(", ") },
        { label: "Professional career", detail: path.career_name },
        {
          label: "Specialisation",
          detail: path.career_progression[path.career_progression.length - 1] ?? "Senior specialisation",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${career.major} Career Path in Ghana , Programmes, Universities & Salary | GhanaPathFinder`}
        description={description.slice(0, 155)}
        path={routePath}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
            { name: career.major, path: routePath },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${career.major} career path in Ghana`,
            description,
            about: career.major,
            publisher: { "@id": "https://ghanapathfinder.com/#organization" },
            mainEntityOfPage: `https://ghanapathfinder.com${routePath}`,
          },
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5"
          >
            <ArrowLeft className="h-4 w-4" /> All careers
          </Link>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {path?.career_name ?? career.major} , career path in Ghana
          </h1>
          <p className="text-sm text-muted-foreground mb-3 max-w-3xl">{description}</p>

          <div className="flex flex-wrap gap-2 mb-6">
            <SaveButton
              item={{
                item_type: "career",
                item_key: careerSlug(career.major),
                title: `${career.major} career path`,
                subtitle: career.salary,
                metadata: { roles: career.roles },
              }}
            />
            <Link
              to="/admission-match"
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
            >
              Check my admission match
            </Link>
            <Link
              to="/scholarships"
              className="px-3 py-2 rounded-lg bg-secondary text-muted-foreground text-xs font-medium"
            >
              Scholarships
            </Link>
          </div>

          {path && (
            <>
              <h2 className="font-display font-semibold text-foreground mb-3">
                Possible pathway , SHS to professional
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                This is one legitimate route, not the only one. See “Alternative routes” below.
              </p>
              <div className="mb-6">
                <CareerPathway steps={steps} />
              </div>

              <Section title="What this career involves" icon={<Briefcase className="h-4 w-4 text-primary" />}>
                <Bullets items={path.what_they_do} />
              </Section>

              <div className="grid gap-3 md:grid-cols-2">
                <Section title="Recommended SHS background" icon={<GraduationCap className="h-4 w-4 text-primary" />}>
                  <Chips items={path.relevant_subjects} />
                </Section>
                <Section title="Relevant university programmes">
                  <Chips items={path.recommended_programmes} />
                  <p className="mt-3 mb-1.5 text-xs font-medium text-foreground">Alternative programmes</p>
                  <Chips items={path.alternative_programmes} />
                </Section>
                <Section title="Technical skills">
                  <Chips items={path.skills.technical} />
                </Section>
                <Section title="Soft skills">
                  <Chips items={path.skills.soft} />
                </Section>
                <Section title="Recommended certifications">
                  <Bullets items={path.certifications} />
                </Section>
                <Section title="Projects you can build">
                  <Bullets items={path.projects} />
                </Section>
                <Section title="Internship opportunities">
                  <Bullets items={path.internships} />
                </Section>
                <Section title="Entry-level roles">
                  <Chips items={path.entry_level_roles} />
                </Section>
                <Section title="Industries" icon={<Building className="h-4 w-4 text-primary" />}>
                  <Chips items={path.industries} />
                </Section>
                <Section title="Career progression">
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-4">
                    {path.career_progression.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                </Section>
                <Section title="Alternative routes">
                  <Bullets items={path.alternative_routes} />
                </Section>
                <Section title="Further education">
                  <Bullets items={path.further_education} />
                </Section>
              </div>

              <SkillsMap major={career.major} />

            </>
          )}

          {/* Career → programme → university connection */}
          <Section title="Verified programmes for this career" icon={<GraduationCap className="h-4 w-4 text-primary" />}>
            {isLoading ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading verified programmes…
              </p>
            ) : programmes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Not verified yet , we have no verified programme records matching this career.{" "}
                <Link to="/programmes" className="text-primary">
                  Browse the full programme directory
                </Link>
                .
              </p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {programmes.map((p) => (
                  <li key={p.id} className="rounded-lg bg-secondary/60 p-3">
                    <Link to={`/programmes/${p.slug}`} className="font-medium text-sm text-foreground hover:text-primary">
                      {p.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {p.universities?.short_name ?? p.universities?.name}
                      {p.universities?.location ? ` , ${p.universities.location}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          {universities.length > 0 && (
            <Section title="Institutions offering these programmes" icon={<Building className="h-4 w-4 text-primary" />}>
              <div className="flex flex-wrap gap-2">
                {universities.map((u) => (
                  <Link
                    key={u.id}
                    to={`/university/${u.slug}`}
                    className="rounded-lg bg-secondary px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    {u.short_name ?? u.name}
                  </Link>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Open a profile to see admission requirements, student insights and application links.
              </p>
            </Section>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <Section title="Common roles" icon={<Briefcase className="h-4 w-4 text-primary" />}>
              <Chips items={career.roles} />
            </Section>
            <Section title="Employers hiring in Ghana" icon={<Building className="h-4 w-4 text-primary" />}>
              <Chips items={career.companies} />
            </Section>
            <Section title="Reported salary range" icon={<DollarSign className="h-4 w-4 text-primary" />}>
              <p className="text-sm text-muted-foreground">{career.salary}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Ranges are indicative market reports, not guaranteed pay.
              </p>
            </Section>
            <Section title="Remote & international potential" icon={<Globe className="h-4 w-4 text-primary" />}>
              <p className="text-sm text-muted-foreground mb-2">{career.remote}</p>
              <p className="text-sm text-muted-foreground">{career.linkedinTip}</p>
            </Section>
          </div>

          {path && (
            <div className="grid gap-3 md:grid-cols-2">
              <Section title="Related careers">
                <div className="flex flex-wrap gap-2">
                  {path.related_careers.map((r) => (
                    <Link
                      key={r}
                      to={`/careers/${careerSlug(r)}`}
                      className="rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {r}
                    </Link>
                  ))}
                </div>
              </Section>
              <Section title="Sources">
                <ul className="text-sm text-muted-foreground space-y-1">
                  {path.sources.map((s) => (
                    <li key={s.url}>
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-primary">
                        {s.name}
                      </a>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-muted-foreground">Last updated {path.last_updated}</p>
              </Section>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            <Link
              to={`/search?q=${encodeURIComponent(career.major)}`}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Find matching programmes
            </Link>
            <Link
              to="/applications"
              className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium"
            >
              Add to My Path
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CareerDetail;
