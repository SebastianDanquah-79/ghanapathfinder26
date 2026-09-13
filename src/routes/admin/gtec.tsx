import { createFileRoute } from "@tanstack/react-router";
import AdminGtec from "@/pages/AdminGtec";

export const Route = createFileRoute("/admin/gtec")({
  component: AdminGtec,
  head: () => ({
    meta: [
      { title: "Accreditation dashboard | GhanaPathFinder admin" },
      {
        name: "description",
        content:
          "Administrator dashboard comparing every published institution against the regulator's live accredited list, with one-click approve or reject.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Accreditation dashboard | GhanaPathFinder admin" },
      { property: "og:description", content: "Check published institutions against the accredited list." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
