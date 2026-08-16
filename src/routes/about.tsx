import { createFileRoute } from "@tanstack/react-router";
import About from "@/pages/About";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About GhanaPathFinder — Education & Career Platform for Ghana" },
      {
        name: "description",
        content:
          "GhanaPathFinder brings university discovery, programmes, careers, scholarships and WASSCE-based recommendations into one platform for students in Ghana.",
      },
      { property: "og:title", content: "About GhanaPathFinder" },
      {
        property: "og:description",
        content: "An education and career technology platform for students in Ghana.",
      },
    ],
  }),
  component: About,
});
