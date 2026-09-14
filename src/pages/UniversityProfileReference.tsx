import { Link, useParams } from "@/lib/router-compat";
import { ArrowLeft, ArrowUpRight, CalendarDays, CheckCircle2, ExternalLink, GraduationCap, Landmark, Link2, Loader2, MapPin, ShieldCheck, Wallet } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Seo, { breadcrumbLd } from "@/components/Seo";
import Footer from "@/components/Footer";
import SaveButton from "@/components/SaveButton";
import OfficialLink from "@/components/OfficialLink";
import InstitutionMedia from "@/components/InstitutionMedia";
import VerificationBadge from "@/components/VerificationBadge";
import FlagListingButton from "@/components/FlagListingButton";
import CampusMap from "@/components/CampusMap";
import { formatVerified, useProgrammes, useUniversity } from "@/hooks/useCatalogue";
import { useTrackView } from "@/hooks/useTracking";
import { useRecordRecent } from "@/hooks/useRecentlyViewed";

const ORANGE = "#E77917";

const Fact = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 border-b border-border/60 py-4 last:border-b-0">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="min-w-0 flex-1">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-1 break-words text-sm font-medium text-foreground">{value}</dd>
      </div>
    </div>
  );
};

const UniversityProfileReference = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: uni, isLoading, isError, refetch } = useUniversity(slug);
  const { data: programmes, isLoading: loadingProgrammes } = useProgrammes(uni?.id);

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

  const popularProgrammes = (programmes ?? []).slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {uni && (
        <Seo
          jsonLdOnly
          title={`${uni.name} | Programmes, Admissions & University Details | GhanaPathFinder`}
          description={(uni.description || `${uni.name}: programmes, admissions, fees and university information.`).slice(0, 155)}
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

      <main className="px-4 pb-16 pt-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/search?kind=university"
            className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Universities
          </Link>

          {isLoading && (
            <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading university…
            </div>
          )}

          {isError && (
            <div className="mx-auto max-w-lg py-20 text-center">
              <p className="mb-4 text-sm text-muted-foreground">Something went wrong loading this university.</p>
              <button onClick={() => refetch()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Retry</button>
            </div>
          )}

          {!isLoading && !isError && !uni && (
            <div className="py-20 text-center text-sm text-muted-foreground">We couldn't find that university.</div>
          )}

          {uni && (
            <>
              <section className="mb-5 grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_440px] lg:items-center">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    {uni.type && (
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">{uni.type}</span>
                    )}
                    {(uni.verification_status === "verified" || uni.verified) && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-foreground">
                        <ShieldCheck className="h-3.5 w-3.5" /> Verified
                      </span>
                    )}
                  </div>

                  <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{uni.name}</h1>
                  {uni.short_name && <p className="mt-2 text-base text-muted-foreground">{uni.short_name}</p>}

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    {uni.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {uni.location}{uni.region ? `, ${uni.region}` : ""}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <SaveButton
                      item={{
                        item_type: "university",
                        item_key: uni.slug,
                        title: uni.name,
                        subtitle: uni.location,
                        metadata: { website_url: uni.website_url, type: uni.type },
                      }}
                      label="Save University"
                    />
                    <OfficialLink href={uni.website_url} label="Official Website" />
                  </div>
                </div>

                <div className="w-full">
                  <InstitutionMedia
                    websiteUrl={uni.website_url}
                    name={uni.name}
                    logoSourceUrl={uni.logo_source_url}
                    googlePlaceId={uni.google_place_id}
                    variant="hero"
                  />
                </div>
              </section>

              <nav className="mb-6 overflow-x-auto border-b border-border" aria-label="University sections">
                <div className="flex min-w-max items-center gap-7">
                  {[
                    ["Overview", "#overview"],
                    ["Programmes", "#programmes"],
                    ["Admissions", "#admissions"],
                    ["Scholarships", "#scholarships"],
                    ["Contact", "#contact"],
                  ].map(([label, href], index) => (
                    <a
                      key={href}
                      href={href}
                      className={`relative py-4 text-sm font-medium ${index === 0 ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {label}
                      {index === 0 && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
                    </a>
                  ))}
                </div>
              </nav>

              <section id="overview" className="scroll-mt-24 grid grid-cols-1 gap-7 lg:grid-cols-[minmax(0,1fr)_380px]">
                <div className="min-w-0 space-y-8">
                  <div className="overflow-hidden rounded-xl border border-border bg-background">
                    <InstitutionMedia
                      websiteUrl={uni.website_url}
                      name={uni.name}
                      logoSourceUrl={uni.logo_source_url}
                      googlePlaceId={uni.google_place_id}
                      variant="hero"
                    />
                  </div>

                  {uni.description && (
                    <div>
                      <h2 className="mb-3 text-2xl font-bold text-foreground">About {uni.name}</h2>
                      <p className="max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">{uni.description}</p>
                      {uni.campus_vibe && <p className="mt-4 max-w-4xl text-sm leading-7 text-muted-foreground sm:text-base">{uni.campus_vibe}</p>}
                    </div>
                  )}

                  <div>
                    <h2 className="mb-4 text-2xl font-bold text-foreground">Why consider this university?</h2>
                    <div className="space-y-3">
                      {[
                        "Official institutional information in one place",
                        "Programmes, admissions and fee guidance",
                        "Verified status and source-aware university data",
                        "Direct links to official university resources",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <section id="programmes" className="scroll-mt-24">
                    <div className="mb-4 flex items-end justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">Popular Programmes</h2>
                        <p className="mt-1 text-sm text-muted-foreground">Programmes currently listed on GhanaPathFinder.</p>
                      </div>
                      <Link to="/programmes" className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline">View all <ArrowUpRight className="h-4 w-4" /></Link>
                    </div>

                    {loadingProgrammes && <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading programmes…</div>}
                    {!loadingProgrammes && popularProgrammes.length === 0 && (
                      <div className="rounded-xl border border-border p-5 text-sm text-muted-foreground">No programmes are listed yet. Check the official university website for the complete programme list.</div>
                    )}
                    {!loadingProgrammes && popularProgrammes.length > 0 && (
                      <div className="overflow-hidden rounded-xl border border-border">
                        {popularProgrammes.map((programme) => (
                          <Link key={programme.id} to={`/programme/${programme.slug}`} className="group flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-b-0 hover:bg-secondary/40">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">{programme.name}</p>
                              <p className="mt-1 text-xs text-muted-foreground">{[programme.degree_type, programme.duration, programme.field].filter(Boolean).join(" • ")}</p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                          </Link>
                        ))}
                      </div>
                    )}
                  </section>

                  <section id="admissions" className="scroll-mt-24">
                    <h2 className="mb-4 text-2xl font-bold text-foreground">Admissions & Fees</h2>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-border p-5">
                        <div className="mb-3 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /><h3 className="font-semibold">Admission information</h3></div>
                        {uni.admission_aggregate && <p className="mb-3 text-sm text-muted-foreground">Typical admission aggregate: <span className="font-medium text-foreground">{uni.admission_aggregate}</span></p>}
                        <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{uni.admission_info || "Check the official admissions page for current requirements."}</p>
                      </div>
                      <div className="rounded-xl border border-border p-5">
                        <div className="mb-3 flex items-center gap-2"><Wallet className="h-5 w-5 text-primary" /><h3 className="font-semibold">Fees & financial support</h3></div>
                        {uni.tuition_range && <p className="mb-3 text-sm text-muted-foreground">Tuition guidance: <span className="font-medium text-foreground">{uni.tuition_range}</span></p>}
                        <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{uni.scholarship_info || "Check the university and GhanaPathFinder scholarship listings for available support."}</p>
                      </div>
                    </div>
                  </section>

                  <section id="scholarships" className="scroll-mt-24">
                    <h2 className="mb-3 text-2xl font-bold text-foreground">Scholarships</h2>
                    <div className="rounded-xl border border-border p-5 text-sm leading-6 text-muted-foreground">
                      {uni.scholarship_info || "Scholarship information is not currently listed for this institution. Check the official university website and GhanaPathFinder scholarship listings."}
                    </div>
                  </section>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                  <div className="rounded-xl border border-border bg-background p-5">
                    <h2 className="mb-2 text-xl font-bold text-foreground">Quick Information</h2>
                    <dl>
                      <Fact icon={<Landmark className="h-4 w-4" />} label="Type" value={uni.type} />
                      <Fact icon={<MapPin className="h-4 w-4" />} label="Location" value={uni.location ? `${uni.location}${uni.region ? `, ${uni.region}` : ""}` : null} />
                      <Fact icon={<CalendarDays className="h-4 w-4" />} label="Founded" value={uni.founded_year ? String(uni.founded_year) : null} />
                      <Fact icon={<Link2 className="h-4 w-4" />} label="Website" value={uni.website_url?.replace(/^https?:\/\//, "").replace(/\/$/, "")} />
                      <Fact icon={<ShieldCheck className="h-4 w-4" />} label="Accreditation" value={uni.accreditation_status} />
                    </dl>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-4">
                    <Link
                      to={`/admission-match?university=${encodeURIComponent(uni.slug)}`}
                      className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: ORANGE }}
                    >
                      <GraduationCap className="h-4 w-4" /> Check Your Match
                    </Link>
                  </div>

                  <div id="contact" className="scroll-mt-24 rounded-xl border border-border bg-background p-5">
                    <h2 className="mb-3 text-xl font-bold text-foreground">Contact</h2>
                    <div className="space-y-2">
                      <OfficialLink href={uni.website_url} label="Official website" />
                      {uni.admissions_url && <OfficialLink href={uni.admissions_url} label="Admissions" variant="ghost" />}
                      {uni.financial_aid_url && <OfficialLink href={uni.financial_aid_url} label="Financial aid" variant="ghost" />}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-5">
                    <div className="mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /><h2 className="font-semibold">Campus</h2></div>
                    <CampusMap name={uni.name} location={uni.location} region={uni.region} />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <FlagListingButton itemType="university" itemKey={uni.slug} itemName={uni.name} />
                    <VerificationBadge status={uni.verification_status} />
                  </div>
                </aside>
              </section>

              <div className="mt-8 border-t border-border pt-5 text-xs text-muted-foreground">
                {formatVerified(uni.last_verified_at)}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UniversityProfileReference;
