import { Link, useParams } from "@/lib/router-compat";
import { ArrowLeft, Award, CalendarClock, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { scholarshipBySlug, scholarshipSlug } from "@/data/scholarships";

const ScholarshipDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const s = scholarshipBySlug(slug ?? "");

  if (!s) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 px-4 text-center">
          <h1 className="font-display text-xl font-semibold text-foreground mb-2">
            Scholarship not found
          </h1>
          <Link to="/scholarships" className="text-sm text-primary">
            Browse all scholarships
          </Link>
        </main>
      </div>
    );
  }

  const path = `/scholarships/${scholarshipSlug(s.name)}`;
  const description = `${s.name} from ${s.provider}: ${s.coverage} for ${s.level}. Eligibility, deadline and how to apply.`;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title={`${s.name} , Eligibility & How to Apply | GhanaPathFinder`}
        description={description.slice(0, 155)}
        path={path}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Scholarships", path: "/scholarships" },
            { name: s.name, path },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "EducationalOccupationalProgram",
            name: s.name,
            provider: { "@type": "Organization", name: s.provider },
            description,
            educationalProgramMode: s.level,
            url: `https://ghanapathfinder.com${path}`,
          },
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            to="/scholarships"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> All scholarships
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <Award className="h-5 w-5 text-primary" />
            <span className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
              {s.type}
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {s.name}
          </h1>
          <p className="text-sm text-muted-foreground mb-7">Offered by {s.provider}</p>

          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <div className="bg-glass rounded-xl p-4">
              <h2 className="font-display font-semibold text-foreground mb-1">Coverage</h2>
              <p className="text-sm text-muted-foreground">{s.coverage}</p>
            </div>
            <div className="bg-glass rounded-xl p-4">
              <h2 className="font-display font-semibold text-foreground mb-1">Study level</h2>
              <p className="text-sm text-muted-foreground">{s.level}</p>
            </div>
          </div>

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="font-display font-semibold text-foreground mb-1">Who can apply</h2>
            <p className="text-sm text-muted-foreground">{s.eligibility}</p>
          </section>

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="flex items-center gap-2 font-display font-semibold text-foreground mb-1">
              <CalendarClock className="h-4 w-4 text-primary" /> Deadline
            </h2>
            <p className="text-sm text-muted-foreground">{s.deadline}</p>
          </section>

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="font-display font-semibold text-foreground mb-1">How to apply</h2>
            <p className="text-sm text-muted-foreground">{s.howToApply}</p>
          </section>

          {s.link && (
            <a
              href={s.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
            >
              Official page <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ScholarshipDetail;
