import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Scale, Search, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SaveButton from "@/components/SaveButton";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

interface UniversityRow {
  id: string;
  slug: string;
  name: string;
  short_name: string | null;
  location: string | null;
  region: string | null;
  type: string | null;
  ownership: string | null;
  tuition_range: string | null;
  admission_aggregate: string | null;
  campus_vibe: string | null;
  top_programmes: string[] | null;
  website_url: string | null;
  accreditation_status: string | null;
}

const FIELDS =
  "id, slug, name, short_name, location, region, type, ownership, tuition_range, admission_aggregate, campus_vibe, top_programmes, website_url, accreditation_status";

const useUniversitySearch = (search: string) =>
  useQuery({
    queryKey: ["compare_universities", search],
    queryFn: async () => {
      let q = supabase.from("universities").select(FIELDS).order("name").limit(60);
      const term = search.trim();
      if (term) q = q.or(`name.ilike.%${term}%,short_name.ilike.%${term}%,location.ilike.%${term}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as UniversityRow[];
    },
    staleTime: 5 * 60_000,
  });

const useSelectedUniversities = (slugs: string[]) =>
  useQuery({
    queryKey: ["compare_selected", slugs.slice().sort().join(",")],
    enabled: slugs.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase.from("universities").select(FIELDS).in("slug", slugs);
      if (error) throw error;
      return (data ?? []) as unknown as UniversityRow[];
    },
    staleTime: 5 * 60_000,
  });

const dash = (v?: string | null) => (v && v.trim() ? v : "Not published");

const Compare = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const { data: options = [], isLoading } = useUniversitySearch(search);
  const { data: chosenRows = [] } = useSelectedUniversities(selected);

  const chosen = useMemo(
    () => selected.map((s) => chosenRows.find((u) => u.slug === s)).filter(Boolean) as UniversityRow[],
    [selected, chosenRows],
  );

  const toggle = (slug: string) =>
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < 3 ? [...prev, slug] : prev,
    );

  const rows: { label: string; value: (u: UniversityRow) => string }[] = [
    { label: "Full name", value: (u) => u.name },
    { label: "Location", value: (u) => dash(u.location) },
    { label: "Region", value: (u) => dash(u.region) },
    { label: "Type", value: (u) => dash(u.type ?? u.ownership) },
    { label: "Accreditation", value: (u) => dash(u.accreditation_status) },
    { label: "Tuition", value: (u) => dash(u.tuition_range) },
    { label: "Admission aggregate", value: (u) => dash(u.admission_aggregate) },
    { label: "Top programmes", value: (u) => (u.top_programmes?.length ? u.top_programmes.join(", ") : "Not published") },
    { label: "Campus life", value: (u) => dash(u.campus_vibe) },
  ];

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Seo
        title="Compare Universities in Ghana Side by Side | GhanaPath"
        description="Compare up to three accredited Ghanaian universities on location, type, tuition, admission aggregate and top programmes using verified GTEC data."
        path="/compare"
      />
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>

        <div className="flex items-center gap-2 mb-2">
          <Scale className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Compare universities</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Search the accredited institution register and pick up to three schools to see them side by side.
        </p>

        <div className="relative mb-4 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, short name or city"
            aria-label="Search universities"
            className="w-full min-h-[44px] pl-9 pr-3 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {isLoading ? (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading institutions…
            </span>
          ) : options.length === 0 ? (
            <span className="text-sm text-muted-foreground">No institutions match that search.</span>
          ) : (
            options.map((u) => (
              <button
                key={u.slug}
                onClick={() => toggle(u.slug)}
                aria-pressed={selected.includes(u.slug)}
                className={`px-3 min-h-[44px] rounded-full text-xs font-medium transition-colors ${
                  selected.includes(u.slug)
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {u.short_name || u.name}
              </button>
            ))
          )}
        </div>

        {chosen.length ? (
          <div className="overflow-x-auto bg-glass rounded-xl p-4">
            <table className="w-full text-sm min-w-[540px]">
              <thead>
                <tr>
                  <th className="text-left p-2 text-muted-foreground font-medium w-40">Criteria</th>
                  {chosen.map((u) => (
                    <th key={u.slug} className="text-left p-2 text-foreground font-display">
                      <Link to={`/university/${u.slug}`} className="inline-flex items-center gap-1 hover:text-primary">
                        {u.short_name || u.name}
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <div className="mt-1">
                        <SaveButton
                          item={{
                            item_type: "university",
                            item_key: u.slug,
                            title: u.name,
                            subtitle: u.location ?? undefined,
                            metadata: { website_url: u.website_url, type: u.type },
                          }}
                        />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.label} className="border-t border-border/60 align-top">
                    <td className="p-2 text-muted-foreground">{r.label}</td>
                    {chosen.map((u) => (
                      <td key={u.slug} className="p-2 text-foreground">
                        {r.value(u)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a school above to start comparing.</p>
        )}
      </div>
    </div>
  );
};

export default Compare;
