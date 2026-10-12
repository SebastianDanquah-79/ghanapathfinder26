import { createFileRoute } from "@tanstack/react-router";
import Privacy from "@/pages/Privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | GhanaPathFinder" },
      {
        name: "description",
        content:
          "How GhanaPathFinder handles account information, public talent profiles, AI prompts, education data and privacy requests.",
      },
      { property: "og:title", content: "Privacy Policy | GhanaPathFinder" },
      { property: "og:description", content: "How student data is handled on GhanaPathFinder." },
    ],
  }),
  component: Privacy,
});
