import { createFileRoute } from "@tanstack/react-router";
import Preferences from "@/pages/Preferences";

// Keep /settings as the user-facing URL while reusing the existing settings page.
export const Route = createFileRoute("/settings")({
  component: Preferences,
});
