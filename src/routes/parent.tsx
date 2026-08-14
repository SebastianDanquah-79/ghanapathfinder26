import { createFileRoute } from "@tanstack/react-router";
import ParentView from "@/pages/ParentView";

export const Route = createFileRoute("/parent")({
  component: ParentView,
});
