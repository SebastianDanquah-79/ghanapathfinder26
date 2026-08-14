import { createFileRoute } from "@tanstack/react-router";
import AdmissionMatch from "@/pages/AdmissionMatch";

export const Route = createFileRoute("/admission-match")({
  component: AdmissionMatch,
});
