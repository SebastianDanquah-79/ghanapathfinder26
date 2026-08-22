import { createFileRoute } from "@tanstack/react-router";
import InternshipDetail from "@/pages/InternshipDetail";
import { employerById } from "@/lib/internships";

export const Route = createFileRoute("/internships/$id")({
  head: ({ params }) => {
    const employer = employerById(params.id);
    const title = employer
      ? `${employer.name} Internships & Graduate Opportunities in Ghana | GhanaPathFinder`
      : "Internship opportunity | GhanaPathFinder";
    const description = employer
      ? `${employer.name}: ${employer.opportunities.join(", ").toLowerCase()} in ${employer.locations.join(", ")}. Qualifications, how to apply and an application checklist.`
      : "Internship, attachment and graduate opportunity details for students in Ghana.";
    return {
      meta: [
        { title },
        { name: "description", content: description.slice(0, 155) },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description.slice(0, 155) },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: InternshipDetail,
});
