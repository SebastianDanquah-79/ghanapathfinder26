import SiteRating from "@/components/SiteRating";
import BrandMark from "@/components/BrandMark";
import { Link } from "@/lib/router-compat";

const links = [
  { label: "About GhanaPathFinder", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Skills Hub", to: "/skills" },
  { label: "Disclaimer", to: "/disclaimer" },
  { label: "References & Acknowledgements", to: "/references" },
  { label: "Credits & Sources", to: "/credits" },
  { label: "Professional Councils", to: "/professional-councils" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms & Conditions", to: "/terms" },
  { label: "Contact", to: "/contact" },
];

const Footer = () => (
  <footer className="py-8 px-4 border-t border-border/50">
    <div className="max-w-7xl mx-auto text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <BrandMark className="h-7 w-7" />
        <span className="font-display font-bold text-lg text-foreground">
          Ghana<span className="text-primary">PathFinder</span>
        </span>
      </div>

      <p className="text-sm text-muted-foreground mb-2">
        An Africa-first education, career and opportunity platform, with Ghana as the starting point.
      </p>

      <nav aria-label="Footer" className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm">
        {links.map((l) => (
          <Link
            key={l.label}
            to={l.to}
            className="text-muted-foreground hover:text-primary transition-colors py-1.5"
          >
            {l.label}
          </Link>
        ))}
      </nav>

      <p className="text-xs text-muted-foreground mt-4 max-w-3xl mx-auto">
        Information on GhanaPathFinder is guidance only. Match confidence, estimated cut-off points,
        fees and other estimates are not guarantees or official institutional decisions. Always verify
        important information with the relevant institution or opportunity provider.
      </p>

      <SiteRating />
      <p className="text-xs text-muted-foreground mt-3">© 2026 GhanaPathFinder. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
