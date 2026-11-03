import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, BriefcaseBusiness, Building2, Loader2, Sparkles } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";

type CompanyRecommendation = {
  id: string;
  name: string;
  sector: string | null;
  location: string | null;
  region: string | null;
  description: string | null;
  websiteUrl: string | null;
  careersUrl: string | null;
  verificationStatus: string | null;
  why: string;
  preparation: string[];
};

type ProviderRecommendation = {
  name: string;
  sector: string | null;
  programmeSummary: string | null;
  websiteUrl: string | null;
  applicationUrl: string | null;
  needsReview: boolean;
  why: string;
};

type CurrentInternship = {
  id: string;
  title: string;
  companyName: string | null;
  description: string | null;
  fields: string[];
  skills: string[];
  location: string | null;
  applicationUrl: string | null;
  deadline: string | null;
};

type RecommendationResponse = {
  companies: CompanyRecommendation[];
  providers: ProviderRecommendation[];
  internships: CurrentInternship[];
  note: string;
};

type Props = {
  career: string;
  programme?: string;
};

export default function CareerOpportunityRecommendations({ career, programme = "" }: Props) {
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  const companiesQuery = useQuery({
    queryKey: ["career-recommendation-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id,name,sector,location,region,description,website_url,careers_url,verification_status")
        .not("careers_url", "is", null)
        .order("name")
        .limit(40);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60_000,
  });

  const providersQuery = useQuery({
    queryKey: ["career-recommendation-internship-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internship_providers")
        .select("name,sector,programme_summary,website_url,application_url,needs_review")
        .order("name")
        .limit(20);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 10 * 60_000,
  });

  const internshipsQuery = useQuery({
    queryKey: ["career-recommendation-current-internships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id,title,company_name,organisation,description,fields,skills_required,location,apply_url,deadline,deadline_date")
        .eq("opportunity_type", "internship")
        .eq("is_active", true)
        .eq("published", true)
        .eq("verified", true)
        .order("posted_at", { ascending: false })
        .limit(30);
      if (error) throw error;

      const now = Date.now();
      return (data ?? [])
        .filter((item) => {
          const deadline = item.deadline_date || item.deadline;
          return !deadline || new Date(deadline).getTime() >= now;
        })
        .map((item) => ({
          id: item.id,
          title: item.title,
          companyName: item.company_name || item.organisation,
          description: item.description,
          fields: item.fields ?? [],
          skills: item.skills_required ?? [],
          location: item.location,
          applicationUrl: item.apply_url,
          deadline: item.deadline_date || item.deadline,
        }));
    },
    staleTime: 5 * 60_000,
  });

  const loading =
    companiesQuery.isLoading || providersQuery.isLoading || internshipsQuery.isLoading;
  const loadError =
    companiesQuery.error || providersQuery.error || internshipsQuery.error;

  const candidates = useMemo(() => ({
    companies: (companiesQuery.data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      sector: item.sector,
      location: item.location,
      region: item.region,
      description: item.description,
      websiteUrl: item.website_url,
      careersUrl: item.careers_url,
      verificationStatus: item.verification_status,
    })),
    providers: (providersQuery.data ?? []).map((item) => ({
      name: item.name,
      sector: item.sector,
      programmeSummary: item.programme_summary,
      websiteUrl: item.website_url,
      applicationUrl: item.application_url,
      needsReview: item.needs_review,
    })),
    internships: internshipsQuery.data ?? [],
  }), [companiesQuery.data, providersQuery.data, internshipsQuery.data]);

  useEffect(() => {
    if (loading || loadError || (!career.trim() && !programme.trim())) return;
    const controller = new AbortController();
    setRequestError(null);
    setResult(null);

    void fetch("/api/company-recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        career,
        programme,
        companies: candidates.companies,
        providers: candidates.providers,
        internships: candidates.internships,
      }),
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(typeof payload?.error === "string" ? payload.error : "Company recommendations are unavailable.");
        return payload as RecommendationResponse;
      })
      .then((payload) => {
        if (!controller.signal.aborted) setResult(payload);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          console.error("Career opportunity recommendations failed", error);
          setRequestError("AI company matching is temporarily unavailable. You can still browse the company and internship directories.");
        }
      });

    return () => controller.abort();
  }, [career, programme, candidates, loading, loadError]);

  return (
    <section className="rounded-2xl border border-border bg-glass p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <BriefcaseBusiness className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Career connections</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Companies and internship pathways</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Organisations selected against your programme and career direction.
          </p>
        </div>
      </div>

      {(loading || (result === null && !requestError && !loadError)) && (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Matching companies and opportunities…
        </p>
      )}
      {(requestError || loadError) && (
        <p className="mt-4 text-sm text-muted-foreground">
          {requestError || "The company directory could not be loaded. Try again later."}
        </p>
      )}

      {result && (
        <>
          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Company recommendations</h4>
            </div>
            {result.companies.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {result.companies.map((company) => (
                  <article key={company.id} className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h5 className="font-semibold text-foreground">{company.name}</h5>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {[company.sector, company.location || company.region].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-border px-2 py-1 text-[10px] text-muted-foreground">
                        Directory lead
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{company.why}</p>
                    {!!company.preparation.length && (
                      <ul className="mt-3 space-y-1">
                        {company.preparation.map((item, index) => (
                          <li key={index} className="flex gap-2 text-xs text-muted-foreground">
                            <span className="text-primary">•</span>{item}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold">
                      {company.careersUrl && (
                        <a href={company.careersUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary">
                          Careers page <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                      {company.websiteUrl && (
                        <a href={company.websiteUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground">
                          Website <ArrowUpRight className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <p className="mt-3 text-[10px] text-muted-foreground">
                      Company record: {company.verificationStatus || "not yet verified"}. A careers link does not confirm a current vacancy.
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No company records with career links match this profile yet.</p>
            )}
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Internship opportunities</h4>
            </div>
            {result.internships.length ? (
              <div className="mt-3 space-y-2">
                {result.internships.map((item) => (
                  <article key={item.id} className="rounded-lg border border-border bg-background/50 p-3">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[item.companyName, item.location, item.deadline ? `Deadline: ${new Date(item.deadline).toLocaleDateString()}` : ""].filter(Boolean).join(" · ")}
                    </p>
                    {item.description && <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>}
                    {item.applicationUrl && <a href={item.applicationUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">Official application <ArrowUpRight className="h-3 w-3" /></a>}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                There are no current verified internship vacancies in the directory that match this path. Check official careers pages regularly; older or unverified listings are not presented as active openings.
              </p>
            )}
            {!!result.providers.length && (
              <div className="mt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Organisations to investigate</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {result.providers.map((provider) => (
                    <article key={provider.name} className="rounded-lg border border-border p-3">
                      <p className="text-sm font-medium text-foreground">{provider.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{provider.why}</p>
                      <p className="mt-2 text-[10px] text-muted-foreground">
                        {provider.sector || "Early-career / training provider"} · {provider.needsReview ? "Directory record needs review" : "Review status not flagged"}
                      </p>
                      <div className="mt-2 flex gap-3 text-xs font-semibold">
                        {provider.applicationUrl && <a href={provider.applicationUrl} target="_blank" rel="noreferrer" className="text-primary">Programmes</a>}
                        {provider.websiteUrl && <a href={provider.websiteUrl} target="_blank" rel="noreferrer" className="text-muted-foreground">Website</a>}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            <p className="mt-4 text-[11px] text-muted-foreground">
              {result.note || "Recommendations are based on supplied directory records. Confirm eligibility and current openings on each organisation's official page."}
            </p>
          </div>
        </>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <Link to="/internships" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
          Explore the full internship and employer directory <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
