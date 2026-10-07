import { createFileRoute } from "@tanstack/react-router";
import Home from "@/pages/Home";
import {
  scholarshipRecordsQueryOptions,
  universitiesQueryOptions,
} from "@/hooks/useCatalogue";

export const Route = createFileRoute("/")({
  // Prefetch public catalogue data when available, but never make the entire
  // landing page fail because a backend prefetch is temporarily unavailable.
  // The rendered components fetch the same data on the client and can retry.
  loader: async ({ context }) => {
    const results = await Promise.allSettled([
      context.queryClient.ensureQueryData(
        universitiesQueryOptions({
          search: "",
          type: "All",
          group: "All",
          region: undefined,
          page: 0,
          pageSize: 12,
        }),
      ),
      context.queryClient.ensureQueryData(
        scholarshipRecordsQueryOptions("", "All"),
      ),
    ]);

    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Homepage catalogue prefetch failed:", result.reason);
      }
    }
  },
  component: Home,
});
