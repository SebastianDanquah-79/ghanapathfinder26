import { createFileRoute, redirect } from "@tanstack/react-router";

/** Alias: /universities/:slug -> canonical /university/:slug */
export const Route = createFileRoute("/universities/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/university/$slug", params: { slug: params.slug } });
  },
});
