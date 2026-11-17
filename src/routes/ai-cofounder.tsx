import { createFileRoute } from "@tanstack/react-router";
import AIModePage from "@/pages/AIModePage";

export const Route = createFileRoute("/ai-cofounder")({
  component: () => <AIModePage mode="cofounder" />,
});
