import { createFileRoute } from "@tanstack/react-router";
import AdminInsights from "@/pages/AdminInsights";

export const Route = createFileRoute("/admin/insights")({
  head: () => ({
    meta: [
      { title: "Insight moderation | GhanaPathFinder admin" },
      { name: "description", content: "Review, approve, hide and delete student insights." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminInsights,
});
