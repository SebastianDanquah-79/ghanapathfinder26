import { createFileRoute } from "@tanstack/react-router";
import ProgrammePage from "@/pages/Programme";
import { programmeDetailQueryOptions } from "@/hooks/useProgrammeDetail";

const SITE = "https://ghanapathfinder.com";

export const Route = createFileRoute("/programme/$slug")({
  loader: async ({ context, params }) => {
    const detail = await context.queryClient.ensureQueryData(
      programmeDetailQueryOptions(params.slug),
    );
    return {
      name: detail?.programme.name ?? null,
      university: detail?.university?.name ?? null,
      description: detail?.information?.description ?? detail?.programme.description ?? null,
      slug: params.slug,
    };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "Programme";
    const uni = loaderData?.university;
    const title = `${name}${uni ? ` at ${uni}` : ""} | GhanaPathFinder`;
    const description = (
      loaderData?.description ||
      `${name}${uni ? ` at ${uni}` : ""}: entry requirements, WASSCE cut-off guidance, career pathways and how to apply.`
    ).slice(0, 155);
    const url = `${SITE}/programme/${loaderData?.slug ?? ""}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:type", content: "website" },
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
  component: ProgrammePage,
});
