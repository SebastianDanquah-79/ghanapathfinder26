import { createFileRoute } from "@tanstack/react-router";
import Auth from "@/pages/Auth";
import { pageHead } from "@/lib/seo-head";

export const Route = createFileRoute("/auth")({
  head: () => pageHead({
    title: "Sign in | GhanaPathFinder",
    description: "Sign in or create your GhanaPathFinder account to save universities, scholarships, careers and opportunities.",
    path: "/auth",
    noindex: true,
  }),
  component: Auth,
});
