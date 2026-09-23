import { Link, useLocation } from "@/lib/router-compat";
import { Home, Play, Briefcase, Newspaper, Landmark } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const tabs = [
  { to: "/explore", label: "Home", icon: Home },
  { to: "/feed", label: "Feed", icon: Play },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/news", label: "News", icon: Newspaper },
  { to: "/leaders", label: "Leaders", icon: Landmark },
];

const hiddenOn = ["/auth", "/onboarding", "/reset-password", "/.lovable/oauth/consent"];

const initialsFrom = (value?: string | null) => {
  const source = (value ?? "").trim();
  if (!source) return "GP";
  const parts = source.replace(/@.*$/, "").split(/[\s._-]+/).filter(Boolean);
  return (parts.slice(0, 2).map(p => p[0]).join("") || source[0]!).toUpperCase();
};

export default function MobileTabBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  if (hiddenOn.some(p => pathname.startsWith(p))) return null;
  const name = (user?.user_metadata?.["full_name"] as string | undefined) ?? user?.email ?? null;
  const profileActive = pathname === "/profile" || pathname === "/dashboard" || pathname === "/saved";

  return <nav aria-label="Primary" className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden">
    <ul className="grid grid-cols-6">
      {tabs.map(({to,label,icon:Icon}) => {
        const active=pathname===to || (to!=="/explore" && pathname.startsWith(to+"/"));
        return <li key={to}><Link to={to} aria-label={label} aria-current={active?"page":undefined} className={"flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium "+(active?"text-primary":"text-muted-foreground")}><span className={"grid h-7 w-11 place-items-center rounded-full "+(active?"bg-primary/15":"")}><Icon className="h-[18px] w-[18px]"/></span>{label}</Link></li>;
      })}
      <li><Link to={user?"/profile":"/auth"} aria-label={user?"Profile":"Sign in"} aria-current={profileActive?"page":undefined} className={"flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium "+(profileActive?"text-primary":"text-muted-foreground")}><span className={"grid h-7 w-11 place-items-center rounded-full "+(profileActive?"bg-primary/15":"")}><Avatar className="h-[22px] w-[22px]"><AvatarFallback className="bg-primary/15 text-primary text-[9px] font-semibold">{initialsFrom(name)}</AvatarFallback></Avatar></span>{user?"Profile":"Sign in"}</Link></li>
    </ul>
  </nav>;
}
