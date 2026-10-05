import { useEffect, useState } from "react";
import { ArrowRight, ExternalLink, Globe, Search, ShieldCheck } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";

type Country = {
  country_code: string;
  country_name: string;
  region: string;
  outbound_application_summary: string;
  outbound_application_steps: { step: number; title: string; detail: string }[];
  outbound_official_portal_url: string | null;
  outbound_source_urls: string[];
  ghana_application_summary: string;
  ghana_application_steps: { step: number; title: string; detail: string }[];
  ghana_source_urls: string[];
  qualification_examples: string[];
  verification_status: string;
  last_verified_at: string | null;
};

const InternationalDirectory = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCode, setSelectedCode] = useState("DE");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("international_country_directory")
      .select("*")
      .order("country_name")
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          console.error(error);
          setLoading(false);
          return;
        }
        setCountries((data ?? []) as Country[]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = countries.filter((country) =>
    country.country_name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selected = countries.find((country) => country.country_code === selectedCode) ?? filtered[0];

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="International Directory | GhanaPathFinder"
        description="Explore every country and learn how to apply to universities there and how students from that country can apply to Ghanaian universities."
        path="/international-directory"
      />
      <Navbar />
      <main className="px-4 pb-16 pt-24 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <section className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Globe className="h-4 w-4" />
              Global education directory
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
              International Directory
            </h1>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
              Select a country to see the application pathway for studying there and the pathway for applicants from that country who want to study in Ghana.
            </p>
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[330px_1fr]">
            <aside className="rounded-2xl border border-border bg-card p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search countries"
                  className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="mt-4 max-h-[620px] space-y-1 overflow-y-auto">
                {loading ? (
                  <p className="p-3 text-sm text-muted-foreground">Loading countries...</p>
                ) : (
                  filtered.map((country) => (
                    <button
                      key={country.country_code}
                      type="button"
                      onClick={() => setSelectedCode(country.country_code)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${selected?.country_code === country.country_code ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"}`}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background text-[10px] font-bold">
                        {country.country_code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{country.country_name}</span>
                    </button>
                  ))
                )}
              </div>
              <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
                {countries.length} countries in the directory.
              </p>
            </aside>

            <div>
              {selected ? (
                <div className="space-y-6">
                  <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-border bg-secondary text-sm font-bold text-primary">
                          {selected.country_code}
                        </span>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Country</p>
                          <h2 className="mt-1 font-display text-2xl font-bold text-foreground">{selected.country_name}</h2>
                          <p className="mt-1 text-xs text-muted-foreground">{selected.region}</p>
                        </div>
                      </div>
                      <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                        {selected.verification_status === "verified" ? "Official sources checked" : "Country guide needs verification"}
                      </span>
                    </div>
                    {selected.qualification_examples.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {selected.qualification_examples.map((qualification) => (
                          <span key={qualification} className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground">
                            {qualification}
                          </span>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Study there</p>
                    <h3 className="mt-1 font-display text-2xl font-bold text-foreground">How to apply to {selected.country_name}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{selected.outbound_application_summary}</p>
                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {selected.outbound_application_steps.map((item) => (
                        <article key={item.step} className="rounded-xl border border-border p-4">
                          <span className="text-xs font-semibold text-primary">Step {item.step}</span>
                          <h4 className="mt-1 text-sm font-semibold text-foreground">{item.title}</h4>
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                        </article>
                      ))}
                    </div>
                    {selected.outbound_official_portal_url && (
                      <a href={selected.outbound_official_portal_url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                        Open official application guidance <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </section>

                  <section className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Study in Ghana</p>
                    <h3 className="mt-1 font-display text-2xl font-bold text-foreground">How to apply to Ghana from {selected.country_name}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{selected.ghana_application_summary}</p>
                    <div className="mt-6 grid gap-3 md:grid-cols-2">
                      {selected.ghana_application_steps.map((item) => (
                        <article key={item.step} className="rounded-xl border border-border p-4">
                          <span className="text-xs font-semibold text-primary">Step {item.step}</span>
                          <h4 className="mt-1 text-sm font-semibold text-foreground">{item.title}</h4>
                          <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.detail}</p>
                        </article>
                      ))}
                    </div>
                    {selected.ghana_source_urls.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-3">
                        {selected.ghana_source_urls.map((url) => (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                            Official source <ExternalLink className="h-3 w-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="rounded-2xl border border-border/60 bg-secondary/40 p-5">
                    <div className="flex gap-3">
                      <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">Verify before you apply</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Admission rules, deadlines, fees, accepted qualifications and visa requirements can change. GhanaPathFinder distinguishes verified official-source guidance from country entries that still need country-specific research.
                        </p>
                      </div>
                    </div>
                  </section>

                  <Link to="/international-pathway" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Compare your qualification with Ghana pathways <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
                  Select a country to view its international application pathway.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default InternationalDirectory;
