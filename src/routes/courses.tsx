import { createFileRoute, redirect } from "@tanstack/react-router";

/** Keep the familiar Courses URL working and send it to the canonical programme directory. */
export const Route = createFileRoute("/courses")({
  beforeLoad: () => {
    throw redirect({ to: "/programmes/" });
  },
});
