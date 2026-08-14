import { createFileRoute } from "@tanstack/react-router";
import AdminData from "@/pages/AdminData";

export const Route = createFileRoute("/admin/data")({
  component: AdminData,
});
