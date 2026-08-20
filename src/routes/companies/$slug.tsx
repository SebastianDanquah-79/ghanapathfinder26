import { createFileRoute } from "@tanstack/react-router";
import CompanyDetail from "@/pages/CompanyDetail";

export const Route = createFileRoute("/companies/$slug")({
  head: ({ params }) => {
    const name = params.slug
      .split("-")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
    const title = `${name} — Careers & Internships | GhanaPathFinder`;
    const description = `What ${name} does, who they hire, and the student, internship and graduate routes into the organisation — with a link to their official careers page.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CompanyDetail,
});
