import SiteRating from "@/components/SiteRating";
import { BrandLogoIcon } from "@/lib/icons";
import { Link } from "@/lib/router-compat";

const links = [
  { label: "About GhanaPathFinder", to: "/about" },
  { label: "Skills Hub", to: "/skills" },
  { label: "Disclaimer", to: "/disclaimer" },
  { label: "References & Acknowledgements", to: "/references" },
  { label: "Credits & Sources", to: "/credits" },
  { label: "Professional Councils", to: "/professional-councils" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Terms of Use", to: "/terms" },
  { label: "Contact", to: "/contact" },
];


const Footer = () => (
  <footer className="py-8 px-4 border-t border-border/50">
    <div className="max-w-7xl mx-auto text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <BrandLogoIcon className="h-6 w-6 text-primary" />
        <span className="font-display font-bold text-lg text-foreground">
          Ghana<span className="text-primary">PathFinder</span>
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        AI-powered college and career guidance for Ghanaian SHS students 🇬🇭
      </p>

      <nav
        aria-label="Footer"
        className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-sm"
      >
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

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm">
        <p className="text-foreground">
          <span className="text-primary font-medium">Twi:</span> Yɛda wo ase sɛ wode GhanaPathFinder adi dwuma
        </p>
        <p className="text-foreground">
          <span className="text-primary font-medium">Ewe:</span> Akpe na wò be nèzã GhanaPathFinder
        </p>
        <p className="text-foreground">
          <span className="text-primary font-medium">Ga:</span> Oyiwaladɔŋŋ akɛ okɛ GhanaPathFinder tsu nii
        </p>
      </div>

      <p className="text-xs text-muted-foreground mt-4 max-w-3xl mx-auto">
        Information on GhanaPathFinder is guidance only. Match confidence and estimated cut-off points
        are not guarantees of admission , always verify with the institution.
      </p>
      <SiteRating />
      <p className="text-xs text-muted-foreground mt-3">© 2026 GhanaPathFinder. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
