import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { Link } from "@/lib/router-compat";
import { DISCLAIMER_PARAGRAPHS } from "@/lib/legal";

const Disclaimer = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Disclaimer — GhanaPathFinder"
      description="How to use GhanaPathFinder information responsibly: recommendations and estimated cut-off points are guidance only and must be verified with the institution."
      path="/disclaimer"
      jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Disclaimer", path: "/disclaimer" }])]}
    />
    <Navbar />
    <main className="pt-20 pb-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
          GhanaPathFinder disclaimer
        </h1>
        <div className="bg-glass rounded-xl p-4 sm:p-6 space-y-3">
          {DISCLAIMER_PARAGRAPHS.map((p) => (
            <p key={p.slice(0, 30)} className="text-sm text-muted-foreground leading-relaxed">
              {p}
            </p>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3 text-sm">
          <Link to="/about" className="text-primary underline">About GhanaPathFinder</Link>
          <Link to="/references" className="text-primary underline">References &amp; acknowledgements</Link>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Disclaimer;
