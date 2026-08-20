import { createFileRoute } from "@tanstack/react-router";
import Community from "@/pages/Community";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Student Insights & Community | GhanaPathFinder" },
      {
        name: "description",
        content:
          "Anonymous student experiences from Ghanaian universities: accommodation, transport, workload, cost of living, campus culture and advice for applicants.",
      },
      { property: "og:title", content: "Student Insights & Community" },
      {
        property: "og:description",
        content: "What students say about studying at Ghanaian universities — shared anonymously.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Community,
});
