import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Tables } from "@/integrations/supabase/types";

export type Institution = Tables<"universities">;
export type ProgrammeRow = Tables<"programmes">;

export const ACCREDITATION_STATUSES = [
  "Accredited",
  "Provisionally Accredited",
  "Needs Verification",
  "Unaccredited",
  "Unrecognized",
] as const;

export const VERIFICATION_STATUSES = ["verified", "needs_review", "outdated", "unverified"] as const;

/** True when the signed-in user holds the admin role. */
export const useIsAdmin = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["is_admin", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user!.id)
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    staleTime: 300_000,
  });
};

export interface CompletenessReport {
  institutions: number;
  institutionsVerified: number;
  institutionsAccredited: number;
  institutionsMissingWebsite: number;
  institutionsMissingProgrammes: number;
  institutionsNeedingReview: number;
  programmes: number;
  programmesVerified: number;
  programmesMissingRequirements: number;
  cutoffs: number;
  sources: number;
  byCategory: { category: string; count: number }[];
  byRegion: { region: string; count: number }[];
}

const count = async (
  table: "universities" | "programmes" | "programme_cutoffs" | "data_sources",
  build?: (q: any) => any,
) => {
  let q: any = supabase.from(table).select("id", { count: "exact", head: true });
  if (build) q = build(q);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
};

/** Administrative data-completeness report across the whole catalogue. */
export const useCompletenessReport = (enabled: boolean) =>
  useQuery({
    queryKey: ["completeness_report"],
    enabled,
    queryFn: async (): Promise<CompletenessReport> => {
      const [{ data: insts, error: e1 }, { data: progs, error: e2 }] = await Promise.all([
        supabase
          .from("universities")
          .select("id, category, region, website_url, verification_status, accreditation_status")
          .limit(2000),
        supabase.from("programmes").select("id, university_id, verification_status, entry_requirements").limit(5000),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;

      const institutions = insts ?? [];
      const programmes = progs ?? [];
      const withProgrammes = new Set(programmes.map((p) => p.university_id));

      const tally = (key: "category" | "region") => {
        const m = new Map<string, number>();
        institutions.forEach((i) => {
          const k = (i[key] as string | null) || "Unknown";
          m.set(k, (m.get(k) ?? 0) + 1);
        });
        return [...m.entries()]
          .map(([k, v]) => ({ [key]: k, count: v }))
          .sort((a, b) => (b.count as number) - (a.count as number)) as any;
      };

      const [cutoffs, sources] = await Promise.all([count("programme_cutoffs"), count("data_sources")]);

      return {
        institutions: institutions.length,
        institutionsVerified: institutions.filter((i) => i.verification_status === "verified").length,
        institutionsAccredited: institutions.filter((i) => i.accreditation_status === "Accredited").length,
        institutionsMissingWebsite: institutions.filter((i) => !i.website_url).length,
        institutionsMissingProgrammes: institutions.filter((i) => !withProgrammes.has(i.id)).length,
        institutionsNeedingReview: institutions.filter((i) => i.verification_status !== "verified").length,
        programmes: programmes.length,
        programmesVerified: programmes.filter((p) => p.verification_status === "verified").length,
        programmesMissingRequirements: programmes.filter((p) => !p.entry_requirements).length,
        cutoffs,
        sources,
        byCategory: tally("category"),
        byRegion: tally("region"),
      };
    },
    staleTime: 60_000,
  });

/** Institutions list for the admin console, filtered by free text. */
export const useAdminInstitutions = (search: string, enabled: boolean) =>
  useQuery({
    queryKey: ["admin_institutions", search],
    enabled,
    queryFn: async () => {
      let q = supabase.from("universities").select("*").order("name").limit(60);
      if (search.trim()) {
        const t = `%${search.trim()}%`;
        q = q.or(`name.ilike.${t},location.ilike.${t},region.ilike.${t},category.ilike.${t}`);
      }
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Institution[];
    },
  });

export const useUpdateInstitution = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Institution> }) => {
      const { error } = await supabase.from("universities").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_institutions"] });
      qc.invalidateQueries({ queryKey: ["completeness_report"] });
      qc.invalidateQueries({ queryKey: ["universities"] });
    },
  });
};

export interface ImportRow {
  name: string;
  category?: string;
  type?: string;
  location?: string;
  region?: string;
  website_url?: string;
  admissions_url?: string;
  accreditation_status?: string;
  source_url?: string;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

/** Bulk import with duplicate detection against names, short names and aliases. */
export const useImportInstitutions = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: ImportRow[]) => {
      const inserted: string[] = [];
      const skipped: { name: string; existing: string }[] = [];
      for (const row of rows) {
        if (!row.name?.trim()) continue;
        const { data: dupes, error: dupErr } = await supabase.rpc("find_duplicate_institution", {
          _name: row.name.trim(),
        });
        if (dupErr) throw dupErr;
        if (dupes && dupes.length) {
          skipped.push({ name: row.name, existing: (dupes as any[])[0].name });
          continue;
        }
        const { error } = await supabase.from("universities").insert({
          slug: slugify(row.name),
          name: row.name.trim(),
          category: row.category || "University",
          type: row.type || "Private",
          location: row.location || null,
          region: row.region || null,
          website_url: row.website_url || null,
          admissions_url: row.admissions_url || null,
          accreditation_status: row.accreditation_status || "Needs Verification",
          verification_status: "needs_review",
          source_url: row.source_url || null,
          source_type: row.source_url ? "regulator" : "unverified",
        });
        if (error) throw error;
        inserted.push(row.name);
      }
      return { inserted, skipped };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_institutions"] });
      qc.invalidateQueries({ queryKey: ["completeness_report"] });
    },
  });
};
