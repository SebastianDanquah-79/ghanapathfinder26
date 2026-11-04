import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { groupFilter, type InstitutionGroup } from "@/lib/legal";
import { withOfflinePublicCache } from "@/lib/offlineCache";

export interface UniversityAchievement {
  title: string;
  description?: string | null;
  year?: number | null;
  source_url: string;
  source_name?: string | null;
  verified: boolean;
}

export interface InstitutionProfileSource {
  label: string;
  url: string;
  source_type?: string | null;
}

export interface InstitutionProfileAlumnus {
  name: string;
  description?: string | null;
  source_url?: string | null;
}

export interface InstitutionProfileData {
  profile_status?: "researched" | "partial" | "not_started";
  overview?: string | null;
  history?: string | null;
  what_known_for?: string[];
  academic_strengths?: string[];
  schools_and_faculties?: string[];
  research_and_innovation?: string[];
  campus_and_student_life?: string | null;
  facilities?: string[];
  notable_alumni?: InstitutionProfileAlumnus[];
  milestones?: UniversityAchievement[];
  sources?: InstitutionProfileSource[];
  last_researched_at?: string | null;
}

export type University = Omit<Tables<"universities">, "biography" | "biography_source_url" | "achievements" | "slug_aliases" | "institution_profile"> & {
  biography: string | null;
  biography_source_url: string | null;
  achievements: UniversityAchievement[];
  slug_aliases: string[];
  institution_profile: InstitutionProfileData;
};
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

// GTEC public notice dated 8 July 2026. These institutions should not be presented
// as currently accredited unless a newer verified accreditation record supersedes the notice.
const GTEC_EXPIRED_2026 = new Set([
  "Abbeam Institute of Technology",
  "SS Peter and Paul Pastoral and Social Institute",
  "Community College",
  "Mumford Institute of Technology",
  "ILMA Institute of Science and Technology",
  "River View College",
  "Synergies Institute",
  "Institute of Local Government Studies",
  "Ohawu College of Agriculture",
  "College of Tropical Agriculture",
  "Animal Health and Production College",
  "Kwadaso Agricultural College",
  "Hopkins Health Training institute",
  "Manaata School of Midwifery",
  "Western Hills School of Nursing",
  "Oak City International College",
  "Nursing and Midwifery Training College, Asankrangwa",
  "Holy Spirit College of Education",
  "Islamic Nursing Training School",
  "Springs College",
  "Wintech Professional Institute",
  "Trans Africa College",
  "Institute of Business Management and Journalism",
  "Rural Development College",
  "University College of Agriculture and Environmental Studies",
  "School of Anaesthesia",
  "Unique Citizens College",
  "Kings and Queens Medical College",
  "Royal Nursing College",
  "Zenith University College",
  "Jayee University College",
  "Modal College",
  "Nursing & Midwifery Training College, Cape Coast",
  "Archbishop Porter Girls’ Polytechnic",
]);

const normalizeInstitutionName = (value: string) => value.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9]+/g, " ").trim();
const expiredNames = new Set(Array.from(GTEC_EXPIRED_2026).map(normalizeInstitutionName));

export const isInstitutionGtecExpired2026 = (university: Pick<University, "name" | "accreditation_status">) => {
  const name = normalizeInstitutionName(university.name);
  if (expiredNames.has(name)) return true;
  const status = (university.accreditation_status ?? "").toLowerCase();
  return status.includes("expired") || status.includes("unaccredited");
};

export const catalogueSearchQueryOptions = (
  query: string,
  kind: "all" | "university" | "programme" | "scholarship" = "all",
  page = 0,
) =>
  queryOptions({
    queryKey: ["catalogue_search", query, kind, page],
    queryFn: async () => withOfflinePublicCache(`catalogue-search:${kind}:${page}:${query.trim().toLowerCase()}`, async () => {
      const { data, error } = await supabase.rpc("search_catalogue", {
        _q: query,
        _kind: kind,
        _limit: PAGE_SIZE,
        _offset: page * PAGE_SIZE,
      });
      if (error) throw error;
      const rows = (data ?? []) as unknown as SearchResult[];
      return kind === "university" || kind === "all"
        ? rows.filter((r) => r.kind !== "university" || !Array.from(expiredNames).includes(normalizeInstitutionName(r.title)))
        : rows;
    }),
    staleTime: 60_000,
  });

export const useCatalogueSearch = (query: string, kind: "all" | "university" | "programme" | "scholarship" = "all", page = 0) =>
  useQuery(catalogueSearchQueryOptions(query, kind, page));

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
  const { search = "", type = "All", region, category, group = "All", page = 0, pageSize = 24 } = filters;
  return queryOptions({
    queryKey: ["universities", search, type, region, category, group, page, pageSize],
    queryFn: async () => withOfflinePublicCache(`universities:${JSON.stringify({ search, type, region, category, group, page, pageSize })}`, async () => {
      let q = supabase.from("universities").select("*", { count: "exact" }).order("name").range(page * pageSize, page * pageSize + pageSize - 1);
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
        q = q.or(`name.ilike.${term},short_name.ilike.${term},location.ilike.${term},region.ilike.${term},category.ilike.${term}`);
      }
      const { data, error, count } = await q;
      if (error) throw error;
      const rows = ((data ?? []) as University[]).filter((u) => !isInstitutionGtecExpired2026(u));
      return { rows, count: Math.max(0, (count ?? 0) - (((data ?? []) as University[]).length - rows.length)) };
    }),
    staleTime: 60_000,
  });
};

export const useUniversities = (filters: UniversityFilters = {}) => useQuery(universitiesQueryOptions(filters));

export const universityQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["university", slug],
    queryFn: async () => {
      const { data: exactMatch, error } = await supabase.from("universities").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;

      // Old duplicate profile URLs remain valid after records are consolidated.
      let row = exactMatch;
      if (!row) {
        const { data: aliasMatch, error: aliasError } = await supabase
          .from("universities")
          .select("*")
          .contains("slug_aliases", [slug])
          .maybeSingle();
        if (aliasError) throw aliasError;
        row = aliasMatch;
      }

      const university = row as University | null;
      return university && !isInstitutionGtecExpired2026(university) ? university : null;
    },
    staleTime: 60_000,
  });

export const useUniversity = (slug?: string) => useQuery({ ...universityQueryOptions(slug ?? ""), enabled: !!slug });

export const programmesQueryOptions = (universityId?: string, search = "") =>
  queryOptions({
    queryKey: ["programmes", universityId, search],
    queryFn: async () => withOfflinePublicCache(`programmes:${universityId ?? "all"}:${search.trim().toLowerCase()}`, async () => {
      let q = supabase.from("programmes").select("*").order("name").limit(500);
      if (universityId) q = q.eq("university_id", universityId);
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        q = q.or(`name.ilike.${term},field.ilike.${term}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Programme[];
    }),
    staleTime: 60_000,
  });

export const useProgrammes = (universityId?: string, search = "") => useQuery({ ...programmesQueryOptions(universityId, search), enabled: !!universityId || !!search });

export const useProgramme = (slug?: string) =>
  useQuery({
    queryKey: ["programme", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase.from("programmes").select("*, universities(*)").eq("slug", slug!).maybeSingle();
      if (error) throw error;
      const value = data as (Programme & { universities: University | null }) | null;
      return value && value.universities && !isInstitutionGtecExpired2026(value.universities) ? value : null;
    },
  });

export const scholarshipRecordsQueryOptions = (search = "", type: string = "All") =>
  queryOptions({
    queryKey: ["scholarships_db", search, type],
    queryFn: async () => withOfflinePublicCache(`scholarships:${search.trim().toLowerCase()}:${type}`, async () => {
      let q = supabase.from("scholarships").select("*").order("name").limit(100);
      if (type !== "All") q = q.eq("type", type);
      if (search.trim()) {
        const term = `%${search.trim()}%`;
        q = q.or(`name.ilike.${term},provider.ilike.${term},eligibility.ilike.${term},study_level.ilike.${term}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ScholarshipRecord[];
    }),
    staleTime: 60_000,
  });

export const useScholarshipRecords = (search = "", type: string = "All") => useQuery(scholarshipRecordsQueryOptions(search, type));

export const formatVerified = (iso: string | null) => iso ? `Last verified: ${new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}` : "Not yet verified";
