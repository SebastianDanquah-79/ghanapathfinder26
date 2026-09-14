import { Link, useParams } from "@/lib/router-compat";
import { ArrowLeft, Loader2, MapPin, ShieldCheck, Wallet, GraduationCap } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Seo, { breadcrumbLd } from "@/components/Seo";
import Footer from "@/components/Footer";
import SaveButton from "@/components/SaveButton";
import OfficialLink from "@/components/OfficialLink";
import VerificationBadge from "@/components/VerificationBadge";
import InstitutionMedia from "@/components/InstitutionMedia";
import FlagListingButton from "@/components/FlagListingButton";
import CampusMap from "@/components/CampusMap";
import { formatVerified, useProgrammes, useUniversities, useUniversity } from "@/hooks/useCatalogue";
import { useTrackView } from "@/hooks/useTracking";
import { useRecordRecent } from "@/hooks/useRecentlyViewed";

const Fact = ({ label, value }: { label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="border-b border-border/60 py-3 last:border-b-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-foreground break-words">{value}</dd>
    </div>
  );
};

const UniversityProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: uni, isLoading, isError, refetch } = useUniversity(slug);
  useTrackView("university_view", "university", slug);
  useRecordRecent(
    uni
      ? {
          kind: "university" as const,
          title: uni.name,
          subtitle: uni.location ?? undefined,
          path: `/university/${uni.slug}`,
        }
      : null,
  );

  const { data: programmes, isLoading: loadingProgrammes } = useProgrammes(uni?.id);
  const { data: regionalUniversities } = useUniversities({
    region: uni?.region ?? undefined,
    pageSize: 24,
  });

  const relatedUniversities = (regionalUniversities?.rows ?? [])
    .filter((item) => item.id !== uni?.id)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-background">
      {uni && (
        <Seo
          jsonLdOnly
          title={`${uni.name} | Programmes, Admissions & University Details | GhanaPathFinder`}
          description={
            (
              uni.description ||
              `${uni.name}${uni.location ? ` in ${uni.location}` : ""}: accreditation, programmes, admissions, fees and university information.`
            ).slice(0, 155)
          }
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

      <main className="pt-20 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/search?kind=university"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to universities
          </Link>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading university…
            </div>
          )}

          {isError && (
            <div className="text-center py-16">
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
            <p className="text-center py-16 text-muted-foreground">
              We couldn't find that university. Try searching again.
            </p>
          )}

          {uni && (
            <>
              {/* University identity, following the same information hierarchy as the reference school page. */}
              <section className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-6 items-start">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {uni.type && (
                        <span className="px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
                          {uni.type}
                        </span>
                      )}
                      {uni.verification_status === "verified" || uni.verified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-xs font-medium text-foreground">
                          <ShieldCheck className="h-3.5 w-3.5 text-ghana-green" /> Verified
                        </span>
                      ) : null}
                    </div>

                    <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground break-words">
                      {uni.name}
                    </h1>
                    {uni.short_name && (
                      <p className="mt-1 text-base text-muted-foreground">{uni.short_name}</p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      {uni.location && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> {uni.location}
                          {uni.region ? `, ${uni.region}` : ""}
                        </span>
                      )}
                      {uni.country && <span>{uni.country}</span>}
                    </div>

                    {uni.description && (
                      <p className="mt-5 max-w-3xl text-sm sm:text-base leading-7 text-muted-foreground">
                        {uni.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-6">
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
                      <OfficialLink href={uni.website_url} label="Official website" />
                      {uni.admissions_url && (
                        <OfficialLink href={uni.admissions_url} label="Admissions" variant="ghost" />
                      )}
                      {uni.financial_aid_url && (
                        <OfficialLink href={uni.financial_aid_url} label="Financial aid" variant="ghost" />
                      )}
                    </div>
                  </div>

                  <div className="order-first lg:order-none">
                    <InstitutionMedia
                      websiteUrl={uni.website_url}
                      name={uni.name}
                      logoSourceUrl={uni.logo_source_url}
                      googlePlaceId={uni.google_place_id}
                      variant="hero"
                    />
                  </div>
                </div>
              </section>

              {/* University Information */}
              <section className="border-t border-border pt-7 mb-8">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">University Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 border-y border-border/60">
                  <dl><Fact label="Type" value={uni.type} /><Fact label="Category" value={uni.category} /></dl>
                  <dl><Fact label="Location" value={uni.location} /><Fact label="Region" value={uni.region} /></dl>
                  <dl><Fact label="Country" value={uni.country} /><Fact label="Accreditation" value={uni.accreditation_status} /></dl>
                </div>
              </section>

              {/* GhanaPathFinder profile/status, analogous to the reference score block without inventing a ranking. */}
              <section className="mb-8 border border-border rounded-xl p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">GhanaPathFinder Profile</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Verification and institutional status for this university.
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-medium text-foreground">
                      {uni.accreditation_status || "Status available"}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatVerified(uni.last_verified_at)}
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg bg-secondary/60 p-4">
                    <p className="text-xs text-muted-foreground">Institution type</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{uni.type || "Not listed"}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-4">
                    <p className="text-xs text-muted-foreground">Accreditation</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{uni.accreditation_status || "Not listed"}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/60 p-4">
                    <p className="text-xs text-muted-foreground">Last verified</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{formatVerified(uni.last_verified_at).replace("Last verified: ", "")}</p>
                  </div>
                </div>
              </section>

              {/* About */}
              {uni.description && (
                <section className="mb-8">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-3">About {uni.name}</h2>
                  <div className="max-w-4xl text-sm sm:text-base leading-7 text-muted-foreground">
                    <p>{uni.description}</p>
                    {uni.campus_vibe && <p className="mt-4">{uni.campus_vibe}</p>}
                  </div>
                </section>
              )}

              {/* Admissions and fees */}
              {(uni.admission_info || uni.scholarship_info || uni.admission_aggregate || uni.tuition_range) && (
                <section className="mb-8">
                  <h2 className="font-display text-xl font-semibold text-foreground mb-4">Admissions &amp; Fees</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Admission information</h3>
                      </div>
                      {uni.admission_aggregate && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Typical admission aggregate: <span className="font-medium text-foreground">{uni.admission_aggregate}</span>
                        </p>
                      )}
                      {uni.admission_info ? (
                        <p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">{uni.admission_info}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Check the official admissions page for current requirements.</p>
                      )}
                    </div>

                    <div className="border border-border rounded-xl p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Wallet className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-foreground">Fees &amp; financial support</h3>
                      </div>
                      {uni.tuition_range && (
                        <p className="text-sm text-muted-foreground mb-3">
                          Tuition guidance: <span className="font-medium text-foreground">{uni.tuition_range}</span>
                        </p>
                      )}
                      {uni.scholarship_info ? (
                        <p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">{uni.scholarship_info}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">Check the university and GhanaPathFinder scholarship listings for available support.</p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              {/* Programmes */}
              <section className="mb-8 border-t border-border pt-7">
                <div className="flex items-end justify-between gap-4 mb-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-foreground">Programmes Offered</h2>
                    <p className="text-sm text-muted-foreground mt-1">Academic programmes listed on GhanaPathFinder.</p>
                  </div>
                  <Link to="/programmes" className="text-sm font-medium text-primary hover:underline shrink-0">
                    View all programmes
                  </Link>
                </div>

                {loadingProgrammes && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-8">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading programmes…
                  </div>
                )}

                {!loadingProgrammes && (programmes?.length ?? 0) === 0 && (
                  <div className="border border-border rounded-xl p-5">
                    <p className="text-sm text-muted-foreground">
                      No programmes are listed for this institution yet. Check the official university website for the complete programme list.
                    </p>
                  </div>
                )}

                {!loadingProgrammes && (programmes?.length ?? 0) > 0 && (
                  <div className="divide-y divide-border border-y border-border">
                    {programmes?.map((p) => (
                      <article key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-foreground text-sm sm:text-base">
                            <Link to={`/programme/${p.slug}`} className="hover:text-primary transition-colors">
                              {p.name}
                            </Link>
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {[p.degree_type, p.duration, p.field].filter(Boolean).join(" • ")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
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
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {/* Verification */}
              <section className="mb-8 border border-border rounded-xl p-5">
                <h2 className="font-display text-lg font-semibold text-foreground mb-3">Verification</h2>
                <VerificationBadge
                  verified={uni.verification_status === "verified" || uni.verified}
                  lastVerifiedAt={uni.last_verified_at}
                  sourceUrl={uni.source_url ?? uni.website_url}
                  sourceName={
                    uni.source_url?.includes("nmc.gov.gh")
                      ? "Nursing and Midwifery Council of Ghana"
                      : uni.source_url?.includes("gtec.edu.gh")
                        ? "Ghana Tertiary Education Commission (GTEC)"
                        : `${uni.name} official website`
                  }
                  subject={uni.name}
                  whatVerified="Institution identity, accreditation information, location and listed university data."
                />
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-ghana-green" />
                  {uni.accreditation_status ? `${uni.accreditation_status} · ` : ""}
                  {formatVerified(uni.last_verified_at)}
                </p>
              </section>

              {/* Location */}
              <section className="mb-8">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Location</h2>
                <CampusMap name={uni.name} location={uni.location} placeId={uni.google_place_id} />
              </section>

              {/* Contact */}
              <section className="mb-8 border-t border-border pt-7">
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Contact Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-xl p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Address</p>
                    <p className="text-sm text-foreground mt-1">{[uni.location, uni.region, uni.country].filter(Boolean).join(", ") || "Not listed"}</p>
                  </div>
                  <div className="border border-border rounded-xl p-5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Official links</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <OfficialLink href={uni.website_url} label="Official website" />
                      {uni.admissions_url && <OfficialLink href={uni.admissions_url} label="Admissions" variant="ghost" />}
                      {uni.financial_aid_url && <OfficialLink href={uni.financial_aid_url} label="Financial aid" variant="ghost" />}
                    </div>
                  </div>
                </div>
              </section>

              {/* Related universities */}
              {relatedUniversities.length > 0 && (
                <section className="mb-8 border-t border-border pt-7">
                  <h2 className="font-display text-xl font-semibold text-foreground">Similar Universities</h2>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Other universities in {uni.region || "Ghana"} that you may want to explore.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {relatedUniversities.map((item) => (
                      <Link
                        key={item.id}
                        to={`/university/${item.slug}`}
                        className="border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-sm font-semibold text-foreground break-words">{item.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{item.location || item.region || "Ghana"}</p>
                          </div>
                          {item.type && <span className="text-[10px] text-muted-foreground shrink-0">{item.type}</span>}
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Student experiences */}
              <section className="mb-8 border-t border-border pt-7">
                <h2 className="font-display text-xl font-semibold text-foreground">Student Experiences</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  Explore student perspectives and discussions about {uni.name}. Community posts are student experiences, not official university information.
                </p>
                <Link
                  to="/community"
                  className="mt-4 inline-flex items-center min-h-[44px] px-4 rounded-lg bg-secondary text-sm font-medium text-foreground"
                >
                  Open Community
                </Link>
              </section>

              <div className="border-t border-border pt-6 flex justify-end">
                <FlagListingButton table="universities" rowId={uni.id} label={uni.name} />
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UniversityProfile;
