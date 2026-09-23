import { useLocation } from "@/lib/router-compat";
import { Home, Briefcase, BookOpen, Globe, Award } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";

const tabs = [
  { to: "/explore", label: "Home", icon: Home },
  { to: "/feed", label: "Feed", icon: BookOpen },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/news", label: "News", icon: Globe },
  { to: "/leaders", label: "Leaders", icon: Award },
];
const hiddenOn=["/auth","/onboarding","/reset-password","/.lovable/oauth/consent"];
export default function MobileTabBar(){const {pathname}=useLocation();const {user}=useAuth();if(hiddenOn.some(p=>pathname.startsWith(p)))return null;return <nav aria-label="Primary" className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] md:hidden"><ul className="grid grid-cols-6">{tabs.map(({to,label,icon:Icon})=>{const active=pathname===to||(to!=="/explore"&&pathname.startsWith(to+"/"));return <li key={to}><a href={to} aria-label={label} aria-current={active?"page":undefined} className={"flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium "+(active?"text-primary":"text-muted-foreground")}><span className={"grid h-7 w-11 place-items-center rounded-full "+(active?"bg-primary/15":"")}><Icon className="h-[18px] w-[18px]"/></span>{label}</a></li>})}<li><a href={user?"/profile":"/auth"} aria-label={user?"Profile":"Sign in"} className={"flex min-h-[58px] flex-col items-center justify-center gap-0.5 text-[10px] font-medium "+(pathname==="/profile"?"text-primary":"text-muted-foreground")}><span className="grid h-7 w-11 place-items-center"><span className="grid h-6 w-6 place-items-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">{user?"Me":"Go"}</span></span>{user?"Profile":"Sign in"}</a></li></ul></nav>}
