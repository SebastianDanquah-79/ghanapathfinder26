import { createFileRoute } from "@tanstack/react-router";
import ApplicationTracker from "@/pages/ApplicationTracker";

export const Route = createFileRoute("/applications")({
  component: ApplicationTracker,
});
