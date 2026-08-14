import { createFileRoute } from "@tanstack/react-router";
import CompareScholarships from "@/pages/CompareScholarships";

export const Route = createFileRoute("/compare-scholarships")({
  component: CompareScholarships,
});
