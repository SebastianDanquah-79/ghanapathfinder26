import { createFileRoute } from "@tanstack/react-router";
import ProgrammesDirectory from "@/pages/Programmes";

export const Route = createFileRoute("/programmes/")({
  component: ProgrammesDirectory,
});
