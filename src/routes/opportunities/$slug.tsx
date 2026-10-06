import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdvisorButton from "@/components/AdvisorButton";
import TrackButton from "@/components/TrackButton";
import { getOpportunity } from "@/lib/opportunities.functions";
import { deadlineText, orgName, statusLabel } from "@/lib/opportunityFormat";

const oppQuery = (slug: string) =>
  queryOptions({
    queryKey: ["opportunity", slug],
    queryFn: () => getOpportunity({ data: { slug } }),
  });

export const Route = createFileRoute("/opportunities/$slug")({
  loader: async ({ context, params }) => {
    const o = await context.queryClient.ensureQueryData(oppQuery(params.slug));
    if (!o) throw notFound();
    return { title: o.title, org: orgName(o), type: o.opportunity_type };
  },
  head: ({ loaderData }) => {
    if (!loaderData)
      return {
        meta: [
          { title: "Opportunity not found | GhanaPathFinder" },
          { name: "robots", content: "noindex" },
        ],
      };
    const title = `${loaderData.title}${loaderData.org ? ` at ${loaderData.org}` : ""} | GhanaPathFinder`;
    const desc = `${loaderData.type} opportunity${loaderData.org ? ` from ${loaderData.org}` : ""}: eligibility, deadline and official source.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: OpportunityDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-8">
      {(error as Error).message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-8">
      This opportunity is no longer listed.{" "}
      <Link to="/opportunities" className="text-primary underline">
        See open opportunities
      </Link>
    </div>
  ),
});

function OpportunityDetail() {
  const { slug } = Route.useParams();
  const { data: o } = useSuspenseQuery(oppQuery(slug));
  if (!o) return null;
  const org = orgName(o);
  const applyUrl = o.application_url ?? o.source_url;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <Link to="/opportunities" className="text-sm text-muted-foreground">
          ← All opportunities
        </Link>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mt-4">
          {o.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {[org, o.opportunity_type, o.location ?? o.country, o.work_mode]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5 text-sm">
          <div className="rounded-lg border border-border p-3">
            <dt className="text-xs text-muted-foreground">Deadline</dt>
            <dd className="font-medium">
              {deadlineText(o)}
              {o.deadline_date ? ` (${o.deadline_date})` : ""}
            </dd>
          </div>
          <div className="rounded-lg border border-border p-3">
            <dt className="text-xs text-muted-foreground">Verification</dt>
            <dd className="font-medium">
              {statusLabel[o.verification_status] ?? o.verification_status}
              {o.last_verified_at
                ? ` · ${new Date(o.last_verified_at).toLocaleDateString()}`
                : ""}
            </dd>
          </div>
          {o.compensation && (
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted-foreground">Compensation</dt>
              <dd className="font-medium">{o.compensation}</dd>
            </div>
          )}
          {o.source_name && (
            <div className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted-foreground">Source</dt>
              <dd className="font-medium">
                {o.source_url ? (
                  <a
                    href={o.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {o.source_name}
                  </a>
                ) : (
                  o.source_name
                )}
              </dd>
            </div>
          )}
        </dl>

        {o.description && (
          <section className="mt-6">
            <h2 className="font-semibold text-foreground mb-1">About</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {o.description}
            </p>
          </section>
        )}
        {o.eligibility && (
          <section className="mt-5">
            <h2 className="font-semibold text-foreground mb-1">Eligibility</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {o.eligibility}
            </p>
          </section>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          <TrackButton
            item={{
              item_kind: "opportunity",
              item_ref: o.slug,
              title: o.title,
              organisation: org || null,
              url: applyUrl,
              deadline_date: o.deadline_date,
            }}
          />
          {applyUrl && (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[40px] px-4 rounded-lg border border-border text-sm font-medium"
            >
              Official page
            </a>
          )}
          <AdvisorButton
            topic={`The student is viewing the opportunity "${o.title}"${org ? ` from ${org}` : ""}`}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
