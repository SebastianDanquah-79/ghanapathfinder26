import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import { Link } from "@/lib/router-compat";

export const LoadingState = ({ label = "Loading" }: { label?: string }) => (
  <div role="status" aria-live="polite" className="grid gap-3">
    <span className="sr-only">{label}</span>
    {[0, 1, 2].map((i) => (
      <div key={i} className="h-20 rounded-md border border-border bg-muted/40 animate-pulse" />
    ))}
  </div>
);

export const ErrorState = ({ message, onRetry }: { message?: string; onRetry?: () => void }) => (
  <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
    <p className="font-medium text-foreground">This section could not load.</p>
    <p className="text-muted-foreground mt-1">{message ?? "Please check your connection and try again."}</p>
    {onRetry && (
      <button onClick={onRetry} className="mt-3 px-3 min-h-[40px] rounded-md border border-border text-sm font-medium">
        Try again
      </button>
    )}
  </div>
);

export const EmptyState = ({ title, children }: { title: string; children?: ReactNode }) => (
  <div className="rounded-md border border-dashed border-border p-6 text-sm">
    <p className="font-medium text-foreground">{title}</p>
    {children && <div className="text-muted-foreground mt-1 space-y-2">{children}</div>}
  </div>
);

export const SignInPrompt = ({ what }: { what: string }) => (
  <EmptyState title={`Sign in to ${what}`}>
    <p>Your data stays private to your account.</p>
    <Link to="/auth" className="inline-flex items-center px-4 min-h-[40px] rounded-md bg-primary text-primary-foreground font-medium">
      Sign in
    </Link>
  </EmptyState>
);

export const PageShell = ({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="pt-20 pb-16 px-4 sm:px-8 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">{eyebrow}</p>}
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-2xl">{subtitle}</p>
        {children}
      </div>
    </main>
  </div>
);
