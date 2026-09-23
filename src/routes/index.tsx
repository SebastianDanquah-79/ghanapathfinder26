import { createFileRoute } from "@tanstack/react-router";
import { RoleWelcome } from "@/pages/Platform";

export const Route = createFileRoute("/")({
  component: RoleWelcome,
});
