import { createFileRoute } from "@tanstack/react-router";
import LifeSimulator from "@/pages/LifeSimulator";

export const Route = createFileRoute("/life-simulator")({
  component: LifeSimulator,
});
