import { createFileRoute } from "@tanstack/react-router";
import ProgrammesDirectory from "@/pages/Programmes";
import {
  programmeDirectoryQueryOptions,
  programmeFacetsQueryOptions,
} from "@/hooks/useProgrammeDirectory";

export const Route = createFileRoute("/programmes/")({
  // Prefetch the default directory page + facets for SSR/crawlers; client-side
  // filtering and pagination continue to run through useQuery after hydration.
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        programmeDirectoryQueryOptions({
          search: "",
          verifiedOnly: false,
          sort: "name",
          page: 0,
        }),
      ),
      context.queryClient.ensureQueryData(programmeFacetsQueryOptions()),
    ]);
  },
  component: ProgrammesDirectory,
});
