import { createFileRoute } from "@tanstack/react-router";
import RolePortal from "@/pages/RolePortal";
export const Route = createFileRoute("/employee")({ component: () => <RolePortal role="employee" /> });
