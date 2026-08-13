import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, Loader2, MapPin, GraduationCap, CalendarDays } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SaveButton from "@/components/SaveButton";
import OfficialLink from "@/components/OfficialLink";
import { PAGE_SIZE, useCatalogueSearch, type SearchResult } from "@/hooks/useCatalogue";

type Kind = "all" | "university" | "programme" | "scholarship";

const tabs: { key: Kind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "university", label: "Universities" },
  { key: "programme", label: "Programmes" },
  { key: "scholarship", label: "Scholarships" },
];

const suggestions = ["Computer Science", "University of Ghana", "Engineering", "Nursing", "Law", "Data Science"];

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
    <div className="bg-glass rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-wide text-primary font-semibold">{r.kind}</span>
          <h3 className="font-display font-semibold text-base text-foreground break-words">
            {r.kind === "university" ? (
              <Link to={`/university/${r.slug}`} className="hover:text-primary transition-colors">
                {r.title}
              </Link>
            ) : (
              r.title
            )}
          </h3>
          {r.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{r.subtitle}</p>}
        </div>
      </div>

      {r.kind === "university" && (
        <div className="flex flex-wrap gap-1.5">
          {(Array.isArray(meta.top_programmes) ? (meta.top_programmes as string[]) : [])
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
          {str("entry_requirements") && <p>Entry: {str("entry_requirements")}</p>}
        </div>
      )}

      {r.kind === "scholarship" && (
        <div className="text-xs text-muted-foreground space-y-1">
          {str("eligibility") && <p className="line-clamp-3">{str("eligibility")}</p>}
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground"
            >
              <MapPin className="h-3.5 w-3.5" /> View profile
            </Link>
            <OfficialLink href={str("website_url")} label="Official website" variant="ghost" />
          </>
        )}
        {r.kind === "scholarship" && (
          <OfficialLink href={str("application_url")} label="Apply" variant="ghost" />
        )}
        {r.kind === "programme" && (str("application_url") || str("programme_url")) && (
          <OfficialLink
            href={str("application_url") || str("programme_url")}
            label="Programme page"
            variant="ghost"
          />
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

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(term);
      setPage(0);
      setParams(term ? { q: term, kind } : { kind }, { replace: true });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term, kind]);

  const { data, isLoading, isError, refetch, isFetching } = useCatalogueSearch(debounced, kind, page);
  const results = data ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20 px-4">
        <div className="max-w-6xl xl:max-w-7xl mx-auto">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Search GhanaPath
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Universities, programmes and scholarships — searched live from the GhanaPath database.
          </p>

          <div className="relative mb-4">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Try “Computer Science”, “University of Ghana”, “Nursing”…"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Search universities, programmes and scholarships"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setKind(t.key);
                  setPage(0);
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  kind === t.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-16 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching…
            </div>
          )}

          {isError && (
            <div className="text-center py-16">
              <p className="text-sm text-muted-foreground mb-3">
                We couldn't complete your search. Please try again.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && (
            <div className="text-center py-16">
              <p className="text-foreground font-medium mb-2">{emptyCopy[kind]}</p>
              <p className="text-sm text-muted-foreground mb-4">Try one of these searches instead:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTerm(s)}
                    className="px-3 py-1.5 rounded-full bg-secondary text-xs text-muted-foreground hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isError && results.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map((r) => (
                  <ResultCard key={`${r.kind}-${r.id}`} r={r} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  disabled={page === 0 || isFetching}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="px-4 py-2 rounded-lg bg-secondary text-sm text-muted-foreground disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-muted-foreground">Page {page + 1}</span>
                <button
                  disabled={results.length < PAGE_SIZE || isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-lg bg-secondary text-sm text-muted-foreground disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
