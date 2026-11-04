import { Link, useParams } from "@/lib/router-compat";
import { ArrowLeft, Loader2, MapPin, Wallet, GraduationCap } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Seo, { breadcrumbLd } from "@/components/Seo";
import Footer from "@/components/Footer";
import SaveButton from "@/components/SaveButton";
import OfficialLink from "@/components/OfficialLink";
import InstitutionMedia from "@/components/InstitutionMedia";
import UniversityCampusImage from "@/components/UniversityCampusImage";
import FlagListingButton from "@/components/FlagListingButton";
import CampusMap from "@/components/CampusMap";
import { useProgrammes, useUniversity } from "@/hooks/useCatalogue";
import { useTrackView } from "@/hooks/useTracking";
import { useRecordRecent } from "@/hooks/useRecentlyViewed";

const displayAccreditationStatus = (status: string | null | undefined, verified: boolean) => {
  if (!status) return "Status not confirmed";
  const normalized = status.trim().toLowerCase();
  if (/needs verification|not verified|unverified|unknown|pending review/.test(normalized)) {
    return "Status not confirmed";
  }
  if (/expired|suspended|revoked|unaccredited/.test(normalized)) {
    return status + (verified ? "" : " · confirm current standing with the regulator");
  }
  return verified ? status : status + " · source-listed, current status not independently confirmed";
};

const UniversityProfile = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: uni, isLoading, isError, refetch } = useUniversity(slug);
  useTrackView("university_view", "university", slug);
  useRecordRecent(
    uni ? { kind: "university" as const, title: uni.name, subtitle: uni.location ?? undefined, path: `/university/${uni.slug}` } : null,
  );
  const { data: programmes, isLoading: loadingProgrammes } = useProgrammes(uni?.id);
  const supportingSources = (uni?.source_urls ?? []).filter((url) => Boolean(url) && url !== uni?.source_url).slice(0, 3);
  const institutionProfile = uni?.institution_profile ?? {};
  const verifiedRegulatoryItems = Array.isArray(uni?.achievements)
    ? uni.achievements.filter((achievement) => achievement.verified && Boolean(achievement.title?.trim()) && Boolean(achievement.source_url?.trim()))
    : [];
  const profileMilestones = Array.isArray(institutionProfile.milestones)
    ? institutionProfile.milestones.filter((item) => item.verified && Boolean(item.title?.trim()) && Boolean(item.source_url?.trim()))
    : [];
  const profileSources = Array.isArray(institutionProfile.sources)
    ? institutionProfile.sources.filter((source) => Boolean(source.url?.trim()))
    : [];
  const gtecSourceUrl = (uni?.source_urls ?? []).find((url) => url.includes("gtec.edu.gh"));
  const gtecRegistryStatus = uni?.gtec_accreditation_status?.match(/^(Active|Expired) per GTEC/)?.[1] ?? null;

  return (
    <div className="min-h-screen bg-background">
      {uni && (
        <Seo
          jsonLdOnly
          title={`${uni.name} , Programmes & Admissions | GhanaPathFinder`}
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
              <section aria-label="University campus and identity media" className="mb-5">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Campus, logo and university photographs</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <InstitutionMedia websiteUrl={uni.website_url} name={uni.name} logoSourceUrl={uni.logo_source_url} googlePlaceId={uni.google_place_id} variant="card" />
                  <UniversityCampusImage name={uni.name} location={uni.location} placeId={uni.google_place_id} />
                </div>
              </section>

              <header className="bg-glass rounded-xl p-5 mb-6 mt-4">
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

                <section className="mt-4 border-t border-border pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">About the institution</h2>
                    <span className="border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {institutionProfile.profile_status === "researched" ? "Researched profile" : institutionProfile.profile_status === "partial" ? "Partially researched" : "Profile research pending"}
                    </span>
                  </div>
                  {(institutionProfile.overview || uni.biography) ? (
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {institutionProfile.overview || uni.biography}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      A full institutional profile has not yet been researched for this entry. GhanaPathFinder will publish the school’s history, specialisms and reputation only when these can be confirmed from official institutional or regulator sources.
                    </p>
                  )}
                  {(uni.biography_source_url || profileSources.length > 0 || supportingSources.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {uni.biography_source_url && (
                        <a href={uni.biography_source_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center border border-border bg-secondary px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                          Official profile source
                        </a>
                      )}
                      {profileSources.map((source) => (
                        <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center border border-border bg-secondary px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                          {source.label || "Official source"}
                        </a>
                      ))}
                      {supportingSources.map((url) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center border border-border bg-secondary px-3 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                          Supporting source
                        </a>
                      ))}
                    </div>
                  )}
                </section>

                {institutionProfile.history && (
                  <section className="mt-4 border-t border-border pt-4">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">History and development</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{institutionProfile.history}</p>
                  </section>
                )}

                {Array.isArray(institutionProfile.what_known_for) && institutionProfile.what_known_for.length > 0 && (
                  <section className="mt-4 border-t border-border pt-4">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">What this school is known for</h2>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                      {institutionProfile.what_known_for.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </section>
                )}

                {Array.isArray(institutionProfile.academic_strengths) && institutionProfile.academic_strengths.length > 0 && (
                  <section className="mt-4 border-t border-border pt-4">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">Academic strengths and areas of study</h2>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                      {institutionProfile.academic_strengths.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </section>
                )}

                {Array.isArray(institutionProfile.schools_and_faculties) && institutionProfile.schools_and_faculties.length > 0 && (
                  <section className="mt-4 border-t border-border pt-4">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">Schools, faculties and institutes</h2>
                    <ul className="grid gap-1.5 sm:grid-cols-2">
                      {institutionProfile.schools_and_faculties.map((item, index) => <li key={index} className="border border-border px-3 py-2 text-sm text-muted-foreground">{item}</li>)}
                    </ul>
                  </section>
                )}

                {Array.isArray(institutionProfile.research_and_innovation) && institutionProfile.research_and_innovation.length > 0 && (
                  <section className="mt-4 border-t border-border pt-4">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">Research, innovation and partnerships</h2>
                    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                      {institutionProfile.research_and_innovation.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                  </section>
                )}

                {(institutionProfile.campus_and_student_life || (Array.isArray(institutionProfile.facilities) && institutionProfile.facilities.length > 0)) && (
                  <section className="mt-4 border-t border-border pt-4">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">Campus, facilities and student life</h2>
                    {institutionProfile.campus_and_student_life && <p className="text-sm leading-relaxed text-muted-foreground">{institutionProfile.campus_and_student_life}</p>}
                    {Array.isArray(institutionProfile.facilities) && institutionProfile.facilities.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
                        {institutionProfile.facilities.map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    )}
                  </section>
                )}

                {Array.isArray(institutionProfile.notable_alumni) && institutionProfile.notable_alumni.length > 0 && (
                  <section className="mt-4 border-t border-border pt-4">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">Notable alumni</h2>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {institutionProfile.notable_alumni.map((alumnus, index) => (
                        <article key={alumnus.name + index} className="border border-border p-3">
                          <h3 className="text-sm font-semibold text-foreground">{alumnus.name}</h3>
                          {alumnus.description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{alumnus.description}</p>}
                          {alumnus.source_url && <a href={alumnus.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">Source</a>}
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {profileMilestones.length > 0 && (
                  <section className="mt-4 border-t border-border pt-4">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">Achievements and institutional milestones</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {profileMilestones.map((milestone, index) => (
                        <article key={milestone.title + milestone.source_url + index} className="border border-border bg-background/50 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-foreground">{milestone.title}</h3>
                            {milestone.year && <span className="shrink-0 text-xs text-muted-foreground">{milestone.year}</span>}
                          </div>
                          {milestone.description && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{milestone.description}</p>}
                          <a href={milestone.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">View source</a>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {verifiedRegulatoryItems.length > 0 && (
                  <section className="mt-4 border-t border-border pt-4">
                    <h2 className="mb-2 text-sm font-semibold text-foreground">Accreditation and regulatory recognition</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {verifiedRegulatoryItems.map((item, index) => (
                        <article key={item.title + item.source_url + index} className="border border-border bg-background/50 p-3">
                          <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                          {item.description && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>}
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline">{item.source_name || "View source"}</a>
                        </article>
                      ))}
                    </div>
                  </section>
                )}
                {uni.campus_vibe && (
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{uni.campus_vibe}</p>
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
                  {gtecRegistryStatus && (
                    <p className="text-xs text-muted-foreground">
                      GTEC institution-register listing: <span className="font-semibold text-foreground">{gtecRegistryStatus}</span>
                      {gtecSourceUrl && (
                        <>
                          {" · "}
                          <a href={gtecSourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            View GTEC source
                          </a>
                        </>
                      )}
                    </p>
                  )}
                  {uni.accreditation_status && (
                    <p className="text-xs text-muted-foreground">
                      Accreditation status: {displayAccreditationStatus(uni.accreditation_status, uni.verified)}
                      {uni.last_verified_at
                        ? ` · Last checked ${new Date(uni.last_verified_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`
                        : ""}
                    </p>
                  )}
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

              {(uni.admission_info || uni.scholarship_info) && (
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {uni.admission_info && (
                    <div className="bg-glass rounded-xl p-5">
                      <h2 className="font-display text-base font-semibold text-foreground mb-2">
                        Admission requirements
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {uni.admission_info}
                      </p>
                    </div>
                  )}
                  {uni.scholarship_info && (
                    <div className="bg-glass rounded-xl p-5">
                      <h2 className="font-display text-base font-semibold text-foreground mb-2">
                        Fees &amp; financial support
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                        {uni.scholarship_info}
                      </p>
                    </div>
                  )}
                </section>
              )}

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

              <section className="bg-glass rounded-xl p-4">
                <h2 className="font-display text-base font-semibold text-foreground">Student experiences</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Read and share what students say about {uni.name} in the Community. Community posts are
                  student experiences, not official university information.
                </p>
                <Link
                  to="/community"
                  className="mt-3 inline-flex items-center min-h-[44px] px-4 rounded-lg bg-secondary text-sm font-medium text-foreground"
                >
                  Open Community
                </Link>
              </section>

              <CampusMap name={uni.name} location={uni.location} placeId={uni.google_place_id} />

              <div className="pt-2">
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
