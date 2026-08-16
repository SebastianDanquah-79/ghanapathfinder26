import { createFileRoute } from "@tanstack/react-router";
import ProfessionalCouncils from "@/pages/ProfessionalCouncils";

export const Route = createFileRoute("/professional-councils")({
  head: () => ({
    meta: [
      { title: "Professional Councils & Career Regulation — GhanaPathFinder" },
      {
        name: "description",
        content:
          "Which professional council regulates careers such as nursing, medicine, teaching and allied health in Ghana, with links to each official body.",
      },
      {
        property: "og:title",
        content: "Professional Councils & Career Regulation — GhanaPathFinder",
      },
      {
        property: "og:description",
        content: "Official Ghanaian regulators behind regulated programmes and careers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfessionalCouncils,
});
