import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import SectionHeader from "@/components/SectionHeader";
import OfficialLink from "@/components/OfficialLink";
import SaveButton from "@/components/SaveButton";
import { Search } from "@/lib/icons";
import {
  EMPLOYERS,
  OPPORTUNITY_TYPES,
  REGIONS,
  SECTORS,
  type OpportunityType,
  type Sector,
} from "@/data/employers";
import { careerPaths } from "@/data/careerPaths";

const MAJORS = careerPaths.map((c) => c.major).sort();

const Internships = () => {
  const [q, setQ] = useState("");
  const [sector, setSector] = useState<Sector | "All">("All");
  const [type, setType] = useState<OpportunityType | "All">("All");
  const [region, setRegion] = useState("All");
  const [major, setMajor] = useState("All");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return EMPLOYERS.filter((e) => {
      if (sector !== "All" && e.sector !== sector) return false;
      if (type !== "All" && !e.opportunities.includes(type)) return false;
      if (region !== "All" && !e.locations.includes(region)) return false;
      if (major !== "All" && !e.majors.includes(major)) return false;
      if (!term) return true;
      return (
        e.name.toLowerCase().includes(term) ||
        e.about.toLowerCase().includes(term) ||
        e.sector.toLowerCase().includes(term) ||
        e.majors.some((m) => m.toLowerCase().includes(term))
      );
    });
  }, [q, sector, type, region, major]);

  const selectClass =
    "px-3 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50";

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Internships, Graduate Programmes & Employers in Ghana | GhanaPathFinder"
        description="Find internships, industrial attachments, national service placements and graduate programmes with real employers in Ghana, filtered by sector, region and your course of study."
        path="/internships"
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Internships", path: "/internships" },
          ]),
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            badge="Internships"
            title="Where Ghanaian students"
            highlight="get real experience"
            description="Employers that take interns, attachment students, national service personnel and graduate trainees in Ghana. Every link goes to the organisation's own page , always confirm dates there."
          />

          <div className="relative max-w-xl mx-auto mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search employers, e.g. bank, mining, software"
              aria-label="Search employers and internships"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-5">
            <select
              aria-label="Filter by opportunity type"
              className={selectClass}
              value={type}
              onChange={(e) => setType(e.target.value as OpportunityType | "All")}
            >
              <option value="All">All opportunities</option>
              {OPPORTUNITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by sector"
              className={selectClass}
              value={sector}
              onChange={(e) => setSector(e.target.value as Sector | "All")}
            >
              <option value="All">All sectors</option>
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by location"
              className={selectClass}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="All">Anywhere in Ghana</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              aria-label="Filter by course or career"
              className={selectClass}
              value={major}
              onChange={(e) => setMajor(e.target.value)}
            >
              <option value="All">Any course</option>
              {MAJORS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            {rows.length} {rows.length === 1 ? "employer" : "employers"}
          </p>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((e) => (
              <article key={e.id} className="bg-glass rounded-xl p-4 flex flex-col">
                <h2 className="font-display font-semibold text-foreground text-sm">{e.name}</h2>
                <p className="text-[11px] text-muted-foreground mb-2">
                  {e.sector} · {e.locations.join(", ")}
                </p>
                <p className="text-xs text-muted-foreground mb-3">{e.about}</p>

                <ul className="flex flex-wrap gap-1.5 mb-2">
                  {e.opportunities.map((o) => (
                    <li
                      key={o}
                      className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[11px]"
                    >
                      {o}
                    </li>
                  ))}
                </ul>

                <p className="text-[11px] text-muted-foreground mb-3">{e.timing}</p>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <OfficialLink href={e.url} label="Official page" />
                  <SaveButton
                    item={{
                      item_type: "career",
                      item_key: `employer:${e.id}`,
                      title: e.name,
                      subtitle: `${e.sector} · ${e.opportunities[0] ?? "Opportunity"}`,
                      metadata: { url: e.url, locations: e.locations },
                    }}
                  />
                </div>
              </article>
            ))}
          </div>

          {rows.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">
              No employers match those filters yet. Try widening the sector or location.
            </p>
          )}

          <p className="mt-8 text-[11px] text-muted-foreground">
            Opportunity dates change every year. GhanaPathFinder does not recruit for any
            organisation , apply only through the official pages linked above.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Internships;
