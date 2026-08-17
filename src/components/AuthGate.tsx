import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

// Routes that stay reachable without an account.
const PUBLIC_PREFIXES = [
  "/auth",
  "/reset-password",
  "/terms",
  "/privacy",
  "/disclaimer",
  "/functions",
  "/.lovable",
];

export const isPublicPath = (pathname: string) =>
  PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.searchStr });
  const allowed = isPublicPath(pathname);

  useEffect(() => {
    if (loading || allowed || user) return;
    const next = encodeURIComponent(`${pathname}${search ?? ""}`);
    navigate({ to: "/auth", search: { next } as never, replace: true });
  }, [loading, allowed, user, pathname, search, navigate]);

  if (allowed || user) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
      <span className="sr-only">Loading</span>
    </div>
  );
};

export default AuthGate;
