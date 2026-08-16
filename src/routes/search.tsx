import { createFileRoute } from "@tanstack/react-router";
import SearchPage from "@/pages/Search";
import {
  PAGE_SIZE,
  catalogueSearchQueryOptions,
  scholarshipRecordsQueryOptions,
  universitiesQueryOptions,
} from "@/hooks/useCatalogue";

export const Route = createFileRoute("/search")({
  // Prefetch the default (empty-term) search view so the initial HTML contains
  // real results; typing/filtering still refetches client-side via useQuery.
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(catalogueSearchQueryOptions("", "all", 0)),
      context.queryClient.ensureQueryData(
        universitiesQueryOptions({
          search: "",
          type: "All",
          region: undefined,
          category: undefined,
          page: 0,
          pageSize: PAGE_SIZE,
        }),
      ),
      context.queryClient.ensureQueryData(scholarshipRecordsQueryOptions("", "All")),
    ]);
  },
  component: SearchPage,
});
