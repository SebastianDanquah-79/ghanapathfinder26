import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import {
  scholarshipRecordsQueryOptions,
  universitiesQueryOptions,
} from "@/hooks/useCatalogue";

export const Route = createFileRoute("/")({
  // Prefetch the default (unfiltered) directory + scholarship views so the
  // server-rendered HTML ships real content instead of loading placeholders.
  loader: async ({ context }) => {
    await Promise.all([
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
      context.queryClient.ensureQueryData(scholarshipRecordsQueryOptions("", "All")),
    ]);
  },
  component: Index,
});
