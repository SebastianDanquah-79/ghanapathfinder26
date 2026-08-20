import { createFileRoute } from "@tanstack/react-router";
import Companies from "@/pages/Companies";

const title = "Employers Hiring Graduates in Ghana | GhanaPathFinder";
const description =
  "Ghanaian employers that recruit students and graduates — sector, location, what they do, and a direct link to each organisation's official careers page.";

export const Route = createFileRoute("/companies/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Companies,
});
