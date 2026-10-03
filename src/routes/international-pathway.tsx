import { createFileRoute } from "@tanstack/react-router";
import InternationalPathway from "@/pages/InternationalPathway";

const title = "International Student Pathway | GhanaPathFinder";
const description = "Explore verified pathways from international qualifications into Ghanaian universities and programmes.";

export const Route = createFileRoute("/international-pathway")({
  ssr: false,
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InternationalPathway,
});
