import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { Link } from "@/lib/router-compat";

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
    h: "Your account",
    p: "Keep your login details private. Enter accurate academic information , recommendations depend on it. Do not use the platform to upload unlawful content or to attempt to access other students' data.",
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
      title="Terms of Use , GhanaPathFinder"
      description="The terms that apply when using GhanaPathFinder: guidance-only information, verification responsibility, account rules and platform availability."
      path="/terms"
      jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }])]}
    />
    <Navbar />
    <main className="pt-20 pb-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">Terms of use</h1>
        <div className="space-y-3">
          {points.map((s) => (
            <section key={s.h} className="bg-glass rounded-xl p-4">
              <h2 className="font-display font-semibold text-foreground text-sm mb-1">{s.h}</h2>
              <p className="text-sm text-muted-foreground">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-5">
          These terms work alongside the{" "}
          <Link to="/disclaimer" className="text-primary underline">full disclaimer</Link>.
        </p>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
