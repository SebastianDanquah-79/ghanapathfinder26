import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import MobileTabBar from "@/components/MobileTabBar";
import OfflineBanner from "@/components/OfflineBanner";
import NotFound from "@/pages/NotFound";
import { usePageViews } from "@/hooks/useTracking";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import appCss from "../styles.css?url";

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AnalyticsTracker() {
  usePageViews();
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <AnalyticsTracker />
            <OfflineBanner />
            <div className="desktop-shell pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
              <Outlet />
            </div>
            <MobileTabBar />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-xl font-semibold">This page didn't load</h1>
        <p className="text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
            onClick={() => {
              void router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a
            className="px-4 py-2 rounded-md border border-border text-sm font-medium"
            href="/"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0, viewport-fit=cover" },
      { title: "GhanaPathFinder — Ghana Universities & Scholarships Guide" },
      {
        name: "description",
        content:
          "GhanaPathFinder is an education and career platform helping Ghanaian students discover universities, programmes, scholarships, career paths and opportunities.",
      },
      { name: "google-site-verification", content: "AX0O529bwE2xFh92n_bKT9tdS7ax1ulGLgrKzrm1kLE" },
      { name: "author", content: "GhanaPathFinder" },
      { name: "theme-color", content: "#0a0f1c" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "GhanaPathFinder" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "GhanaPathFinder" },
      { property: "og:title", content: "GhanaPathFinder — Ghana Universities & Scholarships Guide" },
      {
        property: "og:description",
        content:
          "GhanaPathFinder is an education and career platform helping Ghanaian students discover universities, programmes, scholarships, career paths and opportunities.",
      },
      { property: "og:url", content: "https://ghanapathfinder.com" },
      { property: "og:image", content: "https://ghanapathfinder.com/app-icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "GhanaPathFinder — Ghana Universities & Scholarships Guide" },
      {
        name: "twitter:description",
        content:
          "GhanaPathFinder is an education and career platform helping Ghanaian students discover universities, programmes, scholarships, career paths and opportunities.",
      },
      { name: "twitter:image", content: "https://ghanapathfinder.com/app-icon-512.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "@id": "https://ghanapathfinder.com/#organization",
          name: "GhanaPathFinder",
          alternateName: ["Ghana Path Finder", "GhanaPath Finder"],
          url: "https://ghanapathfinder.com",
          logo: {
            "@type": "ImageObject",
            url: "https://ghanapathfinder.com/app-icon-512.png",
            width: 512,
            height: 512,
          },
          description:
            "Education and career technology platform for Ghanaian students.",
          areaServed: "GH",
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://ghanapathfinder.com/#website",
          name: "GhanaPathFinder",
          alternateName: "Ghana Path Finder",
          url: "https://ghanapathfinder.com",
          inLanguage: "en-GH",
          publisher: { "@id": "https://ghanapathfinder.com/#organization" },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://ghanapathfinder.com/search?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
});
