import { Compass } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { ABOUT_PARAGRAPHS, ABOUT_GOAL } from "@/lib/legal";

/** Short "About GhanaPathFinder" block for the homepage, under the disclaimer. */
const AboutSection = () => (
  <section id="about" aria-label="About GhanaPathFinder" className="px-4 pt-3">
    <div className="max-w-7xl mx-auto bg-glass border border-border/60 rounded-xl p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-2">
        <Compass className="h-4 w-4 text-primary" />
        <h2 className="font-display font-semibold text-foreground">About GhanaPathFinder</h2>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {ABOUT_PARAGRAPHS.map((p) => (
          <p key={p.slice(0, 30)} className="text-xs sm:text-sm text-muted-foreground">
            {p}
          </p>
        ))}
      </div>
      <p className="text-xs sm:text-sm text-foreground mt-3">
        <span className="text-primary font-medium">Our goal:</span> {ABOUT_GOAL}
      </p>
      <div className="mt-3 flex flex-wrap gap-3">
        <Link to="/about" className="text-xs font-medium text-primary underline">
          More about GhanaPathFinder
        </Link>
        <Link to="/references" className="text-xs font-medium text-primary underline">
          References &amp; acknowledgements
        </Link>
      </div>
    </div>
  </section>
);

export default AboutSection;
