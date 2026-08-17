import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Programme, University } from "@/hooks/useCatalogue";

export const DIRECTORY_PAGE_SIZE = 24;

export interface DirectoryFilters {
  search?: string | undefined;
  field?: string | undefined;
  region?: string | undefined;
  qualification?: string | undefined;
  degreeType?: string | undefined;
  institution?: string | undefined;
  verifiedOnly?: boolean | undefined;
  sort?: "name" | "newest" | undefined;
  page?: number | undefined;
}

export type DirectoryProgramme = Programme & {
  universities: Pick<University, "id" | "name" | "slug" | "region" | "type" | "location"> | null;
};

/** Server-side filtered, paginated programme directory , never loads the whole catalogue. */
export const programmeDirectoryQueryOptions = (filters: DirectoryFilters = {}) => {
  const {
    search = "",
    field,
    region,
    qualification,
    degreeType,
    institution,
    verifiedOnly = false,
    sort = "name",
    page = 0,
  } = filters;

  return queryOptions({
    queryKey: [
      "programme_directory",
      search,
      field,
      region,
      qualification,
      degreeType,
      institution,
      verifiedOnly,
      sort,
      page,
    ],
    queryFn: async () => {
      let q = supabase
        .from("programmes")
        .select(
          "id, slug, name, field, degree_type, qualification, duration, description, wassce_requirements, verification_status, verified, last_verified_at, source_url, programme_url, created_at, university_id, universities!inner(id, name, slug, region, type, location)",
          { count: "exact" },
        )
        .range(page * DIRECTORY_PAGE_SIZE, page * DIRECTORY_PAGE_SIZE + DIRECTORY_PAGE_SIZE - 1);

      q = sort === "newest" ? q.order("created_at", { ascending: false }) : q.order("name");

      if (field) q = q.eq("field", field);
      if (qualification) q = q.eq("qualification", qualification);
      if (degreeType) q = q.eq("degree_type", degreeType);
      if (verifiedOnly) q = q.eq("verified", true);
      if (region) q = q.eq("universities.region", region);
      if (institution) q = q.eq("universities.name", institution);
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        q = q.or(`name.ilike.${term},field.ilike.${term},description.ilike.${term}`);
      }

      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: (data ?? []) as unknown as DirectoryProgramme[], count: count ?? 0 };
    },
    staleTime: 60_000,
  });
};

export const useProgrammeDirectory = (filters: DirectoryFilters = {}) =>
  useQuery(programmeDirectoryQueryOptions(filters));

export interface Facet {
  kind: "field" | "degree_type" | "qualification" | "region" | "institution";
  value: string;
  count: number;
}

export const programmeFacetsQueryOptions = () =>
  queryOptions({
    queryKey: ["programme_facets"],
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programme_facets" as never)
        .select("kind, value, count");
      if (error) throw error;
      const rows = (data ?? []) as unknown as Facet[];
      const by = (kind: Facet["kind"]) =>
        rows
          .filter((r) => r.kind === kind && r.value)
          .sort((a, b) => Number(b.count) - Number(a.count));
      return {
        fields: by("field"),
        degreeTypes: by("degree_type"),
        qualifications: by("qualification"),
        regions: by("region").sort((a, b) => a.value.localeCompare(b.value)),
        institutions: by("institution"),
      };
    },
  });

export const useProgrammeFacets = () => useQuery(programmeFacetsQueryOptions());
