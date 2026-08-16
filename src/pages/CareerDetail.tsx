import { Link, useParams } from "@/lib/router-compat";
import { ArrowLeft, Briefcase, Building, DollarSign, Globe } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { careerBySlug, careerSlug } from "@/data/careers";

const CareerDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const career = careerBySlug(slug ?? "");

  if (!career) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 text-center">
          <h1 className="font-display text-xl font-semibold text-foreground mb-2">
            Career not found
          </h1>
          <Link to="/careers" className="text-sm text-primary">
            Browse all career paths
          </Link>
        </main>
      </div>
    );
  }

  const path = `/careers/${careerSlug(career.major)}`;
  const description = `${career.major} careers in Ghana: typical roles (${career.roles
    .slice(0, 3)
    .join(", ")}), employers hiring locally and reported salary range ${career.salary}.`;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${career.major} Careers in Ghana — Roles, Employers & Salary | GhanaPathFinder`}
        description={description.slice(0, 155)}
        path={path}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Careers", path: "/careers" },
            { name: career.major, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `${career.major} careers in Ghana`,
            description,
            about: career.major,
            publisher: { "@id": "https://ghanapathfinder.com/#organization" },
            mainEntityOfPage: `https://ghanapathfinder.com${path}`,
          },
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> All careers
          </Link>

          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            {career.major} careers in Ghana
          </h1>
          <p className="text-sm text-muted-foreground mb-7">{description}</p>

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="flex items-center gap-2 font-display font-semibold text-foreground mb-2">
              <Briefcase className="h-4 w-4 text-primary" /> Common roles
            </h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              {career.roles.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="flex items-center gap-2 font-display font-semibold text-foreground mb-2">
              <Building className="h-4 w-4 text-primary" /> Employers hiring in Ghana
            </h2>
            <ul className="text-sm text-muted-foreground space-y-1">
              {career.companies.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="flex items-center gap-2 font-display font-semibold text-foreground mb-2">
              <DollarSign className="h-4 w-4 text-primary" /> Salary range
            </h2>
            <p className="text-sm text-muted-foreground">{career.salary}</p>
          </section>

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="flex items-center gap-2 font-display font-semibold text-foreground mb-2">
              <Globe className="h-4 w-4 text-primary" /> Remote & international potential
            </h2>
            <p className="text-sm text-muted-foreground mb-2">{career.remote}</p>
            <p className="text-sm text-muted-foreground">{career.linkedinTip}</p>
          </section>

          <div className="flex flex-wrap gap-2">
            <Link
              to={`/search?q=${encodeURIComponent(career.major)}`}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Find matching programmes
            </Link>
            <Link
              to="/scholarships"
              className="px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium"
            >
              Browse scholarships
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CareerDetail;
