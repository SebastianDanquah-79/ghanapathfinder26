import { createFileRoute } from "@tanstack/react-router";
import Preferences from "@/pages/Preferences";

export const Route = createFileRoute("/preferences")({
  component: Preferences,
});
