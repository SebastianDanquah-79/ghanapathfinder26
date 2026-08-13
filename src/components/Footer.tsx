import { GraduationCap } from "lucide-react";

const Footer = () => (
  <footer className="py-8 px-4 border-t border-border/50">
    <div className="max-w-7xl mx-auto text-center">
      <div className="flex items-center justify-center gap-2 mb-4">
        <GraduationCap className="h-6 w-6 text-primary" />
        <span className="font-display font-bold text-lg text-foreground">
          Ghana<span className="text-primary">Path</span>
        </span>
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        AI-powered college and career guidance for Ghanaian SHS students 🇬🇭
      </p>
      <p className="text-xs text-muted-foreground mt-3">© 2026 GhanaPath. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
