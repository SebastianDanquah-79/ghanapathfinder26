import { createFileRoute } from "@tanstack/react-router";
import { EntryGate } from "@/pages/Platform";
import { scholarshipRecordsQueryOptions, universitiesQueryOptions } from "@/hooks/useCatalogue";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(universitiesQueryOptions({ search:"", type:"All", group:"All", region:undefined, page:0, pageSize:12 })),
      context.queryClient.ensureQueryData(scholarshipRecordsQueryOptions("", "All")),
    ]);
  },
  component: EntryGate,
});
