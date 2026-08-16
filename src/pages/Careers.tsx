import { Link } from "@/lib/router-compat";
import { Briefcase } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { mockCareerData, careerSlug } from "@/data/careers";

const careers = Object.values(mockCareerData);

const Careers = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Career Paths in Ghana — Roles, Employers & Salaries | GhanaPathFinder"
      description="Explore career paths open to Ghanaian graduates: typical roles, employers hiring in Ghana, salary ranges and remote-work potential for each field of study."
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
      <div className="max-w-5xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Career paths for Ghanaian graduates
        </h1>
        <p className="text-sm text-muted-foreground mb-7 max-w-2xl">
          Each guide lists the roles graduates take on, employers that hire in Ghana, salary ranges
          reported for the field and how much of the work can be done remotely.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {careers.map((c) => (
            <Link
              key={c.major}
              to={`/careers/${careerSlug(c.major)}`}
              className="bg-glass rounded-xl p-4 card-hover block"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <Briefcase className="h-4 w-4 text-primary" />
                <h2 className="font-display font-semibold text-foreground">{c.major}</h2>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{c.roles.join(", ")}</p>
              <p className="text-xs text-primary mt-2">{c.salary}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Careers;
