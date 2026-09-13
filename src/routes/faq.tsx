import { createFileRoute } from "@tanstack/react-router";
import Faq from "@/pages/Faq";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ: Admissions, Cut-off Points & Scholarships | GhanaPathFinder" },
      {
        name: "description",
        content:
          "Answers on applying to Ghanaian universities, how WASSCE aggregates and cut-off points work, finding scholarships, and how GhanaPathFinder guidance is produced.",
      },
      { property: "og:title", content: "GhanaPathFinder FAQ" },
      {
        property: "og:description",
        content: "Admissions, cut-off points, scholarships and how GhanaPathFinder guidance works.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Faq,
});
