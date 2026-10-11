import { createFileRoute } from "@tanstack/react-router";
import RoleGateway from "@/components/RoleGateway";

export const Route = createFileRoute("/")({
  component: RoleGateway,
});
