import { createFileRoute, redirect } from "@tanstack/react-router";

/** Alias: /programmes/:slug -> canonical /programme/:slug */
export const Route = createFileRoute("/programmes/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/programme/$slug", params: { slug: params.slug } });
  },
});
