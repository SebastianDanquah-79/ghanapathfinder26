import { createFileRoute } from "@tanstack/react-router";
import Skills from "@/pages/Skills";

export const Route = createFileRoute("/skills/")({
  head: () => ({
    meta: [
      { title: "Skills to Learn for Every Career in Ghana | GhanaPathFinder" },
      {
        name: "description",
        content:
          "Foundation, technical, soft, tool and advanced skills behind each Ghanaian university programme and career — each with free courses, YouTube channels and certifications.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Skills to learn for every career in Ghana" },
      {
        property: "og:description",
        content: "Free learning resources for every skill behind Ghanaian programmes and careers.",
      },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Skills,
});
