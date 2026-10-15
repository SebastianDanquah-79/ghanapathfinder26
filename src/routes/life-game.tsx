import { createFileRoute } from "@tanstack/react-router";
import LifeGame from "@/pages/LifeGame";

export const Route = createFileRoute("/life-game")({
  head: () => ({
    meta: [
      { title: "Life Game | GhanaPathFinder" },
      {
        name: "description",
        content: "Set a life goal, play through realistic decisions, explore trade-offs and build a practical next-step mission.",
      },
      { property: "og:title", content: "Life Game | GhanaPathFinder" },
      {
        property: "og:description",
        content: "A personal life simulator for testing choices before acting on them in real life.",
      },
    ],
  }),
  component: LifeGame,
});
