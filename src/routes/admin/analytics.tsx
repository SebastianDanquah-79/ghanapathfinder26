import { createFileRoute } from "@tanstack/react-router";
import AdminAnalytics from "@/pages/AdminAnalytics";

export const Route = createFileRoute("/admin/analytics")({
  component: AdminAnalytics,
  head: () => ({
    meta: [
      { title: "Admin Analytics | GhanaPath" },
      { name: "description", content: "Verified GhanaPath usage analytics for administrators." },
      { property: "og:title", content: "Admin Analytics | GhanaPath" },
      { property: "og:description", content: "Verified GhanaPath usage analytics for administrators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});
