import { createFileRoute } from "@tanstack/react-router";
import AdminDashboard from "@/pages/AdminDashboard";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
  head: () => ({
    meta: [
      { title: "Admin Control Centre | GhanaPathFinder" },
      { name: "description", content: "Restricted administration, verification, moderation and analytics for GhanaPathFinder." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});
