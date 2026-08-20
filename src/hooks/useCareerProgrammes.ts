import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CareerProgrammeRow {
  id: string;
  slug: string;
  name: string;
  field: string | null;
  degree_type: string;
  qualification: string | null;
  verified: boolean;
  verification_status: string;
  universities: {
    id: string;
    name: string;
    short_name: string | null;
    slug: string;
    location: string | null;
    region: string | null;
    type: string;
  } | null;
}

const sel = (s: string): string => s;

/**
 * Programmes in the verified catalogue whose name matches any of the
 * career's recommended / alternative programme keywords.
 * Only verified records are returned (spec: "only display programmes that
 * can be verified").
 */
export const careerProgrammesQueryOptions = (keywords: string[], limit = 24) =>
  queryOptions({
    queryKey: ["career_programmes", keywords.join("|"), limit],
    queryFn: async () => {
      if (keywords.length === 0) return [] as CareerProgrammeRow[];
      const filter = keywords
        .map((k) => `name.ilike.%${k.replace(/[,()%]/g, " ").trim()}%`)
        .join(",");
      const { data, error } = await supabase
        .from("programmes")
        .select(
          sel(
            "id, slug, name, field, degree_type, qualification, verified, verification_status, universities!inner(id, name, short_name, slug, location, region, type)",
          ),
        )
        .or(filter)
        .eq("verified", true)
        .order("name")
        .limit(limit)
        .returns<CareerProgrammeRow[]>();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60_000,
  });

export const useCareerProgrammes = (keywords: string[], limit = 24) =>
  useQuery(careerProgrammesQueryOptions(keywords, limit));
