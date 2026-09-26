import { createFileRoute } from "@tanstack/react-router";
import ExploreAfrica from "@/pages/ExploreAfrica";

export const Route = createFileRoute("/explore")({
  component: ExploreAfrica,
});
