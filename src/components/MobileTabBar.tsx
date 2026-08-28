import { Link, useLocation } from "@/lib/router-compat";
import { Home, Users, Building2, Award, Briefcase } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const tabs = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search?kind=university", label: "Study", icon: Building2, match: "/search" },
  { to: "/scholarships", label: "Funding", icon: Award },
  { to: "/careers", label: "Careers", icon: Briefcase },
  { to: "/community", label: "Community", icon: Users },
];

const hiddenOn = ["/auth", "/onboarding", "/reset-password", "/.lovable/oauth/consent"];

const initialsFrom = (value?: string | null) => {
  const source = (value ?? "").trim();
  if (!source) return "GP";
  const parts = source.replace(/@.*$/, "").split(/[\s._-]+/).filter(Boolean);
  return (parts.slice(0, 2).map((p) => p[0]).join("") || source[0]!).toUpperCase();
};

const MobileTabBar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  if (hiddenOn.some((p) => pathname.startsWith(p))) return null;

  const name = (user?.user_metadata?.["full_name"] as string | undefined) ?? user?.email ?? null;
  const profileActive = pathname === "/dashboard" || pathname === "/saved";

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-6">
        {tabs.map(({ to, label, icon: Icon, match }) => {
          const base = match ?? to;
          const active = pathname === base || (base !== "/" && pathname.startsWith(`${base}/`));
          return (
            <li key={to}>
              <Link
                to={to}
                aria-label={label}
                title={label}
                className={`flex flex-col items-center justify-center gap-0.5 min-h-[58px] px-0.5 text-[10px] font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground active:text-foreground"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <span
                  className={`grid place-items-center h-7 w-11 rounded-full transition-colors ${
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
        <li>
          <Link
            to={user ? "/dashboard" : "/auth"}
            aria-label={user ? "Your dashboard" : "Sign in"}
            title={user ? "Dashboard" : "Sign in"}
            aria-current={profileActive ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 min-h-[58px] px-0.5 text-[10px] font-medium transition-colors ${
              profileActive ? "text-primary" : "text-muted-foreground active:text-foreground"
            }`}
          >
            <span
              className={`grid place-items-center h-7 w-11 rounded-full transition-colors ${
                profileActive ? "bg-primary/15" : ""
              }`}
            >
              <Avatar className="h-[22px] w-[22px]">
                <AvatarFallback className="bg-primary/15 text-primary text-[9px] font-semibold">
                  {initialsFrom(name)}
                </AvatarFallback>
              </Avatar>
            </span>
            {user ? "You" : "Sign in"}
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default MobileTabBar;
