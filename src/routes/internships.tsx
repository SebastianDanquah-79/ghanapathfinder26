import { createFileRoute } from "@tanstack/react-router";
import Internships from "@/pages/Internships";

const title = "Internships & Attachments in Ghana | GhanaPathFinder";
const description =
  "Student attachments, internships and graduate programmes with real Ghanaian employers — who can apply, how long they run, and a link to each employer's official careers page.";

export const Route = createFileRoute("/internships")({
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
  component: Internships,
});
