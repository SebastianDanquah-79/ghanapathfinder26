import { createFileRoute } from "@tanstack/react-router";
import Internships from "@/pages/Internships";

export const Route = createFileRoute("/internships/")({
  head: () => ({
    meta: [
      { title: "Internships, Attachments & Graduate Programmes in Ghana | GhanaPathFinder" },
      {
        name: "description",
        content:
          "Search Ghanaian employers offering internships, industrial attachments, national service placements and graduate programmes, filtered by sector, region and course of study.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Internships and graduate programmes in Ghana" },
      {
        property: "og:description",
        content:
          "Real Ghanaian employers that take interns, attachment students and graduate trainees, matched to your course.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Internships,
});
