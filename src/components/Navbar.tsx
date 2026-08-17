import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, GraduationCap, ChevronDown, Search } from "lucide-react";
import { Link, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";

const primary = [
  { label: "Home", href: "/" },
  { label: "Programmes", href: "/programmes" },
  { label: "Match", href: "/admission-match" },
  { label: "Funding", href: "/scholarships" },
  { label: "Profile", href: "/dashboard" },
];

const more = [
  { label: "Universities", href: "/#universities" },
  { label: "Saved items", href: "/saved" },
  { label: "Compare", href: "/compare" },
  { label: "Scholarship matcher", href: "/matcher" },
  { label: "Applications", href: "/applications" },
  { label: "Careers", href: "/careers" },
  { label: "Inspiration", href: "/inspiration" },
  { label: "Parents", href: "/parent" },
  { label: "About", href: "/about" },
  { label: "References", href: "/references" },
  { label: "Terms & Conditions", href: "/terms" },
];

const linkClass =
  "px-3 py-1.5 text-sm text-muted-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary whitespace-nowrap";

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg sm:text-xl text-foreground">
            Ghana<span className="text-primary">PathFinder</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
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
                  className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-lg p-1.5"
                >
                  {more.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      className="block px-3 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary rounded-lg"
                    >
                      {l.label}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/search"
            aria-label="Search GhanaPathFinder"
            title="Search"
            className="ml-1 grid place-items-center h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          <ThemeToggle className="h-9 w-9" />


          <Link
            to={user ? "/dashboard" : "/auth"}
            className="ml-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
        </div>

        <div className="md:hidden flex min-w-0 items-center gap-1">
          <Link
            to="/search"
            aria-label="Search GhanaPathFinder"
            className="grid place-items-center h-11 w-11 rounded-full text-muted-foreground active:text-primary"
          >
            <Search className="h-5 w-5" />
          </Link>
          <ThemeToggle className="h-11 w-11" />
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="inline-flex items-center whitespace-nowrap px-3 min-h-[40px] text-xs font-medium rounded-lg bg-primary text-primary-foreground"
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
            <div className="px-4 py-3 grid grid-cols-2 gap-2">
              {[...primary, ...more].map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-3 text-sm text-foreground hover:text-primary transition-colors rounded-lg border border-border bg-secondary/50"
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
