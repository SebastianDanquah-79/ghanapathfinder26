import { createFileRoute } from "@tanstack/react-router";
import ScholarshipDetail from "@/pages/ScholarshipDetail";
import { scholarshipBySlug } from "@/data/scholarships";

export const Route = createFileRoute("/scholarships/$slug")({
  component: ScholarshipDetail,
  head: ({ params }) => {
    const s = scholarshipBySlug(params.slug);
    const url = `https://ghanapathfinder.com/scholarships/${params.slug}`;
    const title = s
      ? `${s.name} — Eligibility & How to Apply | GhanaPathFinder`
      : "Scholarship | GhanaPathFinder";
    const description = s
      ? `${s.name} from ${s.provider}: ${s.coverage} for ${s.level}. Eligibility, deadline and how to apply.`.slice(0, 155)
      : "Scholarships for Ghanaian students.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});
