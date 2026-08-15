import { Link, useParams } from "@/lib/router-compat";
import { ArrowLeft, Loader2, MapPin, ShieldCheck, Wallet, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo, { breadcrumbLd } from "@/components/Seo";
import Footer from "@/components/Footer";
import SaveButton from "@/components/SaveButton";
import OfficialLink from "@/components/OfficialLink";
import { formatVerified, useProgrammes, useUniversity } from "@/hooks/useCatalogue";
import { useTrackView } from "@/hooks/useTracking";

const UniversityProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: uni, isLoading, isError, refetch } = useUniversity(slug);
  useTrackView("university_view", "university", slug);
  const { data: programmes, isLoading: loadingProgrammes } = useProgrammes(uni?.id);

  return (
    <div className="min-h-screen bg-background">
      {uni && (
        <Seo
          title={`${uni.name} — Programmes & Admissions | GhanaPathFinder`}
          description={(uni.description || `${uni.name}${uni.location ? ` in ${uni.location}` : ""}: accreditation status, programmes, tuition range and admissions information.`).slice(0, 155)}
          path={`/university/${uni.slug}`}
          jsonLd={[
            {
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              name: uni.name,
              alternateName: uni.short_name ?? undefined,
              description: uni.description ?? undefined,
              url: uni.website_url ?? undefined,
              address: {
                "@type": "PostalAddress",
                addressLocality: uni.location ?? undefined,
                addressRegion: uni.region ?? undefined,
                addressCountry: uni.country,
              },
            },
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: "Universities", path: "/search?kind=university" },
              { name: uni.name, path: `/university/${uni.slug}` },
            ]),
          ]}
        />
      )}
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/search?kind=university"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to search
          </Link>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading university…
            </div>
          )}

          {isError && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground mb-3">
                Something went wrong loading this information. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && !uni && (
            <p className="text-center py-10 text-muted-foreground">
              We couldn't find that university. Try searching again.
            </p>
          )}

          {uni && (
            <>
              <header className="bg-glass rounded-xl p-5 mb-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground break-words">
                      {uni.name}
                    </h1>
                    {uni.short_name && (
                      <p className="text-sm text-muted-foreground">{uni.short_name}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      uni.type === "Public"
                        ? "bg-ghana-green/20 text-ghana-green"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {uni.type}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {uni.location} · {uni.country}
                  </span>
                  {uni.admission_aggregate && (
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-3.5 w-3.5 text-primary" /> Aggregate {uni.admission_aggregate}
                    </span>
                  )}
                  {uni.tuition_range && (
                    <span className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-primary" /> {uni.tuition_range}
                    </span>
                  )}
                </div>

                {uni.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-2">{uni.description}</p>
                )}
                {uni.campus_vibe && (
                  <p className="text-sm text-muted-foreground leading-relaxed">{uni.campus_vibe}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-5">
                  <SaveButton
                    item={{
                      item_type: "university",
                      item_key: uni.slug,
                      title: uni.name,
                      subtitle: uni.location,
                      metadata: { website_url: uni.website_url, type: uni.type },
                    }}
                    label="Save university"
                  />
                  <OfficialLink href={uni.website_url} label="Visit official website" />
                  {uni.admissions_url && (
                    <OfficialLink href={uni.admissions_url} label="Visit admissions page" variant="ghost" />
                  )}
                  {uni.financial_aid_url && (
                    <OfficialLink href={uni.financial_aid_url} label="Financial aid" variant="ghost" />
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-ghana-green" />
                    {uni.accreditation_status ? `${uni.accreditation_status} · ` : ""}
                    {formatVerified(uni.last_verified_at)}
                  </p>
                  {uni.source_url && (
                    <p className="text-[11px] text-muted-foreground break-all">
                      Source:{" "}
                      <a
                        href={uni.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {uni.source_url.includes("nmc.gov.gh")
                          ? "Nursing and Midwifery Council of Ghana"
                          : uni.source_url.includes("gtec.edu.gh")
                            ? "Ghana Tertiary Education Commission (GTEC)"
                            : uni.source_url}
                      </a>
                    </p>
                  )}
                </div>

              </header>

              <section>
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">
                  Programmes on GhanaPathFinder
                </h2>

                {loadingProgrammes && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading programmes…
                  </div>
                )}

                {!loadingProgrammes && (programmes?.length ?? 0) === 0 && (
                  <p className="text-sm text-muted-foreground py-6">
                    No programmes found for this institution yet. Check the official website for the full
                    prospectus.
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {programmes?.map((p) => (
                    <article key={p.id} className="bg-glass rounded-xl p-5 flex flex-col gap-2">
                      <h3 className="font-medium text-foreground text-sm">
                        <Link to={`/programme/${p.slug}`} className="hover:text-primary transition-colors">
                          {p.name}
                        </Link>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {[p.degree_type, p.duration, p.field].filter(Boolean).join(" • ")}
                      </p>
                      {p.wassce_requirements && (
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          <span className="text-foreground">WASSCE:</span> {p.wassce_requirements}
                        </p>
                      )}
                      {p.career_opportunities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {p.career_opportunities.slice(0, 3).map((c) => (
                            <span
                              key={c}
                              className="px-2 py-0.5 rounded-full bg-secondary text-[11px] text-muted-foreground"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 mt-auto pt-2">
                        <SaveButton
                          item={{
                            item_type: "programme",
                            item_key: p.slug,
                            title: p.name,
                            subtitle: uni.short_name ?? uni.name,
                            metadata: { university: uni.name, degree_type: p.degree_type },
                          }}
                        />
                        <Link
                          to={`/programme/${p.slug}`}
                          className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground"
                        >
                          Details
                        </Link>
                        <OfficialLink
                          href={p.application_url || p.programme_url || uni.admissions_url}
                          label="Official"
                          variant="ghost"
                        />
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UniversityProfile;
