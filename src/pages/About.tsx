import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { Link } from "@/lib/router-compat";
import { ABOUT_PARAGRAPHS, ABOUT_GOAL, ABOUT_CLOSING } from "@/lib/legal";

const About = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="About GhanaPathFinder , Education & Career Platform for Ghana"
      description="GhanaPathFinder brings university discovery, programmes, careers, scholarships and WASSCE-based recommendations into one platform for students in Ghana."
      path="/about"
      jsonLd={[
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]),
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About GhanaPathFinder",
          url: "https://ghanapathfinder.com/about",
          isPartOf: { "@id": "https://ghanapathfinder.com/#website" },
        },
      ]}
    />
    <Navbar />
    <main className="pt-20 pb-12 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
          About GhanaPathFinder
        </h1>
        <div className="grid gap-3 md:grid-cols-3">
          {ABOUT_PARAGRAPHS.map((p) => (
            <p key={p.slice(0, 30)} className="bg-glass rounded-xl p-4 text-sm text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
        <div className="bg-glass rounded-xl p-4 sm:p-6 mt-4">
          <h2 className="font-display font-semibold text-foreground mb-1.5">Our goal is simple</h2>
          <p className="text-sm text-muted-foreground">{ABOUT_GOAL}</p>
          <p className="text-sm text-muted-foreground mt-3">{ABOUT_CLOSING}</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link to="/disclaimer" className="text-primary underline">Disclaimer</Link>
          <Link to="/references" className="text-primary underline">References &amp; acknowledgements</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
