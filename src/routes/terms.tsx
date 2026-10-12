import { createFileRoute } from "@tanstack/react-router";
import Terms from "@/pages/Terms";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions | GhanaPathFinder" },
      {
        name: "description",
        content:
          "Terms for using GhanaPathFinder's education, career, AI guidance, public profile and opportunity features.",
      },
      { property: "og:title", content: "Terms & Conditions | GhanaPathFinder" },
      { property: "og:description", content: "Terms that apply when using GhanaPathFinder." },
    ],
  }),
  component: Terms,
});
