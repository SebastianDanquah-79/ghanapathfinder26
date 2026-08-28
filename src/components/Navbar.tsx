import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, BrandLogoIcon, LayoutDashboard, LogOut, Info } from "@/lib/icons";
import { Link, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import { navSections, accountItems, aboutItems } from "@/lib/nav-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const iconButton =
  "grid place-items-center h-10 w-10 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors data-[state=open]:text-primary data-[state=open]:bg-secondary";

const initialsFrom = (value?: string | null) => {
  const source = (value ?? "").trim();
  if (!source) return "GP";
  const parts = source.replace(/@.*$/, "").split(/[\s._-]+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join("") || source[0]!).toUpperCase();
};

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const name =
    (user?.user_metadata?.["full_name"] as string | undefined) ?? user?.email ?? null;
  const initials = initialsFrom(name);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 gap-3">
        <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="GhanaPathFinder home">
          <BrandLogoIcon className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg sm:text-xl text-foreground">
            Ghana<span className="text-primary">PathFinder</span>
          </span>
        </Link>

        {/* Desktop: symbol-first sections */}
        <TooltipProvider delayDuration={120}>
          <div className="hidden md:flex items-center gap-1">
            {navSections.map(({ id, label, icon: Icon, items }) => (
              <DropdownMenu key={id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger className={iconButton} aria-label={label}>
                      <Icon className="h-[18px] w-[18px]" />
                      <span className="sr-only">{label}</span>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>{label}</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>{label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {items.map((i) => (
                    <DropdownMenuItem key={i.href} asChild>
                      <a href={i.href} className="flex flex-col items-start gap-0.5 cursor-pointer">
                        <span className="text-sm font-medium text-foreground">{i.label}</span>
                        {i.desc && (
                          <span className="text-xs text-muted-foreground leading-snug">{i.desc}</span>
                        )}
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            <span className="mx-1 h-5 w-px bg-border" aria-hidden="true" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/search" aria-label="Search" className={iconButton}>
                  <Search className="h-[18px] w-[18px]" />
                </Link>
              </TooltipTrigger>
              <TooltipContent>Search</TooltipContent>
            </Tooltip>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger className={iconButton} aria-label="About GhanaPathFinder">
                    <Info className="h-[18px] w-[18px]" />
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>About</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>About</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {aboutItems.map((i) => (
                  <DropdownMenuItem key={i.href} asChild>
                    <a href={i.href} className="cursor-pointer">{i.label}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ThemeToggle className="h-10 w-10" />

            {user ? (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger
                      className="ml-1 rounded-full ring-2 ring-transparent hover:ring-primary/40 data-[state=open]:ring-primary/60 transition"
                      aria-label="Your account and dashboard"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Dashboard & account</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">{name ?? "Your account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {accountItems.map((i) => (
                    <DropdownMenuItem key={i.href} asChild>
                      <a href={i.href} className="cursor-pointer">{i.label}</a>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => void signOut()} className="cursor-pointer">
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/auth"
                className="ml-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Sign in
              </Link>
            )}
          </div>
        </TooltipProvider>

        {/* Mobile */}
        <div className="md:hidden flex min-w-0 items-center gap-1">
          <Link
            to="/search"
            aria-label="Search GhanaPathFinder"
            className="grid place-items-center h-11 w-11 rounded-full text-muted-foreground active:text-primary"
          >
            <Search className="h-5 w-5" />
          </Link>
          <ThemeToggle className="h-11 w-11" />
          {user ? (
            <Link to="/dashboard" aria-label="Your dashboard" className="grid place-items-center h-11 w-11">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/15 text-primary text-[11px] font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <Link
              to="/auth"
              aria-label="Sign in"
              className="grid place-items-center h-11 w-11 rounded-full bg-primary text-primary-foreground"
            >
              <LayoutDashboard className="h-[18px] w-[18px]" />
            </Link>
          )}
          <button
            onClick={() => setOpen(!open)}
            className="grid place-items-center h-11 w-11 rounded-full text-foreground hover:text-primary active:text-primary transition-colors"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-card border-b border-border max-h-[75vh] overflow-y-auto"
          >
            <div className="px-4 py-3 space-y-4">
              {navSections.map(({ id, label, icon: Icon, items }) => (
                <div key={id}>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Icon className="h-4 w-4" /> {label}
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {items.map((i) => (
                      <a
                        key={i.href}
                        href={i.href}
                        onClick={() => setOpen(false)}
                        className="block px-3 py-2.5 text-sm text-foreground rounded-lg border border-border bg-secondary/50 active:text-primary"
                      >
                        {i.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Info className="h-4 w-4" /> About
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[...(user ? accountItems : []), ...aboutItems].map((i) => (
                    <a
                      key={i.href}
                      href={i.href}
                      onClick={() => setOpen(false)}
                      className="block px-3 py-2.5 text-sm text-foreground rounded-lg border border-border bg-secondary/50 active:text-primary"
                    >
                      {i.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
