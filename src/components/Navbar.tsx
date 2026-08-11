import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { label: "Recommender", href: "#recommender" },
  { label: "Universities", href: "#universities" },
  { label: "Scholarships", href: "#scholarships" },
  { label: "Matcher", href: "/matcher" },
  { label: "My Scholarships", href: "/scholarships" },
  { label: "Compare", href: "/compare" },
  { label: "Careers", href: "#careers" },
  { label: "City Guide", href: "#cityguide" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2 group">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-display font-bold text-xl text-foreground">
            Ghana<span className="text-primary">Path</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary/50"
            >
              {l.label}
            </a>
          ))}
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="ml-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {user ? "My dashboard" : "Sign in"}
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>


      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-card border-b border-border"
          >
            <div className="px-4 py-3 space-y-1">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
