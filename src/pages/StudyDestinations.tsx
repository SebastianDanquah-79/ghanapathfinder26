import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { ExternalLink, Search, ArrowRight } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";

type CountryRecord = {
  country_code: string;
  country_name: string;
  region: string | null;
  ghana_application_summary: string | null;
  ghana_application_steps: Array<{step?: number; title?: string; detail?: string}> | null;
  qualification_examples: string[] | null;
  verification_status: string | null;
  ghana_source_urls: string[] | null;
};

type QualificationRule = {
  id: string;
  institution_id: string;
  qualification_code: string;
  academic_level: string | null;
  notes: string | null;
  source_url: string | null;
  verification_status: string | null;
};

type Institution = {
  id: string;
  name: string;
  short_name: string | null;
  website_url: string | null;
  admissions_url: string | null;
};

const qualificationLabels: Record<string, string> = {
  WASSCE: "WASSCE",
  A_LEVEL: "A-levels",
  IB: "International Baccalaureate (IB)",
  AMERICAN_HS: "US high-school qualification",
  IGCSE: "IGCSE",
};

export default function StudyDestinations() {
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const countriesQuery = useQuery({
    queryKey: ["study-destinations-country-directory"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("international_country_directory")
        .select("country_code,country_name,region,ghana_application_summary,ghana_application_steps,qualification_examples,verification_status,ghana_source_urls")
        .order("country_name");
      if (error) throw error;
      return (data ?? []) as CountryRecord[];
    },
  });

  const pathwaysQuery = useQuery({
    queryKey: ["verified-international-pathway-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("international_pathway_rules")
        .select("id,institution_id,qualification_code,academic_level,notes,source_url,verification_status")
        .eq("verification_status", "verified")
        .order("qualification_code");
      if (error) throw error;
      const rules = (data ?? []) as QualificationRule[];
      const institutionIds = Array.from(new Set(rules.map(rule => rule.institution_id).filter(Boolean)));
      if (!institutionIds.length) return [];
      const result = await supabase
        .from("universities")
        .select("id,name,short_name,website_url,admissions_url")
        .in("id", institutionIds);
      if (result.error) throw result.error;
      const byId = new Map(((result.data ?? []) as Institution[]).map(item => [item.id, item]));
      return rules.map(rule => ({ ...rule, institution: byId.get(rule.institution_id) ?? null }));
    },
  });

  const countries = countriesQuery.data ?? [];
  const filteredCountries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return countries.slice(0, 8);
    return countries.filter(country =>
      country.country_name.toLowerCase().includes(term) ||
      country.country_code.toLowerCase().includes(term)
    ).slice(0, 12);
  }, [countries, search]);

  const selected = countries.find(country => country.country_code === selectedCountry) ?? null;
  const steps = Array.isArray(selected?.ghana_application_steps) ? selected.ghana_application_steps : [];
  const sources = Array.isArray(selected?.ghana_source_urls) ? selected.ghana_source_urls : [];

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <Seo
        title="Study in Ghana | International Student Pathways"
        description="Explore country-specific starting guidance and official qualification pathways for international applicants considering study in Ghana."
        path="/study-destinations"
      />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">
        <header className="border-b border-border pb-7">
          <p className="text-sm font-semibold text-primary">International Student Portal</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Explore study pathways into Ghana</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            Start with the country where you studied, review the general application steps, and compare published qualification guidance from Ghanaian institutions. Admission is always decided by the institution and exact programme.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/portal/international-student" className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Back to your portal <ArrowRight className="h-4 w-4" /></a>
            <a href="/admission-match" className="inline-flex min-h-10 items-center border border-border px-4 py-2 text-sm font-medium hover:border-primary">Check programme matches</a>
          </div>
        </header>

        <section className="mt-7 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Choose your home country</h2>
            <p className="mt-1 text-sm text-muted-foreground">Search by country name or country code.</p>
            <label className="mt-4 flex min-h-11 items-center gap-2 border border-border bg-background px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="e.g. Nigeria, Ghana, Chad"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                aria-label="Search countries"
              />
            </label>
            {countriesQuery.isLoading ? (
              <p className="mt-4 text-sm text-muted-foreground">Loading country directory…</p>
            ) : countriesQuery.isError ? (
              <p className="mt-4 text-sm text-destructive">Country guidance could not be loaded. Please try again later.</p>
            ) : (
              <div className="mt-3 space-y-1">
                {filteredCountries.map(country => (
                  <button
                    key={country.country_code}
                    type="button"
                    onClick={() => setSelectedCountry(country.country_code)}
                    className={"flex w-full items-center justify-between gap-3 border px-3 py-3 text-left text-sm transition-colors " + (selectedCountry === country.country_code ? "border-primary bg-primary/[0.04]" : "border-transparent hover:border-border hover:bg-background")}
                  >
                    <span className="font-medium">{country.country_name}</span>
                    <span className="text-xs text-muted-foreground">{country.country_code}</span>
                  </button>
                ))}
                {!filteredCountries.length && <p className="px-3 py-4 text-sm text-muted-foreground">No country matched that search.</p>}
                {!search.trim() && countries.length > filteredCountries.length && <p className="px-3 pt-2 text-xs text-muted-foreground">Search to find other countries in the directory.</p>}
              </div>
            )}
          </div>

          <div className="border border-border bg-card p-5 sm:p-6">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Study in Ghana</p>
                    <h2 className="mt-1 text-2xl font-bold">{selected.country_name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Country code: {selected.country_code}</p>
                  </div>
                  <span className="border border-border px-2.5 py-1 text-[11px] font-medium">
                    {selected.verification_status === "verified" ? "Country guidance verified" : "General guidance · research pending"}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {selected.ghana_application_summary || "Check the Ghanaian institution's official international-admissions page for requirements that apply to your qualification."}
                </p>
                {selected.verification_status !== "verified" && (
                  <p className="mt-4 border-l-2 border-border pl-3 text-xs leading-5 text-muted-foreground">
                    This country entry is not individually verified yet. Treat it as a starting checklist only; it does not confirm that a specific qualification will be accepted.
                  </p>
                )}
                {steps.length > 0 && (
                  <ol className="mt-5 space-y-4">
                    {steps.map((step, index) => (
                      <li key={String(step.step ?? index) + "-" + String(step.title ?? "")} className="flex gap-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center border border-border text-xs font-semibold">{step.step ?? index + 1}</span>
                        <div>
                          <h3 className="text-sm font-semibold">{step.title || "Application step"}</h3>
                          {step.detail && <p className="mt-1 text-sm leading-5 text-muted-foreground">{step.detail}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
                {!!selected.qualification_examples?.length && (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold">Qualifications to check</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selected.qualification_examples.map(value => <span key={value} className="border border-border px-2.5 py-1 text-xs">{value}</span>)}
                    </div>
                  </div>
                )}
                {!!sources.length && (
                  <div className="mt-5 border-t border-border pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sources</h3>
                    <div className="mt-2 flex flex-wrap gap-3">
                      {sources.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary">Official source {index + 1} <ExternalLink className="h-3 w-3" /></a>)}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex min-h-64 flex-col justify-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary">How to use this directory</p>
                <h2 className="mt-2 text-xl font-semibold">Select a country to see the starting steps</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">The directory covers {countries.length || "multiple"} countries. Some entries contain only general guidance and are clearly marked until country-specific admissions sources are checked.</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <header className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Published qualification evidence</p>
            <h2 className="mt-1 text-2xl font-bold">Qualification pathways from official sources</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">These are published rules from selected Ghanaian institutions. They are institution-level guidance, not a guarantee of admission to every programme.</p>
          </header>
          {pathwaysQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading verified pathways…</p> : pathwaysQuery.isError ? <p className="text-sm text-destructive">Verified pathway rules could not be loaded.</p> : (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {(pathwaysQuery.data ?? []).map(rule => (
                <article key={rule.id} className="border border-border bg-card p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <h3 className="font-semibold">{rule.institution?.short_name || rule.institution?.name || "Ghanaian institution"}</h3>
                    <span className="border border-border px-2 py-0.5 text-[10px] font-semibold text-primary">Source verified</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{qualificationLabels[rule.qualification_code] || rule.qualification_code.replaceAll("_", " ")}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{rule.academic_level || "Programme level not specified"}</p>
                  {rule.notes && <p className="mt-3 text-sm leading-5 text-muted-foreground">{rule.notes}</p>}
                  {rule.source_url && <a href={rule.source_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary">Read official requirement <ExternalLink className="h-3.5 w-3.5" /></a>}
                </article>
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">
          Always verify current requirements with the institution and, where applicable, the Ghana Tertiary Education Commission (GTEC). Country directory coverage does not mean every listed qualification has been researched or recognised.
        </p>
      </main>
    </div>
  );
}
