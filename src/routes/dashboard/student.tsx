import { createFileRoute } from "@tanstack/react-router";
import { StudentDashboard } from "@/pages/Platform";

export const Route = createFileRoute("/dashboard/student")({
  component: StudentDashboard,
});
