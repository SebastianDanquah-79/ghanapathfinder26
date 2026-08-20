import { Link, useParams } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OfficialLink from "@/components/OfficialLink";
import VerificationBadge from "@/components/VerificationBadge";
import { useCompany, useCompanyInternships } from "@/hooks/useOpportunities";

const CompanyDetail = () => {
  const { slug } = useParams({ strict: false }) as { slug?: string };
  const { data: company, isLoading } = useCompany(slug);
  const { data: opportunities } = useCompanyInternships(company?.id);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-14 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/companies" className="text-xs text-primary hover:underline">
            ← All employers
          </Link>

          {isLoading && <p className="text-sm text-muted-foreground py-6">Loading employer…</p>}

          {!isLoading && !company && (
            <p className="text-sm text-muted-foreground py-6">This employer could not be found.</p>
          )}

          {company && (
            <>
              <h1 className="mt-3 font-display text-2xl font-bold text-foreground">{company.name}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {company.sector} • {company.employer_type}
                {company.location ? ` • ${company.location}` : ""}
                {company.size ? ` • ${company.size}` : ""}
              </p>

              {company.description && (
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  {company.description}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <OfficialLink href={company.careers_url} label="Careers page" />
                <OfficialLink href={company.website_url} label="Official website" variant="ghost" />
              </div>

              <div className="mt-3">
                <VerificationBadge
                  verified={company.verified}
                  lastVerifiedAt={company.last_verified_at}
                  sourceUrl={company.source_url ?? company.website_url}
                  sourceName={`${company.name} official website`}
                  subject={company.name}
                  whatVerified="Employer identity, sector and official careers page link."
                />
              </div>

              <h2 className="mt-8 font-display text-lg font-semibold text-foreground">
                Student & graduate routes
              </h2>
              {(opportunities ?? []).length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No specific intake listed yet — check the careers page above for current openings.
                </p>
              ) : (
                <div className="mt-3 space-y-3">
                  {(opportunities ?? []).map((o) => (
                    <article key={o.id} className="bg-glass rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-foreground">{o.title}</h3>
                        <span className="shrink-0 px-2 py-1 rounded text-[11px] font-medium bg-primary/15 text-primary">
                          {o.opportunity_type}
                        </span>
                      </div>
                      {o.description && (
                        <p className="mt-2 text-xs text-muted-foreground leading-snug">{o.description}</p>
                      )}
                      {o.eligibility && (
                        <p className="mt-2 text-[11px] text-muted-foreground">
                          <span className="font-medium text-foreground">Who can apply: </span>
                          {o.eligibility}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {o.careers.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-full bg-secondary text-[11px] text-muted-foreground"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3">
                        <OfficialLink href={o.application_url} label="Apply on employer site" variant="ghost" />
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CompanyDetail;
