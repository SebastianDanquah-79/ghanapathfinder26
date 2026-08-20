import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OfficialLink from "@/components/OfficialLink";
import VerificationBadge from "@/components/VerificationBadge";
import { useInternships } from "@/hooks/useOpportunities";

const Internships = () => {
  const { data, isLoading, isError, refetch } = useInternships();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [field, setField] = useState("All");

  const rows = data ?? [];

  const types = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.opportunity_type))).sort()],
    [rows],
  );
  const fields = useMemo(
    () => ["All", ...Array.from(new Set(rows.flatMap((r) => r.fields))).sort()],
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (type === "All" || r.opportunity_type === type) &&
        (field === "All" || r.fields.includes(field)) &&
        (!q ||
          r.title.toLowerCase().includes(q) ||
          (r.companies?.name ?? "").toLowerCase().includes(q) ||
          r.careers.some((c) => c.toLowerCase().includes(q)) ||
          r.fields.some((f) => f.toLowerCase().includes(q))),
    );
  }, [rows, query, type, field]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-14 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Internships, attachments & graduate programmes in Ghana
          </h1>
          <p className="text-sm text-muted-foreground mb-5 max-w-3xl">
            Real employers with student attachment, internship or graduate intakes. GhanaPathFinder does
            not receive applications — every opportunity links to the employer&apos;s own careers page,
            where the current intake dates and requirements are published.{" "}
            <Link to="/companies" className="text-primary hover:underline">
              Browse employers
            </Link>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a role, employer or career…"
              aria-label="Search opportunities"
              className="flex-1 rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              aria-label="Filter by opportunity type"
              className="rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground"
            >
              {types.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All types" : t}
                </option>
              ))}
            </select>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              aria-label="Filter by field"
              className="rounded-lg bg-secondary border border-border px-3 py-2.5 text-sm text-foreground"
            >
              {fields.map((f) => (
                <option key={f} value={f}>
                  {f === "All" ? "All fields" : f}
                </option>
              ))}
            </select>
          </div>

          {isLoading && <p className="text-sm text-muted-foreground py-6">Loading opportunities…</p>}

          {isError && (
            <div className="py-6">
              <p className="text-sm text-muted-foreground mb-3">
                Something went wrong loading opportunities.
              </p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
              >
                Retry
              </button>
            </div>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground py-6">No opportunities match your filters.</p>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map((i) => (
              <article key={i.id} className="bg-glass rounded-xl p-4 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-display font-semibold text-base text-foreground">{i.title}</h2>
                    {i.companies && (
                      <Link
                        to={`/companies/${i.companies.slug}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {i.companies.name}
                      </Link>
                    )}
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded text-[11px] font-medium bg-primary/15 text-primary">
                    {i.opportunity_type}
                  </span>
                </div>

                {i.description && (
                  <p className="mt-2 text-xs text-muted-foreground leading-snug">{i.description}</p>
                )}

                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  {i.location && (
                    <div>
                      <dt className="inline font-medium text-foreground">Location: </dt>
                      <dd className="inline">{i.location}</dd>
                    </div>
                  )}
                  {i.duration && (
                    <div>
                      <dt className="inline font-medium text-foreground">Duration: </dt>
                      <dd className="inline">{i.duration}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="inline font-medium text-foreground">Mode: </dt>
                    <dd className="inline">{i.work_mode}</dd>
                  </div>
                  <div>
                    <dt className="inline font-medium text-foreground">Paid: </dt>
                    <dd className="inline">
                      {i.paid === null ? "Not stated" : i.paid ? "Usually paid" : "Unpaid"}
                    </dd>
                  </div>
                </dl>

                {i.eligibility && (
                  <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
                    <span className="font-medium text-foreground">Who can apply: </span>
                    {i.eligibility}
                  </p>
                )}

                {i.careers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {i.careers.slice(0, 5).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-full bg-secondary text-[11px] text-muted-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {i.deadline_text && (
                  <p className="mt-2 text-[11px] text-muted-foreground">{i.deadline_text}</p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <OfficialLink href={i.application_url} label="Apply on employer site" />
                </div>

                <div className="mt-2">
                  <VerificationBadge
                    verified={i.verified}
                    lastVerifiedAt={i.last_verified_at}
                    sourceUrl={i.source_url}
                    sourceName={i.companies ? `${i.companies.name} careers page` : null}
                    subject={i.title}
                    whatVerified="Employer identity and the official careers page. Intake dates and requirements change — always confirm on the employer's own site."
                  />
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

export default Internships;
