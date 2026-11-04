import { createFileRoute } from "@tanstack/react-router";
import Mentorship from "@/pages/Mentorship";

export const Route = createFileRoute("/mentorship")({
  component: Mentorship,
});
