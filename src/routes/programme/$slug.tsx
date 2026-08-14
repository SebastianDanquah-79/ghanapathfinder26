import { createFileRoute } from "@tanstack/react-router";
import ProgrammePage from "@/pages/Programme";

export const Route = createFileRoute("/programme/$slug")({
  component: ProgrammePage,
});
