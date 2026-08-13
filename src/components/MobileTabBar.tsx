import { Link, useLocation } from "react-router-dom";
import { Home, Search, Target, GraduationCap, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/admission-match", label: "Match", icon: Target },
  { to: "/scholarships", label: "Funding", icon: GraduationCap },
  { to: "/dashboard", label: "Me", icon: LayoutDashboard },
];

const hiddenOn = ["/auth", "/onboarding", "/reset-password", "/.lovable/oauth/consent"];

const MobileTabBar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  if (hiddenOn.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/60 pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {tabs.map(({ to, label, icon: Icon }) => {
          const target = to === "/dashboard" && !user ? "/auth" : to;
          const active = pathname === to;
          return (
            <li key={to}>
              <Link
                to={target}
                className={`flex flex-col items-center justify-center gap-1 min-h-[56px] px-1 text-[11px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileTabBar;
