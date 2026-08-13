import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const primary = [
  { label: "Search", href: "/search" },
  { label: "Universities", href: "/#universities" },
  { label: "Scholarships", href: "/#scholarships" },
  { label: "Saved", href: "/saved" },
  { label: "Compare", href: "/compare" },
  { label: "Inspiration", href: "/inspiration" },
];


const more = [
  { label: "Recommender", href: "/#recommender" },
  { label: "Admission match", href: "/admission-match" },
  { label: "Scholarship matcher", href: "/matcher" },
  { label: "My scholarships", href: "/scholarships" },
  { label: "Applications", href: "/applications" },
  { label: "Parents", href: "/parent" },
  { label: "Careers", href: "/#careers" },
  { label: "City guide", href: "/#cityguide" },
];

const linkClass =
  "px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary/50 whitespace-nowrap";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
    setMoreOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <GraduationCap className="h-7 w-7 text-primary" />
          <span className="font-display font-bold text-lg sm:text-xl text-foreground">
            Ghana<span className="text-primary">Path</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {primary.map((l) => (
            <a key={l.href} href={l.href} className={linkClass}>
              {l.label}
            </a>
          ))}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((v) => !v)}
              className={`${linkClass} inline-flex items-center gap-1`}
              aria-expanded={moreOpen}
              aria-haspopup="true"
            >
              More <ChevronDown className={`h-3.5 w-3.5 transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl p-1.5"
                >
                  {more.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/60 rounded-lg"
                    >
                      {l.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to={user ? "/dashboard" : "/auth"}
            className="ml-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {user ? "My dashboard" : "Sign in"}
          </Link>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="px-3 py-2 text-xs font-medium rounded-lg bg-primary text-primary-foreground"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="p-2.5 -mr-1 text-muted-foreground hover:text-primary transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
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
            className="md:hidden overflow-hidden bg-card border-b border-border max-h-[70vh] overflow-y-auto"
          >
            <div className="px-4 py-3 grid grid-cols-2 gap-1">
              {[...primary, ...more].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-3 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md bg-secondary/30"
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
