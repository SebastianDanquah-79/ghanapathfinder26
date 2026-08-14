import { createFileRoute } from "@tanstack/react-router";
import Inspiration from "@/pages/Inspiration";

export const Route = createFileRoute("/inspiration")({
  component: Inspiration,
});
