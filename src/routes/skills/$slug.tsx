import { createFileRoute } from "@tanstack/react-router";
import SkillDetail from "@/pages/SkillDetail";
import { skillById } from "@/data/skillsMap";

const SITE = "https://ghanapathfinder.com";

export const Route = createFileRoute("/skills/$slug")({
  head: ({ params }) => {
    const skill = skillById(params.slug);
    const title = skill
      ? `${skill.name} , how to learn it in Ghana | GhanaPathFinder`
      : "Skill | GhanaPathFinder";
    const description = skill
      ? `${skill.summary} ${skill.why}`.slice(0, 155)
      : "Learn the skills behind Ghanaian university programmes and careers.";
    const url = `${SITE}/skills/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: SkillDetail,
});
