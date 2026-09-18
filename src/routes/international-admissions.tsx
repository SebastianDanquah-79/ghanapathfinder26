import { createFileRoute } from "@tanstack/react-router";
import InternationalAdmissions from "@/pages/InternationalAdmissions";

export const Route = createFileRoute("/international-admissions")({
  component: InternationalAdmissions,
});
