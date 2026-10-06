import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdvisorButton from "@/components/AdvisorButton";
import { listOpportunities } from "@/lib/opportunities.functions";
import { deadlineText, orgName, statusLabel } from "@/lib/opportunityFormat";

const searchSchema = z.object({
  type: z.string().max(60).optional().catch(undefined),
  country: z.string().max(80).optional().catch(undefined),
  verified: z.boolean().optional().catch(undefined),
});
type Search = z.infer<typeof searchSchema>;

const feedQuery = (s: Search) =>
  queryOptions({
    queryKey: [
      "opportunities-feed",
      s.type ?? "",
      s.country ?? "",
      !!s.verified,
    ],
    queryFn: () =>
      listOpportunities({
        data: {
          ...(s.type ? { type: s.type } : {}),
          ...(s.country ? { country: s.country } : {}),
          verifiedOnly: !!s.verified,
        },
      }),
  });

const TITLE = "Opportunities for Ghanaian students | GhanaPathFinder";
const DESC =
  "Internships, jobs, fellowships and programmes for Ghanaian students, each with its official source, verification status and deadline.";

export const Route = createFileRoute("/opportunities/")({
  validateSearch: (s) => searchSchema.parse(s),
  loaderDeps: ({ search }) => ({
    type: search.type,
    country: search.country,
    verified: search.verified,
  }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(feedQuery(deps)),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OpportunitiesPage,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8">
      {(error as Error).message}
    </div>
  ),
  notFoundComponent: () => <div className="p-8">No opportunities found.</div>,
});

const TYPES = [
  "internship",
  "job",
  "fellowship",
  "scholarship",
  "competition",
  "programme",
  "volunteer",
];

function OpportunitiesPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/opportunities/" });
  const { data } = useSuspenseQuery(feedQuery(search));
  const set = (patch: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Opportunities
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every listing shows where it came from, when it was last checked
              and when it closes.
            </p>
          </div>
          <AdvisorButton topic="The student is browsing the Opportunities feed (internships, jobs, fellowships)" />
        </div>

        <div className="flex flex-wrap gap-2 mb-5 items-center">
          <select
            aria-label="Opportunity type"
            value={search.type ?? ""}
            onChange={(e) => set({ type: e.target.value || undefined })}
            className="min-h-[40px] px-3 rounded-lg border border-border bg-background text-sm"
          >
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t[0]!.toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <input
            aria-label="Country"
            placeholder="Country"
            defaultValue={search.country ?? ""}
            onBlur={(e) => set({ country: e.target.value.trim() || undefined })}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              set({
                country:
                  (e.target as HTMLInputElement).value.trim() || undefined,
              })
            }
            className="min-h-[40px] px-3 rounded-lg border border-border bg-background text-sm"
          />
          <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={!!search.verified}
              onChange={(e) => set({ verified: e.target.checked || undefined })}
            />
            Verified only
          </label>
        </div>

        {data.error && (
          <p className="text-sm text-destructive mb-4">{data.error}</p>
        )}

        {!data.items.length ? (
          <div className="rounded-xl border border-border p-6">
            <p className="font-medium text-foreground">
              No open opportunities match right now.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              We only list opportunities we can link to an official source.
              Meanwhile, browse{" "}
              <Link to="/internships" className="text-primary underline">
                internships
              </Link>{" "}
              or{" "}
              <Link to="/scholarships" className="text-primary underline">
                scholarships
              </Link>
              .
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {data.items.map((o) => (
              <li
                key={o.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to="/opportunities/$slug"
                    params={{ slug: o.slug }}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {o.title}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {[
                      orgName(o),
                      o.opportunity_type,
                      o.location ?? o.country,
                      o.remote ? "Remote" : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {statusLabel[o.verification_status] ??
                      o.verification_status}
                    {o.source_name ? ` · Source: ${o.source_name}` : ""}
                    {o.last_verified_at
                      ? ` · Checked ${new Date(o.last_verified_at).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                <span className="text-xs font-semibold text-foreground shrink-0">
                  {deadlineText(o)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
      <Footer />
    </div>
  );
}
