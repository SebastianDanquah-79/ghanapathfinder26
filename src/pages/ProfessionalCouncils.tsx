import { ShieldCheck } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import OfficialLink from "@/components/OfficialLink";
import { Link } from "@/lib/router-compat";
import { PROFESSIONAL_BODIES, FUNDING_SOURCES } from "@/data/professionalBodies";
import { UNVERIFIED_NOTE } from "@/lib/legal";

const ProfessionalCouncils = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Professional Councils & Career Regulation | GhanaPathFinder"
      description="Which professional council or regulator oversees careers such as nursing, medicine, teaching and allied health in Ghana, with links to each official body."
      path="/professional-councils"
      jsonLd={[
        breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Professional Councils", path: "/professional-councils" },
        ]),
      ]}
    />
    <Navbar />
    <main className="pt-20 pb-12 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" /> Professional councils &amp; career regulation
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Some programmes and careers in Ghana are regulated by a professional council that sets
          training standards, licensing and registration. Not every programme is regulated by a
          council. Always confirm current requirements with the body itself before applying.
        </p>

        <section className="mt-6" aria-label="Professional councils">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {PROFESSIONAL_BODIES.map((b) => (
              <article key={b.name} className="bg-glass rounded-xl p-4 flex flex-col">
                <h2 className="font-display font-semibold text-sm text-foreground">{b.name}</h2>
                <p className="text-xs text-muted-foreground mt-2">
                  Regulates: {b.regulates.join(", ")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Last verified: {b.lastVerified}</p>
                <div className="mt-3">
                  {b.website ? (
                    <OfficialLink href={b.website} label="Professional Council" />
                  ) : (
                    <p className="text-xs text-muted-foreground">{UNVERIFIED_NOTE}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8" aria-label="Scholarship and funding sources">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3">
            Scholarship &amp; funding sources
          </h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {FUNDING_SOURCES.map((f) => (
              <article key={f.name} className="bg-glass rounded-xl p-4">
                <h3 className="font-display font-semibold text-sm text-foreground">{f.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{f.note}</p>
                <p className="text-xs text-muted-foreground mt-1">Last verified: {f.lastVerified}</p>
                <div className="mt-3">
                  <OfficialLink href={f.website} label="Scholarship Source" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="text-xs text-muted-foreground mt-6">
          GhanaPathFinder is not affiliated with these organisations.{" "}
          <Link to="/references" className="text-primary underline">
            See all references &amp; acknowledgements
          </Link>
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default ProfessionalCouncils;
