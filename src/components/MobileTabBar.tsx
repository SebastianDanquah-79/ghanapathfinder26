import { Link, useLocation } from "@/lib/router-compat";
import { Home, Search, Target, GraduationCap, LayoutDashboard, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/programmes", label: "Programmes", icon: BookOpen },
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
      <ul className="grid grid-cols-6">
        {tabs.map(({ to, label, icon: Icon }) => {
          const target = to === "/dashboard" && !user ? "/auth" : to;
          const active = pathname === to || (to === "/dashboard" && pathname === "/saved");
          return (
            <li key={to}>
              <Link
                to={target}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[60px] px-0.5 text-[10.5px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground active:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`grid place-items-center h-7 w-12 rounded-full transition-colors ${
                    active ? "bg-primary/15" : ""
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
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
