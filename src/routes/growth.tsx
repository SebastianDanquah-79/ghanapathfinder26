import { createFileRoute } from "@tanstack/react-router";
import GrowthOS from "@/pages/GrowthOS";

export const Route = createFileRoute("/growth")({
  component: GrowthOS,
});
