import { createFileRoute } from "@tanstack/react-router";
import UniversityProfile from "@/pages/UniversityProfile";

export const Route = createFileRoute("/university/$slug")({
  component: UniversityProfile,
});
