import { useState } from "react";
import { Link, useParams } from "@/lib/router-compat";
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  ChevronDown,
  GraduationCap,
  Loader2,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo, { breadcrumbLd } from "@/components/Seo";
import Footer from "@/components/Footer";
import SaveButton from "@/components/SaveButton";
import OfficialLink from "@/components/OfficialLink";
import { useProgrammeDetail, useProgrammeMatch } from "@/hooks/useProgrammeDetail";
import { useTrackView } from "@/hooks/useTracking";
import { CATEGORY_STYLES, formatVerifiedDate } from "@/lib/admissionEngine";

const Chips = ({ items }: { items: string[] }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((i) => (
      <span key={i} className="px-2 py-0.5 rounded-full bg-secondary text-[11px] text-muted-foreground">
        {i}
      </span>
    ))}
  </div>
);

const Section = ({
  title,
  icon,
  children,
  collapsible = false,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  collapsible?: boolean;
}) => {
  const [open, setOpen] = useState(!collapsible);
  return (
    <section className="bg-glass rounded-xl p-4">
      <button
        type="button"
        onClick={() => collapsible && setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 text-left"
        aria-expanded={open}
      >
        <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-1.5">
          {icon}
          {title}
        </h2>
        {collapsible && (
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
        )}
      </button>
      {open && <div className="mt-2 space-y-2">{children}</div>}
    </section>
  );
};

const ProgrammePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading, isError, refetch } = useProgrammeDetail(slug);
  const match = useProgrammeMatch(data?.cutoffs);
  useTrackView("programme_view", "programme", slug);

  const p = data?.programme;
  const uni = data?.university;
  const info = data?.information;
  const cutoff = data?.cutoffs?.[0];
  const withSalary = (data?.careers ?? []).filter((c) => c.salary_range);

  return (
    <div className="min-h-screen bg-background">
      {p && (
        <Seo
          jsonLdOnly
          title={`${p.name}${uni?.short_name ? ` , ${uni.short_name}` : ""} | GhanaPathFinder`}
          description={(info?.short_bio || p.description || `${p.name} at ${uni?.name ?? "a Ghanaian institution"}: entry requirements, curriculum, careers and cut-off aggregates.`).slice(0, 155)}
          path={`/programme/${p.slug}`}
          jsonLd={[
            breadcrumbLd([
              { name: "Home", path: "/" },
              { name: "Programmes", path: "/programmes" },
              { name: p.name, path: `/programme/${p.slug}` },
            ]),
          ]}
        />
      )}
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/search?kind=programme"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> Back to search
          </Link>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading programme…
            </div>
          )}

          {isError && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground mb-3">Couldn't load this programme.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && !p && (
            <p className="text-center py-10 text-muted-foreground">We couldn't find that programme.</p>
          )}

          {p && (
            <div className="space-y-3">
              <header className="bg-glass rounded-xl p-4">
                <h1 className="font-display text-xl sm:text-2xl font-bold text-foreground break-words">
                  {p.name}
                </h1>
                {uni && (
                  <Link
                    to={`/university/${uni.slug}`}
                    className="text-sm text-primary hover:underline break-words"
                  >
                    {uni.name}
                  </Link>
                )}
                {info?.short_bio && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{info.short_bio}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {[
                    p.qualification || p.degree_type,
                    p.duration,
                    data?.faculty,
                    p.field,
                    info?.academic_difficulty ? `Academic demand: ${info.academic_difficulty}` : null,
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <SaveButton
                    item={{
                      item_type: "programme",
                      item_key: p.slug,
                      title: p.name,
                      subtitle: uni?.short_name ?? uni?.name ?? null,
                      metadata: { university: uni?.name, degree_type: p.degree_type },
                    }}
                  />
                  <OfficialLink
                    href={p.programme_url || p.application_url || uni?.admissions_url || null}
                    label="Official programme"
                  />
                </div>
              </header>

              {match && (
                <section className="bg-glass rounded-xl p-4">
                  <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Your match
                  </h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${CATEGORY_STYLES[match.category]}`}>
                      {match.category}
                    </span>
                    {match.confidence != null && (
                      <span className="text-xs text-muted-foreground">{match.confidence}% confidence</span>
                    )}
                    <span className="text-xs text-muted-foreground">{match.headline}</span>
                  </div>
                  {match.gaps.length > 0 && (
                    <ul className="mt-2 text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                      {match.gaps.slice(0, 3).map((g) => (
                        <li key={g}>{g}</li>
                      ))}
                    </ul>
                  )}
                </section>
              )}

              <Section title="About the programme" icon={<BookOpen className="h-4 w-4 text-primary" />}>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {info?.description ?? "Information unavailable."}
                </p>
                {info && (
                  <p className="text-[11px] text-muted-foreground">
                    {info.content_scope === "institution_and_field"
                      ? "Institution description plus typical field guidance."
                      : "Typical programme areas , not the official curriculum."}
                  </p>
                )}
              </Section>

              <Section title="What you'll learn" collapsible>
                {info?.study_areas?.length ? (
                  <>
                    <p className="text-[11px] text-muted-foreground">Typical programme areas</p>
                    <Chips items={info.study_areas} />
                    <p className="text-[11px] text-muted-foreground">
                      Official programme curriculum:{" "}
                      {p.programme_url ? (
                        <a
                          href={p.programme_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          view on the institution's site
                        </a>
                      ) : (
                        "Information unavailable , confirm with the institution."
                      )}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Information unavailable.</p>
                )}
              </Section>

              <Section title="Career opportunities" icon={<Briefcase className="h-4 w-4 text-primary" />} collapsible>
                {data?.careers.length ? (
                  <ul className="space-y-1.5">
                    {data.careers.map((c) => (
                      <li key={c.id} className="text-sm text-foreground">
                        {c.occupation}
                        {c.description && (
                          <span className="text-muted-foreground"> , {c.description}</span>
                        )}
                        {c.licence_note && (
                          <span className="block text-[11px] text-primary/90">{c.licence_note}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Information unavailable.</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Graduating does not automatically qualify you for every role listed , some require licensing,
                  certification or postgraduate training.
                </p>
              </Section>

              <Section title="Why choose it?" collapsible>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {info?.why_choose ?? "Information unavailable."}
                </p>
              </Section>

              <Section title="Estimated Ghana earnings" icon={<Wallet className="h-4 w-4 text-primary" />} collapsible>
                {withSalary.length ? (
                  <ul className="space-y-1.5">
                    {withSalary.map((c) => (
                      <li key={c.id} className="text-sm text-foreground">
                        {c.occupation}: {c.salary_range}
                        {c.salary_period ? ` ${c.salary_period}` : ""}
                        {c.salary_experience_level ? ` (${c.salary_experience_level})` : ""}
                        <span className="block text-[11px] text-muted-foreground">
                          Source: {c.salary_data_source ?? "Unspecified"}
                          {c.last_verified
                            ? ` • Last updated ${new Date(c.last_verified).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}`
                            : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">Salary data unavailable for this programme.</p>
                )}
                <p className="text-[11px] text-muted-foreground">
                  Any figure shown is an estimate of typical reported earnings, not a guaranteed salary. Actual
                  earnings vary by experience, employer, location, industry, skills and role. For Ghana-wide
                  earnings data see the{" "}
                  <a
                    href="https://statsbank.statsghana.gov.gh/pxweb/en/Annual%20Household%20Income%20and%20Expenditure%20Survey%20(AHIES)/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ghana Statistical Service AHIES earnings tables
                  </a>
                  .
                </p>
              </Section>

              <Section title="Job market" collapsible>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {info?.job_market ?? "Information unavailable."}
                </p>
              </Section>

              <Section title="Admission" icon={<GraduationCap className="h-4 w-4 text-primary" />}>
                <div className="text-sm text-muted-foreground space-y-1">
                  {p.wassce_requirements && (
                    <p>
                      <span className="text-foreground">WASSCE:</span> {p.wassce_requirements}
                    </p>
                  )}
                  {p.entry_requirements && (
                    <p>
                      <span className="text-foreground">Entry:</span> {p.entry_requirements}
                    </p>
                  )}
                  {p.relevant_subjects?.length > 0 && (
                    <p>
                      <span className="text-foreground">Subjects:</span> {p.relevant_subjects.join(", ")}
                    </p>
                  )}
                  {cutoff ? (
                    <>
                      <p>
                        <span className="text-foreground">Cut-off aggregate:</span>{" "}
                        {cutoff.cut_off_aggregate ?? "Not published"} ({cutoff.applicant_category},{" "}
                        {cutoff.academic_year})
                      </p>
                      {cutoff.subject_requirements && <p>Required: {cutoff.subject_requirements}</p>}
                      <p className="text-[11px]">
                        Source: {cutoff.source_name ?? "Official institution source"} •{" "}
                        {formatVerifiedDate(cutoff.last_verified_at)}
                      </p>
                    </>
                  ) : (
                    <p className="text-[11px]">
                      No verified cut-off recorded for this programme yet , check the official admissions page.
                    </p>
                  )}
                  {!p.wassce_requirements && !p.entry_requirements && !cutoff && (
                    <p>Information unavailable.</p>
                  )}
                </div>
              </Section>

              <section className="bg-glass rounded-xl p-4">
                <h2 className="font-display text-sm font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <ShieldCheck className="h-4 w-4 text-ghana-green" /> Sources
                </h2>
                <ul className="space-y-1">
                  {(data?.sources ?? []).map((s) => (
                    <li key={s.id} className="text-[11px] text-muted-foreground break-all">
                      <a
                        href={s.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {s.source_type.replace(/_/g, " ")}
                      </a>{" "}
                      • {s.verification_status} • {formatVerifiedDate(s.verified_at)}
                    </li>
                  ))}
                  {(data?.sources.length ?? 0) === 0 && (
                    <li className="text-[11px] text-muted-foreground">
                      No official programme link recorded yet.
                    </li>
                  )}
                  {info?.source && <li className="text-[11px] text-muted-foreground">{info.source}</li>}
                  <li className="text-[11px] pt-1">
                    <Link to="/references" className="text-primary hover:underline">
                      View all sources &amp; acknowledgements
                    </Link>
                  </li>
                </ul>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProgrammePage;
