import { useMemo, useState } from "react";
import { BookMarked, ExternalLink, Loader2, Search as SearchIcon, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { useSourceDirectory } from "@/hooks/useSourceDirectory";
import { REFERENCES_PARAGRAPHS, formatVerified, prettyHost, sourceTypeLabel } from "@/lib/legal";

const References = () => {
  const { data: sources = [], isLoading } = useSourceDirectory();
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");

  const types = useMemo(
    () => ["all", ...[...new Set(sources.map((s) => sourceTypeLabel(s.type)))].sort()],
    [sources],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return sources.filter(
      (s) =>
        (type === "all" || sourceTypeLabel(s.type) === type) &&
        (!needle ||
          s.name.toLowerCase().includes(needle) ||
          s.url.toLowerCase().includes(needle) ||
          s.usedFor.join(" ").toLowerCase().includes(needle)),
    );
  }, [sources, q, type]);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="References & Acknowledgements — GhanaPathFinder"
        description="Where GhanaPathFinder gets its information: official universities, GTEC and other regulators, admissions portals and scholarship providers, with verification dates."
        path="/references"
        jsonLd={[
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "References", path: "/references" }]),
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-3 flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-primary" /> References &amp; acknowledgements
          </h1>
          <div className="bg-glass rounded-xl p-4 sm:p-6 space-y-3">
            {REFERENCES_PARAGRAPHS.map((p) => (
              <p key={p.slice(0, 30)} className="text-sm text-muted-foreground leading-relaxed">
                {p}
              </p>
            ))}
          </div>

          <section className="mt-6" aria-label="Source directory">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h2 className="font-display text-lg font-semibold text-foreground">Source directory</h2>
              <p className="text-xs text-muted-foreground">
                {isLoading ? "Loading…" : `${filtered.length} of ${sources.length} sources`}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <SearchIcon className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search sources, institutions or what they verify"
                  className="w-full bg-secondary/50 border border-border rounded-lg pl-9 pr-3 py-2.5 text-sm text-foreground"
                />
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="bg-secondary/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground"
              >
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "All source types" : t}
                  </option>
                ))}
              </select>
            </div>

            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground bg-glass rounded-xl p-4">
                No sources match this search.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => (
                  <article key={s.url} className="bg-glass rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-sm text-foreground">{s.name}</h3>
                      {s.status === "verified" && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-ghana-green shrink-0">
                          <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] uppercase tracking-wide text-primary mt-1">
                      {sourceTypeLabel(s.type)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Information obtained: {s.usedFor.join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Records traced to this source: {s.records}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatVerified(s.lastVerified)
                        ? `Last verified: ${formatVerified(s.lastVerified)}`
                        : "Last verified: date unavailable"}
                    </p>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-primary min-h-[36px]"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> {prettyHost(s.url)}
                    </a>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default References;
