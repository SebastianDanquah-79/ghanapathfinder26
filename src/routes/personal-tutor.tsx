import { createFileRoute } from "@tanstack/react-router";
import AIModePage from "@/pages/AIModePage";

export const Route = createFileRoute("/personal-tutor")({
  component: () => <AIModePage mode="personal-tutor" />,
});
