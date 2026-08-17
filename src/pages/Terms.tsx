import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { Link } from "@/lib/router-compat";
import { SHORT_DISCLAIMER, DISCLAIMER_PARAGRAPHS, REFERENCES_PARAGRAPHS } from "@/lib/legal";

const points: { h: string; p: string }[] = [
  {
    h: "Guidance, not advice",
    p: "GhanaPathFinder provides general educational guidance. Recommendations, match confidence and estimated cut-off points are not admission decisions and are not professional or financial advice.",
  },
  {
    h: "Verify before you act",
    p: "You are responsible for verifying admission requirements, deadlines, fees and application procedures with the relevant institution, provider or official government source before applying or paying anything.",
  },
  {
    h: "Estimated information",
    p: "Where an official cut-off point or requirement is not published, GhanaPathFinder may show an estimate. Estimates are labelled as such and must never be treated as official institutional data.",
  },
  {
    h: "Your account",
    p: "Keep your login details private. Enter accurate academic information, because recommendations depend on it. Do not use the platform to upload unlawful content or to attempt to access other students' data.",
  },
  {
    h: "How your data is used",
    p: "Your profile, WASSCE information, saved universities, saved programmes, saved scholarships, applications and acceptance of these terms are stored securely in the GhanaPathFinder cloud database so your account works across devices. Data is used to generate your recommendations and is never sold.",
  },
  {
    h: "Availability and changes",
    p: "The platform, its database and its features are under continuous development and may change or be unavailable at times. Content may be corrected or removed as better official sources become available.",
  },
  {
    h: "No affiliation",
    p: "GhanaPathFinder is independent and is not affiliated with, endorsed by, or representing any university, government institution or scholarship provider unless explicitly stated.",
  },
];

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Terms & Conditions | GhanaPathFinder"
      description="The terms that apply when using GhanaPathFinder: guidance-only information, verification responsibility, data use, account rules and platform availability."
      path="/terms"
      jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }])]}
    />
    <Navbar />
    <main className="pt-20 pb-16 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <header className="space-y-2">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            Terms &amp; Conditions
          </h1>
          <p className="text-sm text-muted-foreground">
            Please read these terms before creating an account or signing in.
          </p>
        </header>

        <section aria-label="Disclaimer" className="bg-glass rounded-2xl p-5">
          <h2 className="font-display font-semibold text-foreground mb-3">Disclaimer</h2>
          <div className="space-y-1.5">
            {SHORT_DISCLAIMER.map((line) => (
              <p key={line.slice(0, 24)} className="text-sm text-muted-foreground leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </section>

        <section aria-label="Terms of use" className="space-y-3">
          <h2 className="font-display font-semibold text-foreground">Terms of use</h2>
          {points.map((s) => (
            <article key={s.h} className="bg-glass rounded-2xl p-4">
              <h3 className="font-display font-semibold text-foreground text-sm mb-1">{s.h}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.p}</p>
            </article>
          ))}
        </section>

        <section aria-label="Accuracy and acknowledgements" className="space-y-3">
          <h2 className="font-display font-semibold text-foreground">
            Accuracy, sources and acknowledgements
          </h2>
          <div className="bg-glass rounded-2xl p-4 space-y-2.5">
            {DISCLAIMER_PARAGRAPHS.map((p) => (
              <p key={p.slice(0, 30)} className="text-sm text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
            {REFERENCES_PARAGRAPHS.map((p) => (
              <p key={p.slice(0, 30)} className="text-sm text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>
        </section>

        <p className="text-sm text-muted-foreground">
          See also the{" "}
          <Link to="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>{" "}
          and the full{" "}
          <Link to="/references" className="text-primary underline">
            references and acknowledgements
          </Link>
          .
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
