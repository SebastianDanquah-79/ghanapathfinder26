import { createFileRoute } from "@tanstack/react-router";
import InternationalDirectory from "@/pages/InternationalDirectory";

// International directory is additive and does not alter existing routes.

export const Route = createFileRoute("/international-directory")({
  head: () => ({
    meta: [
      { title: "International Directory | GhanaPathFinder" },
      { name: "description", content: "Country-by-country university application pathways and routes into Ghanaian universities." },
    ],
  }),
  component: InternationalDirectory,
});
