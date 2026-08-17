import { createFileRoute } from "@tanstack/react-router";
import UniversityProfile from "@/pages/UniversityProfile";
import { programmesQueryOptions, universityQueryOptions } from "@/hooks/useCatalogue";

const SITE = "https://ghanapathfinder.com";

export const Route = createFileRoute("/university/$slug")({
  loader: async ({ context, params }) => {
    const uni = await context.queryClient.ensureQueryData(universityQueryOptions(params.slug));
    if (uni?.id) {
      await context.queryClient.ensureQueryData(programmesQueryOptions(uni.id, ""));
    }
    return {
      name: uni?.name ?? null,
      description: uni?.description ?? null,
      location: uni?.location ?? null,
      slug: params.slug,
    };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.name ?? "University";
    const title = `${name} , Programmes & Admissions | GhanaPathFinder`;
    const description = (
      loaderData?.description ||
      `${name}${loaderData?.location ? ` in ${loaderData.location}` : ""}: accreditation status, programmes, tuition range and admissions information in Ghana.`
    ).slice(0, 155);
    const url = `${SITE}/university/${loaderData?.slug ?? ""}`;
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
  component: UniversityProfile,
});
