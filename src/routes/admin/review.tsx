import { createFileRoute } from "@tanstack/react-router";
import AdminReview from "@/pages/AdminReview";

export const Route = createFileRoute("/admin/review")({
  component: AdminReview,
  head: () => ({
    meta: [
      { title: "Review queue | GhanaPathFinder admin" },
      { name: "description", content: "Administrator queue for verifying institution, programme, internship and skills records before they are published." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Review queue | GhanaPathFinder admin" },
      { property: "og:description", content: "Verify records against official sources before publishing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
