import { createFileRoute } from "@tanstack/react-router";
import CVBuilder from "@/pages/CVBuilder";

export const Route = createFileRoute("/cv-builder" as any)({
  component: CVBuilder,
});
