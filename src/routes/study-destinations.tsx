import { createFileRoute } from "@tanstack/react-router";
import StudyDestinations from "@/pages/StudyDestinations";

export const Route = createFileRoute("/study-destinations")({
  component: StudyDestinations,
});
