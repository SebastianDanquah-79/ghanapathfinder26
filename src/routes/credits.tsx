import { createFileRoute } from "@tanstack/react-router";
import Credits from "@/pages/Credits";

export const Route = createFileRoute("/credits")({
  head: () => ({
    meta: [
      { title: "Credits, Sources & Acknowledgements | GhanaPathFinder" },
      {
        name: "description",
        content:
          "Every organisation, dataset and learning provider GhanaPathFinder links to or draws on — from GTEC and WAEC to freeCodeCamp, Khan Academy and Coursera.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Credits, sources & acknowledgements" },
      {
        property: "og:description",
        content: "How GhanaPathFinder sources information, and who owns the material we link to.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Credits,
});
