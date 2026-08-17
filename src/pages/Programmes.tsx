import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  GraduationCap,
  Loader2,
  Search as SearchIcon,
  Sparkles,
  X,
} from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Seo, { breadcrumbLd } from "@/components/Seo";
import SaveButton from "@/components/SaveButton";
import VerificationBadge from "@/components/VerificationBadge";
import {
  DIRECTORY_PAGE_SIZE,
  useProgrammeDirectory,
  useProgrammeFacets,
  type DirectoryProgramme,
} from "@/hooks/useProgrammeDirectory";

const POPULAR = [
  "Mechatronics",
  "Artificial Intelligence",
  "Electrical Engineering",
  "Computer Science",
  "Nursing",
  "Medicine",
  "Law",
  "Accounting",
  "Architecture",
  "Data Science",
];

const chip = (active: boolean) =>
  `whitespace-nowrap px-3 min-h-[38px] inline-flex items-center rounded-full text-xs font-medium transition-colors ${
    active
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-muted-foreground hover:text-foreground"
  }`;

const ProgrammeCard = ({ p }: { p: DirectoryProgramme }) => (
  <article className="bg-glass rounded-xl p-4 flex flex-col gap-2 card-hover">
    <div className="flex items-start justify-between gap-2">
      <h3 className="font-medium text-sm text-foreground leading-snug">
        <Link to={`/programme/${p.slug}`} className="hover:text-primary transition-colors">
          {p.name}
        </Link>
      </h3>
      {p.verified && <BadgeCheck className="h-4 w-4 text-primary shrink-0" aria-label="Verified" />}
    </div>

    <VerificationBadge
      verified={p.verification_status === "verified" || p.verified}
      lastVerifiedAt={p.last_verified_at}
      sourceUrl={p.source_url ?? p.programme_url ?? null}
      subject={`${p.name}${p.universities?.name ? ` , ${p.universities.name}` : ""}`}
      whatVerified="Programme name, qualification, duration and published entry requirements were checked against the institution's official programme or admissions page."
    />


    <p className="text-xs text-muted-foreground line-clamp-1">
      {p.universities?.name ?? "Institution unavailable"}
      {p.universities?.region ? ` · ${p.universities.region}` : ""}
    </p>

    <div className="flex flex-wrap gap-1.5">
      {p.field && (
        <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] text-muted-foreground">
          {p.field}
        </span>
      )}
      {p.qualification && (
        <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] text-muted-foreground">
          {p.qualification}
        </span>
      )}
      {p.duration && (
        <span className="px-2 py-0.5 rounded-md bg-secondary text-[11px] text-muted-foreground">
          {p.duration}
        </span>
      )}
    </div>

    {p.description && (
      <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
    )}

    <p className="text-[11px] text-muted-foreground line-clamp-2">
      <span className="text-foreground/80 font-medium">WASSCE: </span>
      {p.wassce_requirements || "Requirements unavailable , check the official admissions page."}
    </p>

    <div className="mt-auto pt-2 flex items-center justify-between gap-2">
      <Link
        to={`/programme/${p.slug}`}
        className="text-xs font-medium text-primary inline-flex items-center gap-1 min-h-[40px]"
      >
        View profile & match <ChevronRight className="h-3.5 w-3.5" />
      </Link>
      <SaveButton
        item={{
          item_type: "programme",
          item_key: p.slug,
          title: p.name,
          subtitle: p.universities?.name ?? null,
          metadata: { field: p.field, qualification: p.qualification },
        }}
      />
    </div>
  </article>
);

const Programmes = () => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [debounced, setDebounced] = useState(search);
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);

  const field = params.get("field") ?? undefined;
  const region = params.get("region") ?? undefined;
  const qualification = params.get("qualification") ?? undefined;
  const degreeType = params.get("degree") ?? undefined;
  const institution = params.get("institution") ?? undefined;
  const verifiedOnly = params.get("verified") === "1";
  const sort = (params.get("sort") as "name" | "newest") ?? "name";

  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debounced, field, region, qualification, degreeType, institution, verifiedOnly, sort]);

  const setParam = (key: string, value?: string) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const { data: facets } = useProgrammeFacets();
  const { data, isLoading, isError } = useProgrammeDirectory({
    search: debounced,
    field,
    region,
    qualification,
    degreeType,
    institution,
    verifiedOnly,
    sort,
    page,
  });

  const total = data?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE));
  const activeFilters = [field, region, qualification, degreeType, institution].filter(
    Boolean,
  ).length;

  const topFields = useMemo(() => (facets?.fields ?? []).slice(0, 14), [facets]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Programme Directory: Degrees in Ghana | GhanaPathFinder"
        description="Every accredited degree, diploma and certificate programme recorded in GhanaPathFinder: filter by field, institution, region and WASSCE requirements."
        path="/programmes"
        jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Programmes", path: "/programmes" }])]}
      />
      <Navbar />
      <main className="pt-20 pb-14 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <header className="mb-4">
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="h-6 w-6 lg:h-8 lg:w-8 text-primary" /> Programme Directory
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Every programme recorded in GhanaPathFinder: search by subject, institution, region or
              qualification. {total.toLocaleString()} programmes match your view.
            </p>
          </header>

          {/* Search */}
          <div className="relative mb-3">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Mechatronics, Artificial Intelligence, Nursing…"
              aria-label="Search programmes"
              className="w-full min-h-[48px] pl-10 pr-10 rounded-xl bg-glass border border-border/60 text-base sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 grid place-items-center rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Popular searches */}
          <div className="flex gap-2 [&>*]:shrink-0 hscroll hscroll-bleed pb-2">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground pr-1 whitespace-nowrap">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Popular
            </span>
            {POPULAR.map((t) => (
              <button key={t} onClick={() => setSearch(t)} className={chip(search === t)}>
                {t}
              </button>
            ))}
          </div>

          {/* Category chips */}
          <div className="flex gap-2 [&>*]:shrink-0 hscroll hscroll-bleed pb-2 mt-1">
            <button onClick={() => setParam("field")} className={chip(!field)}>
              All categories
            </button>
            {topFields.map((f) => (
              <button
                key={f.value}
                onClick={() => setParam("field", field === f.value ? undefined : f.value)}
                className={chip(field === f.value)}
              >
                {f.value} <span className="ml-1 opacity-60">{f.count}</span>
              </button>
            ))}
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 mt-2 mb-4">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={chip(showFilters || activeFilters > 0)}
              aria-expanded={showFilters}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" /> Filters
              {activeFilters > 0 && <span className="ml-1.5">({activeFilters})</span>}
            </button>
            <button
              onClick={() => setParam("verified", verifiedOnly ? undefined : "1")}
              className={chip(verifiedOnly)}
            >
              Verified only
            </button>
            <button
              onClick={() => setParam("sort", sort === "newest" ? undefined : "newest")}
              className={chip(sort === "newest")}
            >
              Recently added
            </button>
            {activeFilters > 0 && (
              <button
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
                className="text-xs text-muted-foreground hover:text-foreground min-h-[38px] px-2"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="lg:grid lg:grid-cols-[240px,1fr] lg:gap-6">
            {/* Filters , sidebar on desktop, collapsible on mobile */}
            <aside className={`${showFilters ? "block" : "hidden"} lg:block mb-4 lg:mb-0`}>
              <div className="bg-glass rounded-xl p-4 space-y-4 lg:sticky lg:top-20">
                {[
                  { label: "Institution", key: "institution", options: facets?.institutions },
                  { label: "Region", key: "region", options: facets?.regions },
                  { label: "Qualification", key: "qualification", options: facets?.qualifications },
                  { label: "Degree type", key: "degree", options: facets?.degreeTypes },
                  { label: "Category", key: "field", options: facets?.fields },
                ].map((group) => (
                  <div key={group.key}>
                    <label
                      htmlFor={`filter-${group.key}`}
                      className="block text-[11px] uppercase tracking-wide text-muted-foreground mb-1.5"
                    >
                      {group.label}
                    </label>
                    <select
                      id={`filter-${group.key}`}
                      value={params.get(group.key) ?? ""}
                      onChange={(e) => setParam(group.key, e.target.value || undefined)}
                      className="w-full min-h-[44px] rounded-lg bg-secondary px-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="">All</option>
                      {(group.options ?? []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.value} ({o.count})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </aside>

            <section>
              {isLoading && (
                <p className="text-sm text-muted-foreground flex items-center gap-2 py-8">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading programmes…
                </p>
              )}
              {isError && (
                <p className="text-sm text-muted-foreground py-8">
                  Couldn't load programmes. Check your connection and try again.
                </p>
              )}
              {!isLoading && !isError && total === 0 && (
                <div className="bg-glass rounded-xl p-6 text-center">
                  <p className="text-foreground font-medium mb-1">No programmes match that.</p>
                  <p className="text-sm text-muted-foreground">
                    Try a broader search term or clear a filter.
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data?.rows.map((p) => (
                  <ProgrammeCard key={p.id} p={p} />
                ))}
              </div>

              {total > DIRECTORY_PAGE_SIZE && (
                <nav
                  aria-label="Pagination"
                  className="flex items-center justify-between gap-3 mt-5"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="inline-flex items-center gap-1 min-h-[44px] px-4 rounded-xl bg-secondary text-sm text-foreground disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </button>
                  <span className="text-xs text-muted-foreground">
                    Page {page + 1} of {pages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                    disabled={page >= pages - 1}
                    className="inline-flex items-center gap-1 min-h-[44px] px-4 rounded-xl bg-secondary text-sm text-foreground disabled:opacity-40"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Programmes;
