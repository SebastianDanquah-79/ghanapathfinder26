import { createFileRoute } from "@tanstack/react-router";
import References from "@/pages/References";

export const Route = createFileRoute("/references")({
  head: () => ({
    meta: [
      { title: "References & Acknowledgements , GhanaPathFinder" },
      {
        name: "description",
        content:
          "Where GhanaPathFinder gets its information: official universities, GTEC and other regulators, admissions portals and scholarship providers, with verification dates.",
      },
      { property: "og:title", content: "References & Acknowledgements , GhanaPathFinder" },
      {
        property: "og:description",
        content: "A searchable directory of the official sources behind GhanaPathFinder data.",
      },
    ],
  }),
  component: References,
});
