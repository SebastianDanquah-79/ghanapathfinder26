import { createFileRoute } from "@tanstack/react-router";
import Disclaimer from "@/pages/Disclaimer";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer , GhanaPathFinder" },
      {
        name: "description",
        content:
          "Recommendations and estimated cut-off points on GhanaPathFinder are guidance only and must be verified with the institution.",
      },
      { property: "og:title", content: "Disclaimer , GhanaPathFinder" },
      {
        property: "og:description",
        content: "How to use GhanaPathFinder information responsibly.",
      },
    ],
  }),
  component: Disclaimer,
});
