import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type DataSource = Tables<"data_sources">;

export const SOURCE_TYPES = [
  "official_university",
  "official_institution",
  "government",
  "regulator",
  "scholarship_provider",
  "admissions_portal",
  "public_database",
  "other",
] as const;

export const SOURCE_STATUSES = ["verified", "needs_review", "outdated"] as const;
export const RECORD_TYPES = ["institution", "programme", "scholarship"] as const;

export interface LinkTarget {
  id: string;
  label: string;
}

/** Search institutions / programmes / scholarships to attach a source to. */
export const useSourceTargets = (recordType: string, search: string, enabled: boolean) =>
  useQuery({
    queryKey: ["admin_source_targets", recordType, search],
    enabled: enabled && search.trim().length > 1,
    queryFn: async (): Promise<LinkTarget[]> => {
      const q = `%${search.trim()}%`;
      if (recordType === "programme") {
        const { data } = await supabase
          .from("programmes")
          .select("id,name,universities(short_name,name)")
          .ilike("name", q)
          .limit(20);
        return (data ?? []).map((p) => {
          const uni = p.universities as { short_name: string | null; name: string } | null;
          return { id: p.id, label: `${p.name}${uni ? ` — ${uni.short_name ?? uni.name}` : ""}` };
        });
      }
      if (recordType === "scholarship") {
        const { data } = await supabase.from("scholarships").select("id,name").ilike("name", q).limit(20);
        return (data ?? []).map((s) => ({ id: s.id, label: s.name }));
      }
      const { data } = await supabase.from("universities").select("id,name").ilike("name", q).limit(20);
      return (data ?? []).map((u) => ({ id: u.id, label: u.name }));
    },
  });

/** Sources stored in the admin-managed data_sources table. */
export const useAdminSources = (search: string, enabled: boolean) =>
  useQuery({
    queryKey: ["admin_sources", search],
    enabled,
    queryFn: async (): Promise<DataSource[]> => {
      let query = supabase
        .from("data_sources")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(100);
      if (search.trim()) query = query.or(`source_name.ilike.%${search}%,source_url.ilike.%${search}%`);
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

export interface SourceInput {
  id?: string;
  record_type: string;
  record_id: string;
  source_url: string;
  source_name: string;
  source_type: string;
  verification_status: string;
  verified_at: string;
}

export const useSaveSource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SourceInput) => {
      const payload = {
        record_type: input.record_type,
        record_id: input.record_id,
        source_url: input.source_url.trim(),
        source_name: input.source_name.trim() || null,
        source_type: input.source_type,
        verification_status: input.verification_status,
        verified_at: new Date(input.verified_at).toISOString(),
      };
      const { error } = input.id
        ? await supabase.from("data_sources").update(payload).eq("id", input.id)
        : await supabase.from("data_sources").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_sources"] });
      qc.invalidateQueries({ queryKey: ["source_directory"] });
    },
  });
};

export const useDeleteSource = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("data_sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin_sources"] });
      qc.invalidateQueries({ queryKey: ["source_directory"] });
    },
  });
};
