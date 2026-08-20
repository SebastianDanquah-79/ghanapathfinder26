import { Link } from "@/lib/router-compat";
import { Briefcase, Sparkles } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { mockCareerData, careerSlug } from "@/data/careers";
import { careerPathByMajor } from "@/data/careerPaths";
import { useCareerSuggestions } from "@/hooks/useCareerSuggestions";
import { useAuth } from "@/hooks/useAuth";

const careers = Object.values(mockCareerData);

const Careers = () => {
  const { user } = useAuth();
  const { data: suggestions = [] } = useCareerSuggestions();

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Career Paths in Ghana: SHS to Profession, Programmes & Universities | GhanaPathFinder"
        description="Career paths for Ghanaian students: what each career involves, WASSCE subjects, recommended programmes, universities offering them, skills, internships and progression."
        path="/careers"
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Career paths in Ghana",
            url: "https://ghanapathfinder.com/careers",
            isPartOf: { "@id": "https://ghanapathfinder.com/#website" },
          },
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Career paths for Ghanaian students
          </h1>
          <p className="text-sm text-muted-foreground mb-7 max-w-2xl">
            Each path shows the route from SHS to the profession: WASSCE subjects, programmes,
            institutions offering them, skills, projects, internships and progression , plus
            alternative routes, because no single programme is the only way in.
          </p>

          {user && suggestions.length > 0 && (
            <section className="mb-8">
              <h2 className="flex items-center gap-2 font-display font-semibold text-foreground mb-1">
                <Sparkles className="h-4 w-4 text-primary" /> Your possible career paths
              </h2>
              <p className="text-xs text-muted-foreground mb-3">
                Based on your profile, saved items and WASSCE subjects. Suggestions only , not a
                prediction or guarantee of any outcome.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((s) => (
                  <Link
                    key={s.path.major}
                    to={`/careers/${careerSlug(s.path.major)}`}
                    className="bg-glass rounded-xl p-4 card-hover block border border-primary/20"
                  >
                    <h3 className="font-display font-semibold text-foreground mb-1.5">
                      {s.path.career_name}
                    </h3>
                    <p className="text-[11px] font-medium text-primary mb-1">Why this career?</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                      {s.reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((c) => {
              const path = careerPathByMajor(c.major);
              return (
                <Link
                  key={c.major}
                  to={`/careers/${careerSlug(c.major)}`}
                  className="bg-glass rounded-xl p-4 card-hover block"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <h2 className="font-display font-semibold text-foreground">
                      {path?.career_name ?? c.major}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {path?.description ?? c.roles.join(", ")}
                  </p>
                  <p className="text-xs text-primary mt-2">{c.salary}</p>
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

export default Careers;
