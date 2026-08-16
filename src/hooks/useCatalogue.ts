import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { groupFilter, type InstitutionGroup } from "@/lib/legal";

export type University = Tables<"universities">;
export type Programme = Tables<"programmes">;
export type ScholarshipRecord = Tables<"scholarships">;

export interface SearchResult {
  kind: "university" | "programme" | "scholarship";
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  meta: Record<string, unknown>;
  score: number | null;
}

export const PAGE_SIZE = 12;

/** Unified, database-backed search across universities, programmes and scholarships. */
export const catalogueSearchQueryOptions = (
  query: string,
  kind: "all" | "university" | "programme" | "scholarship" = "all",
  page = 0,
) =>
  queryOptions({
    queryKey: ["catalogue_search", query, kind, page],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_catalogue", {
        _q: query,
        _kind: kind,
        _limit: PAGE_SIZE,
        _offset: page * PAGE_SIZE,
      });
      if (error) throw error;
      return (data ?? []) as unknown as SearchResult[];
    },
    staleTime: 60_000,
  });

export const useCatalogueSearch = (
  query: string,
  kind: "all" | "university" | "programme" | "scholarship" = "all",
  page = 0,
) => useQuery(catalogueSearchQueryOptions(query, kind, page));

export interface UniversityFilters {
  search?: string | undefined;
  type?: "All" | "Public" | "Private" | undefined;
  region?: string | undefined;
  category?: string | undefined;
  group?: InstitutionGroup | "All" | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export const universitiesQueryOptions = (filters: UniversityFilters = {}) => {
  const {
    search = "",
    type = "All",
    region,
    category,
    group = "All",
    page = 0,
    pageSize = 24,
  } = filters;
  return queryOptions({
    queryKey: ["universities", search, type, region, category, group, page, pageSize],
    queryFn: async () => {
      let q = supabase
        .from("universities")
        .select("*", { count: "exact" })
        .order("name")
        .range(page * pageSize, page * pageSize + pageSize - 1);

      if (group !== "All") {
        const gf = groupFilter(group);
        q = q.in("category", gf.categories);
        if (gf.type) q = q.eq("type", gf.type);
      }
      if (type !== "All") q = q.eq("type", type);
      if (region) q = q.eq("region", region);
      if (category) q = q.eq("category", category);
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        q = q.or(
          `name.ilike.${term},short_name.ilike.${term},location.ilike.${term},region.ilike.${term},category.ilike.${term}`,
        );
      }
      const { data, error, count } = await q;
      if (error) throw error;
      return { rows: (data ?? []) as University[], count: count ?? 0 };
    },
    staleTime: 60_000,
  });
};

export const useUniversities = (filters: UniversityFilters = {}) =>
  useQuery(universitiesQueryOptions(filters));

export const useUniversity = (slug?: string) =>
  useQuery({
    queryKey: ["university", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as University | null;
    },
  });

export const useProgrammes = (universityId?: string, search = "") =>
  useQuery({
    queryKey: ["programmes", universityId, search],
    enabled: !!universityId || !!search,
    queryFn: async () => {
      let q = supabase.from("programmes").select("*").order("name").limit(100);
      if (universityId) q = q.eq("university_id", universityId);
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        q = q.or(`name.ilike.${term},field.ilike.${term}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Programme[];
    },
  });

export const useProgramme = (slug?: string) =>
  useQuery({
    queryKey: ["programme", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("programmes")
        .select("*, universities(*)")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as (Programme & { universities: University | null }) | null;
    },
  });

export const scholarshipRecordsQueryOptions = (search = "", type: string = "All") =>
  queryOptions({
    queryKey: ["scholarships_db", search, type],
    queryFn: async () => {
      let q = supabase.from("scholarships").select("*").order("name").limit(100);
      if (type !== "All") q = q.eq("type", type);
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        q = q.or(
          `name.ilike.${term},provider.ilike.${term},eligibility.ilike.${term},study_level.ilike.${term}`,
        );
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ScholarshipRecord[];
    },
    staleTime: 60_000,
  });

export const useScholarshipRecords = (search = "", type: string = "All") =>
  useQuery(scholarshipRecordsQueryOptions(search, type));

export const formatVerified = (iso: string | null) =>
  iso
    ? `Last verified: ${new Date(iso).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      })}`
    : "Not yet verified";
