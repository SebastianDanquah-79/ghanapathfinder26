import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";

interface ProgrammeOption {
  id: string;
  slug: string;
  name: string;
  field: string | null;
  qualification: string | null;
  degree_type: string | null;
  career_opportunities: string[] | null;
}

const columns =
  "id, slug, name, field, qualification, degree_type, career_opportunities";

const categories = [
  "All programmes",
  "Arts & creativity",
  "Humanities & languages",
  "Social sciences",
  "Business & finance",
  "Computing & technology",
  "Engineering & built environment",
  "Health",
  "Science & environment",
  "Education",
  "Agriculture & food",
  "Law & public service",
  "Tourism & hospitality",
] as const;

type Category = (typeof categories)[number];

const categoryTerms: Partial<Record<Category, string[]>> = {
  "Arts & creativity": [
    "graphic design", "communication design", "fashion", "textile", "fine art",
    "visual art", "creative art", "industrial art", "integrated art", "painting",
    "sculpture", "animation", "film", "theatre", "theater", "music",
    "performing art", "creative arts", "arts and design", "product design",
    "photography", "ceramic", "jewellery", "jewelry", "illustration",
  ],
  "Humanities & languages": [
    "history", "philosophy", "literature", "linguistic", "language", "english",
    "french", "arabic", "spanish", "translation", "interpretation", "religion",
    "theology", "african studies", "archaeology", "anthropology", "culture",
  ],
  "Social sciences": [
    "political science", "sociology", "psychology", "social work", "development studies",
    "international relations", "peace and security", "public policy", "gender studies",
    "social science", "criminology", "community development",
  ],
  "Business & finance": [
    "business", "accounting", "finance", "marketing", "management", "economics",
    "entrepreneurship", "procurement", "supply chain", "human resource", "actuarial",
    "banking", "insurance", "commerce", "administration",
  ],
  "Computing & technology": [
    "computer science", "software", "information technology", "computing", "ict",
    "cybersecurity", "data science", "informatics", "artificial intelligence",
    "information systems", "network", "telecommunications", "robotics", "electronics",
  ],
  "Engineering & built environment": [
    "engineering", "construction", "architecture", "quantity surveying",
    "building technology", "geomatic", "land surveying", "urban planning",
    "transport planning", "industrial technology",
  ],
  Health: [
    "medicine", "nursing", "public health", "pharmacy", "midwifery", "dental",
    "medical laboratory", "physiotherapy", "nutrition", "health information",
    "biomedical", "optometry", "radiography", "physician assistant", "audiology",
  ],
  "Science & environment": [
    "biology", "biological science", "chemistry", "physics", "mathematics",
    "statistics", "environmental", "climate", "geology", "earth science",
    "geography", "biochemistry", "biotechnology", "meteorology",
  ],
  Education: ["education", "teaching", "teacher training", "curriculum", "pedagogy"],
  "Agriculture & food": [
    "agric", "food science", "aquaculture", "animal science", "fisheries",
    "agribusiness", "veterinary", "crop science", "soil science", "agro-processing",
  ],
  "Law & public service": [
    "law", "political science", "public administration", "governance",
    "international relations", "criminology", "security studies", "public policy",
  ],
  "Tourism & hospitality": [
    "hotel", "hospitality", "tourism", "travel", "catering", "event management",
    "culinary", "leisure management",
  ],
};

const safeFilterValue = (value: string) =>
  value.replace(/[,*()%]/g, " ").replace(/\s+/g, " ").trim();

const ProgrammeCareerExplorer = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<Category>("All programmes");
  const [pageSize, setPageSize] = useState(24);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(safeFilterValue(search)), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPageSize(24);
  }, [debouncedSearch, category]);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ["career-path-programmes", debouncedSearch, category, pageSize],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      let request = supabase
        .from("programmes")
        .select(columns, { count: "exact" });

      if (debouncedSearch) {
        const term = debouncedSearch;
        request = request.or(
          `name.ilike.%${term}%,field.ilike.%${term}%,qualification.ilike.%${term}%,degree_type.ilike.%${term}%`,
        );
      } else {
        const terms = categoryTerms[category];
        if (terms?.length) {
          const filters = terms.flatMap((term) => [
            `name.ilike.%${term}%`,
            `field.ilike.%${term}%`,
          ]);
          request = request.or(filters.join(","));
        }
      }

      const { data: programmes, error, count } = await request
        .order("name", { ascending: true })
        .range(0, pageSize - 1)
        .returns<ProgrammeOption[]>();

      if (error) throw error;
      return { programmes: programmes ?? [], count: count ?? 0 };
    },
  });

  const programmes = data?.programmes ?? [];
  const total = data?.count ?? 0;

  return (
    <section className="my-10" aria-labelledby="programme-career-explorer-title">
      <div className="max-w-3xl mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-2">
          Programme-to-career guide
        </p>
        <h2
          id="programme-career-explorer-title"
          className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2"
        >
          Every programme can lead to more than one career.
        </h2>
        <p className="text-sm text-muted-foreground leading-6">
          Search the programme catalogue to explore possible jobs linked to each course,
          including fine arts, graphic design, fashion, music, theatre, languages, humanities,
          social sciences, business, science, technology and professional programmes.
        </p>
      </div>

      <div className="border border-border rounded-2xl bg-card p-4 sm:p-5 mb-4">
        <label
          htmlFor="programme-career-search"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          Find a programme
        </label>
        <input
          id="programme-career-search"
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCategory("All programmes");
          }}
          placeholder="Try Fine Arts, Political Science, Nursing or Graphic Design"
          className="w-full min-h-12 rounded-lg border border-input bg-background px-4 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/20"
        />

        <div className="flex flex-wrap gap-2 mt-4" aria-label="Programme categories">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item && !debouncedSearch}
              onClick={() => {
                setSearch("");
                setDebouncedSearch("");
                setCategory(item);
              }}
              className={
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
                (category === item && !debouncedSearch
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground")
              }
            >
              {item}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3" aria-live="polite">
          {isLoading
            ? "Loading programmes…"
            : `Showing ${programmes.length} of ${total} matching programmes`}
        </p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-foreground font-medium">Programme careers could not be loaded.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Please try again or open the full{" "}
            <Link to="/programmes" className="text-primary underline underline-offset-2">
              programme directory
            </Link>
            .
          </p>
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading programme and career options…
        </div>
      ) : programmes.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="font-semibold text-foreground mb-1">No matching programmes</h3>
          <p className="text-sm text-muted-foreground">
            Try a different programme name or choose another category.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {programmes.map((programme) => (
              <article
                key={programme.id}
                className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5"
              >
                <p className="text-[11px] font-medium uppercase tracking-wide text-primary mb-1.5">
                  {[programme.qualification || programme.degree_type, programme.field]
                    .filter(Boolean)
                    .join(" · ") || "Programme"}
                </p>
                <h3 className="font-display font-semibold text-foreground leading-5">
                  <Link
                    to={`/programmes/${programme.slug}`}
                    className="hover:text-primary underline-offset-4 hover:underline"
                  >
                    {programme.name}
                  </Link>
                </h3>

                <p className="text-xs font-semibold text-foreground mt-4 mb-2">
                  Possible career options
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(programme.career_opportunities ?? []).length > 0 ? (
                    programme.career_opportunities!.map((career) => (
                      <span
                        key={career}
                        className="rounded-md bg-secondary px-2.5 py-1.5 text-xs leading-4 text-secondary-foreground"
                      >
                        {career}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Career options are being added for this programme.
                    </span>
                  )}
                </div>
                <Link
                  to={`/programmes/${programme.slug}`}
                  className="inline-flex mt-4 text-xs font-semibold text-primary hover:underline underline-offset-4"
                >
                  View programme details <span aria-hidden="true" className="ml-1">→</span>
                </Link>
              </article>
            ))}
          </div>

          {programmes.length < total && (
            <div className="mt-5 text-center">
              <button
                type="button"
                disabled={isFetching}
                onClick={() => setPageSize((size) => size + 24)}
                className="rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-50"
              >
                {isFetching ? "Loading…" : "Load more programmes"}
              </button>
            </div>
          )}
        </>
      )}

      <p className="text-xs text-muted-foreground leading-5 mt-4">
        Career options are possibilities, not job guarantees. Your actual route depends on the
        programme content, skills, experience and any professional registration required for
        the role. Use the programme profile to check the institution's current details.
      </p>
    </section>
  );
};

export default ProgrammeCareerExplorer;
