import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import {
  Search as SearchIcon,
  Loader2,
  MapPin,
  GraduationCap,
  CalendarDays,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import Footer from "@/components/Footer";
import SaveButton from "@/components/SaveButton";
import OfficialLink from "@/components/OfficialLink";
import {
  PAGE_SIZE,
  useCatalogueSearch,
  useUniversities,
  useScholarshipRecords,
  type SearchResult,
} from "@/hooks/useCatalogue";

type Kind = "all" | "university" | "programme" | "scholarship";

const tabs: { key: Kind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "university", label: "Universities" },
  { key: "programme", label: "Programmes" },
  { key: "scholarship", label: "Scholarships" },
];

const REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Eastern",
  "Western",
  "Volta",
  "Northern",
  "Bono",
  "Bono East",
  "Ahafo",
  "Western North",
  "Oti",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
];

const CATEGORIES = [
  "University",
  "Technical University",
  "University College",
  "College of Education",
  "Nursing and Midwifery Training College",
  "Private Nurses Training College",
  "Health Training Institution",
  "College of Agriculture",
  "Professional Institution",
  "Private Tertiary Institution",
  "Chartered Private Institution",
  "Private College of Education",
  "Private Polytechnic",
  "Tutorial College",
  "Distance Learning Institution",
  "Registered Foreign Institution",
  "Regional (West Africa) Institution",
];

const UNI_TYPES = ["All", "Public", "Private"] as const;
const SCHOLARSHIP_TYPES = ["All", "Government", "Private", "International", "University"];

const suggestions = [
  "Computer Science",
  "Nursing",
  "Teacher Education",
  "Wa",
  "Technical University",
  "Agriculture",
];

const emptyCopy: Record<Kind, string> = {
  all: "No results found.",
  university: "No universities found.",
  programme: "No programmes found.",
  scholarship: "No scholarships found.",
};

const ResultCard = ({ r }: { r: SearchResult }) => {
  const meta = r.meta ?? {};
  const str = (k: string) => (typeof meta[k] === "string" ? (meta[k] as string) : null);

  return (
    <div className="bg-glass rounded-xl p-4 flex flex-col gap-2">
      <div className="min-w-0">
        <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">{r.kind}</span>
        <h2 className="font-display font-semibold text-base text-foreground break-words">
          {r.kind === "university" || r.kind === "programme" ? (
            <Link
              to={r.kind === "university" ? `/university/${r.slug}` : `/programme/${r.slug}`}
              className="hover:text-primary transition-colors"
            >
              {r.title}
            </Link>
          ) : (
            r.title
          )}
        </h2>
        {r.subtitle && <p className="text-xs text-muted-foreground mt-0.5 break-words">{r.subtitle}</p>}
      </div>

      {r.kind === "university" && str("accreditation_status") && (
        <p className="text-[11px] text-muted-foreground flex flex-wrap items-center gap-2">
          <span
            title={str("accreditation_status")!}
            className={`px-2 py-0.5 rounded-full font-medium ${
              str("accreditation_status")!.startsWith("Accredited")
                ? "bg-secondary text-primary"
                : "bg-destructive/10 text-destructive"
            }`}
          >
            {str("accreditation_status")!.startsWith("Accredited by regulator") ? "Regulator-accredited" : str("accreditation_status")}
          </span>
          {str("delivery_mode") && str("delivery_mode") !== "On campus" && (
            <span className="px-2 py-0.5 rounded-full bg-secondary text-foreground">{str("delivery_mode")}</span>
          )}
          {str("accreditation_expiry_date") && (
            <span>To {new Date(str("accreditation_expiry_date")!).toLocaleDateString("en-GB",{month:"short",year:"numeric"})}</span>
          )}
        </p>
      )}

      {r.kind === "university" && (
        <div className="flex flex-wrap gap-1.5">
          {(Array.isArray(meta['top_programmes']) ? (meta['top_programmes'] as string[]) : [])
            .slice(0, 4)
            .map((p) => (
              <span key={p} className="px-2 py-0.5 rounded-full bg-secondary text-[11px] text-muted-foreground">
                {p}
              </span>
            ))}
        </div>
      )}

      {r.kind === "programme" && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5 text-primary shrink-0" />
            {str("university")}
          </p>
          {str("short_bio") && <p className="line-clamp-2">{str("short_bio")}</p>}
          {Array.isArray(meta['careers']) && (meta['careers'] as string[]).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {(meta['careers'] as string[]).slice(0, 3).map((c) => (
                <span key={c} className="px-2 py-0.5 rounded-full bg-secondary text-[11px]">
                  {c}
                </span>
              ))}
            </div>
          )}
          {str("entry_requirements") && <p className="line-clamp-2">Entry: {str("entry_requirements")}</p>}
        </div>
      )}

      {r.kind === "scholarship" && (
        <div className="text-xs text-muted-foreground space-y-1">
          {str("eligibility") && <p className="line-clamp-2">{str("eligibility")}</p>}
          {str("deadline_text") && (
            <p className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 text-primary shrink-0" />
              {str("deadline_text")}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mt-auto pt-1">
        <SaveButton
          item={{
            item_type: r.kind,
            item_key: r.slug,
            title: r.title,
            subtitle: r.subtitle,
            metadata: meta,
          }}
        />
        {r.kind === "university" && (
          <>
            <Link
              to={`/university/${r.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground"
            >
              <MapPin className="h-3.5 w-3.5" /> Profile
            </Link>
            <OfficialLink href={str("website_url")} label="Website" variant="ghost" />
          </>
        )}
        {r.kind === "scholarship" && (
          <OfficialLink href={str("application_url")} label="Apply" variant="ghost" />
        )}
        {r.kind === "programme" && (
          <>
            <Link
              to={`/programme/${r.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground"
            >
              <GraduationCap className="h-3.5 w-3.5" /> Details
            </Link>
            {(str("application_url") || str("programme_url")) && (
              <OfficialLink
                href={str("application_url") || str("programme_url")}
                label="Official"
                variant="ghost"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get("q") ?? "");
  const [debounced, setDebounced] = useState(term);
  const [kind, setKind] = useState<Kind>((params.get("kind") as Kind) ?? "all");
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [uniType, setUniType] = useState<(typeof UNI_TYPES)[number]>("All");
  const [region, setRegion] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [schType, setSchType] = useState("All");

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(term);
      setPage(0);
      setParams(term ? { q: term, kind } : { kind }, { replace: true });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, kind]);

  const filtersActive =
    (kind === "university" && (uniType !== "All" || !!region || !!category)) ||
    (kind === "scholarship" && schType !== "All");

  const useUniQuery = kind === "university";
  const useSchQuery = kind === "scholarship" && schType !== "All";

  const catalogue = useCatalogueSearch(debounced, kind, page);
  const unis = useUniversities({
    search: debounced,
    type: uniType,
    region: region || undefined,
    category: category || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const schs = useScholarshipRecords(debounced, schType);

  const active = useUniQuery ? unis : useSchQuery ? schs : catalogue;

  const results: SearchResult[] = useMemo(() => {
    if (useUniQuery) {
      return (unis.data?.rows ?? []).map((u) => ({
        kind: "university" as const,
        id: u.id,
        slug: u.slug,
        title: u.name,
        subtitle: [u.location, u.region, u.category].filter(Boolean).join(" · "),
        meta: {
          top_programmes: u.top_programmes,
          website_url: u.website_url,
          accreditation_status: u.accreditation_status,
          delivery_mode: u.delivery_mode,
          accreditation_expiry_date: u.accreditation_expiry_date,
          gtec_category: u.gtec_category,
          last_verified_at: u.last_verified_at,
          source_url: u.source_url,
        },
        score: null,
      }));
    }
    if (useSchQuery) {
      return (schs.data ?? []).map((s) => ({
        kind: "scholarship" as const,
        id: s.id,
        slug: s.slug,
        title: s.name,
        subtitle: s.provider,
        meta: {
          eligibility: s.eligibility,
          deadline_text: s.deadline_text,
          application_url: s.application_url,
        },
        score: null,
      }));
    }
    return catalogue.data ?? [];
  }, [useUniQuery, useSchQuery, unis.data, schs.data, catalogue.data]);

  const isLoading = active.isLoading;
  const isError = active.isError;
  const isFetching = active.isFetching;
  const paginated = !useSchQuery;

  const clearFilters = () => {
    setUniType("All");
    setRegion("");
    setCategory("");
    setSchType("All");
    setPage(0);
  };

  const chip = (on: boolean) =>
    `whitespace-nowrap px-3 min-h-[40px] rounded-full text-xs font-medium transition-colors ${
      on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
    }`;

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Search Universities & Programmes in Ghana | GhanaPathFinder"
        description="Search accredited Ghanaian universities, degree programmes and scholarships in one place, with WASSCE requirements and verified official links."
        path="/search"
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-6xl xl:max-w-7xl mx-auto">
          <h1 className="font-display text-xl sm:text-3xl font-bold text-foreground mb-1">
            Search GhanaPathFinder
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            Universities, programmes and scholarships.
          </p>

          <div className="sticky top-16 z-30 -mx-4 px-4 py-2 bg-background/95 backdrop-blur-sm">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search universities, programmes…"
                className="w-full pl-10 pr-4 min-h-[48px] rounded-xl bg-secondary border border-border text-foreground text-base sm:text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
                aria-label="Search universities, programmes and scholarships"
              />
            </div>

            <div className="flex gap-2 [&>*]:shrink-0 hscroll hscroll-bleed py-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setKind(t.key);
                    setPage(0);
                  }}
                  className={chip(kind === t.key)}
                >
                  {t.label}
                </button>
              ))}
              {(kind === "university" || kind === "scholarship") && (
                <button
                  onClick={() => setShowFilters((v) => !v)}
                  aria-expanded={showFilters}
                  className={chip(showFilters || filtersActive)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
                  </span>
                </button>
              )}
            </div>

            {showFilters && kind === "university" && (
              <div className="bg-glass rounded-xl p-3 mb-2 space-y-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Type</p>
                  <div className="flex gap-2 [&>*]:shrink-0 hscroll pb-1">
                    {UNI_TYPES.map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setUniType(t);
                          setPage(0);
                        }}
                        className={chip(uniType === t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Region</p>
                  <div className="flex gap-2 [&>*]:shrink-0 hscroll hscroll-bleed pb-1">
                    <button onClick={() => setRegion("")} className={chip(region === "")}>
                      All
                    </button>
                    {REGIONS.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRegion(r);
                          setPage(0);
                        }}
                        className={chip(region === r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">
                    Institution type
                  </p>
                  <div className="flex gap-2 [&>*]:shrink-0 hscroll hscroll-bleed pb-1">
                    <button onClick={() => setCategory("")} className={chip(category === "")}>
                      All
                    </button>
                    {CATEGORIES.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          setCategory(c);
                          setPage(0);
                        }}
                        className={chip(category === c)}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                {filtersActive && (
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 text-xs text-primary font-medium min-h-[40px]"
                  >
                    <X className="h-3.5 w-3.5" /> Clear filters
                  </button>
                )}
              </div>
            )}

            {showFilters && kind === "scholarship" && (
              <div className="bg-glass rounded-xl p-3 mb-2">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5">Funding type</p>
                <div className="flex gap-2 [&>*]:shrink-0 hscroll hscroll-bleed pb-1">
                  {SCHOLARSHIP_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => {
                        setSchType(t);
                        setPage(0);
                      }}
                      className={chip(schType === t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-10 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}

          {isError && (
            <div className="text-center py-10">
              <p className="text-sm text-muted-foreground mb-3">
                We couldn't complete your search. Please try again.
              </p>
              <button
                onClick={() => active.refetch()}
                className="px-5 min-h-[48px] rounded-xl bg-primary text-primary-foreground text-sm font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && (
            <div className="text-center py-14">
              <p className="text-foreground font-medium mb-2">{emptyCopy[kind]}</p>
              <p className="text-sm text-muted-foreground mb-4">Try one of these searches instead:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTerm(s)}
                    className="px-3 min-h-[40px] rounded-full bg-secondary text-xs text-muted-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isError && results.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground mt-3 mb-3">
                {useUniQuery && unis.data
                  ? `${unis.data.count} universities`
                  : `${results.length} result${results.length === 1 ? "" : "s"}`}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {results.map((r) => (
                  <ResultCard key={`${r.kind}-${r.id}`} r={r} />
                ))}
              </div>
              {paginated && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    disabled={page === 0 || isFetching}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="px-5 min-h-[48px] rounded-xl bg-secondary text-sm text-muted-foreground disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-muted-foreground">Page {page + 1}</span>
                  <button
                    disabled={results.length < PAGE_SIZE || isFetching}
                    onClick={() => setPage((p) => p + 1)}
                    className="px-5 min-h-[48px] rounded-xl bg-secondary text-sm text-muted-foreground disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <div className="hidden sm:block">
        <Footer />
      </div>
    </div>
  );
};

export default SearchPage;
