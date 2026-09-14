import { createFileRoute } from "@tanstack/react-router";
import PathfinderLab from "@/pages/PathfinderLab";

export const Route = createFileRoute("/pathfinder-lab")({
  component: PathfinderLab,
});
