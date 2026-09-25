import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { OPPORTUNITY_CATEGORIES } from "@/lib/opportunity-categories";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/opportunities/$slug")({
  component: OpportunityCategory,
});

function OpportunityCategory() {
  const { slug } = Route.useParams();
  const category = OPPORTUNITY_CATEGORIES.find((item) => item.slug === slug);

  const query = useQuery({
    queryKey: ["opportunity-category", slug],
    enabled: Boolean(category),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .order("last_verified_at", { ascending: false, nullsFirst: false })
        .limit(100);

      if (error) throw error;

      const rows = (data ?? []) as Tables<"opportunities">[];
      if (!category) return rows;

      return rows.filter((opportunity) => {
        const haystack = [
          opportunity.opportunity_type,
          opportunity.title,
          opportunity.company_name,
        ]
          .filter((value): value is string => Boolean(value))
          .join(" ")
          .toLowerCase();

        if (category.slug === "job") {
          return /job|employment|role/.test(haystack) && !/internship|attachment/.test(haystack);
        }
        if (category.slug === "remote") return /remote/.test(haystack);
        if (category.slug === "fellowship") return /fellowship/.test(haystack);
        if (category.slug === "hackathon") return /hackathon/.test(haystack);
        if (category.slug === "competition") return /competition|challenge|prize/.test(haystack);
        if (category.slug === "research") return /research|lab/.test(haystack);
        if (category.slug === "volunteer") return /volunteer/.test(haystack);
        if (category.slug === "funding") return /grant|funding|fund/.test(haystack);
        return true;
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="px-4 pb-14 pt-20 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <a href="/opportunities" className="text-xs text-primary">
            All opportunities
          </a>
          <h1 className="mt-3 font-display text-3xl font-bold">
            {category?.label ?? "Opportunity"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {category?.description ?? "Explore current opportunities."}
          </p>

          <div className="mt-6 space-y-3">
            {query.data?.map((opportunity) => (
              <article
                key={opportunity.id}
                className="rounded-xl border border-border bg-glass p-4"
              >
                <h2 className="font-semibold">
                  {opportunity.title ?? "Opportunity"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[
                    opportunity.company_name,
                    opportunity.opportunity_type,
                    opportunity.country_code,
                  ]
                    .filter((value): value is string => Boolean(value))
                    .join(" · ")}
                </p>
                {opportunity.application_url && (
                  <a
                    href={opportunity.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs font-semibold text-primary"
                  >
                    Apply
                  </a>
                )}
              </article>
            ))}

            {!query.isLoading && !query.data?.length && (
              <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">
                No matching verified records are available right now. This page remains active.
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
