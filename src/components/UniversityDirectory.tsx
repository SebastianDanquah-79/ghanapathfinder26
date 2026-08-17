import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "@/lib/router-compat";
import { Search, MapPin, GraduationCap, Building2, Loader2 } from "@/lib/icons";
import VerificationBadge from "./VerificationBadge";
import SectionHeader from "./SectionHeader";
import SaveButton from "./SaveButton";
import OfficialLink from "./OfficialLink";
import { formatVerified, useUniversities } from "@/hooks/useCatalogue";
import { INSTITUTION_GROUPS, type InstitutionGroup } from "@/lib/legal";

const PAGE_SIZE = 12;

const REGIONS = [
  "Greater Accra",
  "Ashanti",
  "Central",
  "Eastern",
  "Western",
  "Western North",
  "Volta",
  "Oti",
  "Northern",
  "Savannah",
  "North East",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
];

const UniversityDirectory = () => {
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | "Public" | "Private">("All");
  const [group, setGroup] = useState<InstitutionGroup | "All">("All");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError, refetch, isFetching } = useUniversities({
    search: debounced,
    type: group === "All" ? typeFilter : "All",
    group,
    region: region || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const rows = data?.rows ?? [];
  const total = data?.count ?? 0;

  return (
    <section id="universities" className="py-12 lg:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          badge="Directory"
          title="Ghana University"
          highlight="Directory"
          description="Search by name, region or type."
        />

        <div className="flex flex-col sm:flex-row gap-3 mb-3 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search universities, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search universities"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              setPage(0);
            }}
            aria-label="Filter by region"
            className="rounded-lg bg-secondary border border-border px-3 py-3 text-sm text-foreground"
          >
            <option value="">All regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          {group === "All" && (
            <div className="flex gap-2">
              {(["All", "Public", "Private"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTypeFilter(t);
                    setPage(0);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === t
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex hscroll hscroll-bleed gap-2 mb-7 md:flex-wrap md:justify-center md:overflow-visible md:mx-0 md:px-0">
          {(["All", ...INSTITUTION_GROUPS] as const).map((g) => (
            <button
              key={g}
              onClick={() => {
                setGroup(g);
                setPage(0);
              }}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                group === g
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {g === "All" ? "All institutions" : g}
            </button>
          ))}
        </div>

        {isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-10">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading universities…
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

        {!isLoading && !isError && rows.length === 0 && (
          <p className="text-center py-10 text-muted-foreground">
            No universities match your filters.
          </p>
        )}

        <div className="flex hscroll hscroll-bleed snap-x snap-mandatory scroll-smooth [&>*]:w-[17rem] [&>*]:shrink-0 [&>*]:snap-start md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 md:[&>*]:w-auto gap-4">
          {rows.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i, 6) * 0.05, duration: 0.4 }}
              className="bg-glass rounded-xl p-4 card-hover flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-display font-semibold text-lg text-foreground">
                    <Link to={`/university/${u.slug}`} className="hover:text-primary transition-colors">
                      {u.short_name ?? u.name}
                    </Link>
                  </h3>
                  <p className="text-xs text-muted-foreground break-words">{u.name}</p>
                </div>
                <span
                  className={`shrink-0 px-2 py-1 rounded text-xs font-medium ${
                    u.type === "Public"
                      ? "bg-ghana-green/20 text-ghana-green"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {u.type}
                </span>
              </div>

              <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                <MapPin className="h-3.5 w-3.5" />
                <span>{u.location}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-2">
                {u.top_programmes.slice(0, 3).map((p) => (
                  <span key={p} className="px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground">
                    {p}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-2 text-xs mb-2">
                {u.admission_aggregate && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-primary" />
                    <span className="text-muted-foreground">Aggregate: {u.admission_aggregate}</span>
                  </div>
                )}
                {u.tuition_range && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-muted-foreground">{u.tuition_range}</span>
                  </div>
                )}
              </div>

              {u.campus_vibe && (
                <p className="text-xs text-muted-foreground leading-snug mb-3 line-clamp-2">{u.campus_vibe}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 mt-auto">
                <SaveButton
                  item={{
                    item_type: "university",
                    item_key: u.slug,
                    title: u.name,
                    subtitle: u.location,
                    metadata: { website_url: u.website_url, type: u.type },
                  }}
                />
                <Link
                  to={`/university/${u.slug}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] sm:min-h-[40px] rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground"
                >
                  Profile
                </Link>
                <OfficialLink href={u.website_url} label="Official" variant="ghost" />
              </div>

              <div className="mt-2">
                <VerificationBadge
                  verified={u.verification_status === "verified" || u.verified}
                  lastVerifiedAt={u.last_verified_at}
                  sourceUrl={u.source_url ?? u.website_url}
                  sourceName={u.source_url ? null : `${u.name} official website`}
                  subject={u.name}
                  whatVerified="Institution name, accreditation status, location and listed programmes."
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  {formatVerified(u.last_verified_at)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {total > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-3 mt-7">
            <button
              disabled={page === 0 || isFetching}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-4 py-2 rounded-lg bg-secondary text-sm text-muted-foreground disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
            </span>
            <button
              disabled={(page + 1) * PAGE_SIZE >= total || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-lg bg-secondary text-sm text-muted-foreground disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default UniversityDirectory;
