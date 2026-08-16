import { createFileRoute } from "@tanstack/react-router";
import Contact from "@/pages/Contact";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact GhanaPathFinder" },
      {
        name: "description",
        content:
          "Report an out-of-date requirement, suggest an institution or programme, or ask a question about GhanaPathFinder.",
      },
      { property: "og:title", content: "Contact GhanaPathFinder" },
      { property: "og:description", content: "Get in touch with the GhanaPathFinder team." },
    ],
  }),
  component: Contact,
});
