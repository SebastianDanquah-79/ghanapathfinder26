import { createFileRoute } from "@tanstack/react-router";
import Privacy from "@/pages/Privacy";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — GhanaPathFinder" },
      {
        name: "description",
        content:
          "What GhanaPathFinder stores, why it is stored, how anonymous usage counts work and how students control their data.",
      },
      { property: "og:title", content: "Privacy Policy — GhanaPathFinder" },
      { property: "og:description", content: "How student data is handled on GhanaPathFinder." },
    ],
  }),
  component: Privacy,
});
