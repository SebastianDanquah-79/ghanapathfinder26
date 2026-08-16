import { createFileRoute } from "@tanstack/react-router";
import Careers from "@/pages/Careers";

export const Route = createFileRoute("/careers/")({
  component: Careers,
  head: () => ({
    meta: [
      { title: "Career Paths in Ghana — Roles, Employers & Salaries | GhanaPathFinder" },
      {
        name: "description",
        content:
          "Explore career paths open to Ghanaian graduates: roles, employers hiring in Ghana, salary ranges and remote-work potential for each field of study.",
      },
      { property: "og:title", content: "Career Paths in Ghana | GhanaPathFinder" },
      {
        property: "og:description",
        content:
          "Roles, employers, salary ranges and remote-work potential for every major Ghanaian students study.",
      },
      { property: "og:url", content: "https://ghanapathfinder.com/careers" },
    ],
    links: [{ rel: "canonical", href: "https://ghanapathfinder.com/careers" }],
  }),
});
