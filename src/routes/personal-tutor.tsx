import { createFileRoute } from "@tanstack/react-router";
import PersonalTutorPage from "@/pages/PersonalTutorPage";

export const Route = createFileRoute("/personal-tutor")({
  component: PersonalTutorPage,
});
