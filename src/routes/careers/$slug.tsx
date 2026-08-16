import { createFileRoute } from "@tanstack/react-router";
import CareerDetail from "@/pages/CareerDetail";
import { careerBySlug } from "@/data/careers";

export const Route = createFileRoute("/careers/$slug")({
  component: CareerDetail,
  head: ({ params }) => {
    const career = careerBySlug(params.slug);
    const url = `https://ghanapathfinder.com/careers/${params.slug}`;
    const title = career
      ? `${career.major} Careers in Ghana — Roles, Employers & Salary | GhanaPathFinder`
      : "Career path | GhanaPathFinder";
    const description = career
      ? `${career.major} careers in Ghana: typical roles, employers hiring locally and reported salary range ${career.salary}.`.slice(0, 155)
      : "Career paths for Ghanaian graduates.";
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
