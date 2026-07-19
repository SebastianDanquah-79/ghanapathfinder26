import { GraduationCap, Heart } from "lucide-react";

const Footer = () => (
  <footer className="py-12 px-4 border-t border-border/50">
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
      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
        Built with <Heart className="h-3 w-3 text-ghana-red" /> for Ghana's next generation
      </p>
      <p className="text-xs text-muted-foreground mt-2">© 2026 GhanaPath. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
