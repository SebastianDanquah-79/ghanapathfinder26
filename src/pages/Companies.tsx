import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OfficialLink from "@/components/OfficialLink";
import { useCompanies } from "@/hooks/useOpportunities";

const Companies = () => {
  const { data, isLoading, isError, refetch } = useCompanies();
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState("All");
  const [employerType, setEmployerType] = useState("All");

  const rows = data ?? [];
  const sectors = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.sector))).sort()],
    [rows],
  );
  const employerTypes = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.employer_type))).sort()],
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (sector === "All" || r.sector === sector) &&
        (employerType === "All" || r.employer_type === employerType) &&
        (!q ||
          r.name.toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q) ||
          (r.location ?? "").toLowerCase().includes(q)),
    );
  }, [rows, query, sector, employerType]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Employers in Ghana — who hires which graduates
          </h1>
          <p className="text-sm text-muted-foreground mb-5 max-w-3xl">
            Organisations that recruit Ghanaian students and graduates, with their official careers
            pages. See{" "}
            <Link to="/internships" className="text-primary hover:underline">
              open internship and attachment routes
            </Link>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search an employer…"
              aria-label="Search employers"
              className="flex-1 rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
            />
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              aria-label="Filter by sector"
              className="rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground"
            >
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s === "All" ? "All sectors" : s}
                </option>
              ))}
            </select>
            <select
              value={employerType}
              onChange={(e) => setEmployerType(e.target.value)}
              aria-label="Filter by employer type"
              className="rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground"
            >
              {employerTypes.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All employer types" : t}
                </option>
              ))}
            </select>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground py-6">Loading employers…</p>}

          {isError && (
            <div className="py-6">
              <p className="text-sm text-muted-foreground mb-3">Something went wrong loading employers.</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-6">No employers match your filters.</p>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((c) => (
              <article key={c.id} className="bg-glass rounded-xl p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display font-semibold text-base text-foreground">
                    <Link to={`/companies/${c.slug}`} className="hover:text-primary transition-colors">
                      {c.name}
                    </Link>
                  </h2>
                  <span className="shrink-0 px-2 py-1 rounded text-[11px] font-medium bg-secondary text-muted-foreground">
                    {c.employer_type}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {c.sector}
                  {c.location ? ` • ${c.location}` : ""}
                </p>
                {c.description && (
                  <p className="mt-2 text-xs text-muted-foreground leading-snug line-clamp-3">
                    {c.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    to={`/companies/${c.slug}`}
                    className="px-3 py-2 rounded-lg text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground"
                  >
                    Profile
                  </Link>
                  <OfficialLink href={c.careers_url ?? c.website_url} label="Careers page" variant="ghost" />
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Companies;
