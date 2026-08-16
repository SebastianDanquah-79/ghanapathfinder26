import { createFileRoute } from "@tanstack/react-router";
import Terms from "@/pages/Terms";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use — GhanaPathFinder" },
      {
        name: "description",
        content:
          "The terms that apply when using GhanaPathFinder: guidance-only information, verification responsibility, account rules and platform availability.",
      },
      { property: "og:title", content: "Terms of Use — GhanaPathFinder" },
      { property: "og:description", content: "Terms that apply when using GhanaPathFinder." },
    ],
  }),
  component: Terms,
});
