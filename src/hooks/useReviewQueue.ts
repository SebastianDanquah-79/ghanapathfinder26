import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ReviewTable =
  | "institutions"
  | "universities"
  | "programmes"
  | "internship_providers"
  | "skill_providers";

export interface ReviewFieldSpec {
  key: string;
  label: string;
  type?: "text" | "textarea" | "url" | "boolean";
}

/** Fields an admin can edit inline for each reviewable table. */
export const REVIEW_FIELDS: Record<ReviewTable, ReviewFieldSpec[]> = {
  institutions: [
    { key: "official_name", label: "Official name" },
    { key: "institution_type", label: "Institution type" },
    { key: "gtec_accreditation_status", label: "GTEC status" },
    { key: "region", label: "Region" },
    { key: "town", label: "Town" },
    { key: "website_url", label: "Website", type: "url" },
    { key: "logo_source_url", label: "Logo source", type: "url" },
    { key: "google_place_id", label: "Google place ID" },
    { key: "short_description", label: "Short description", type: "textarea" },
  ],
  universities: [
    { key: "name", label: "Official name" },
    { key: "institution_type", label: "Institution type" },
    { key: "gtec_accreditation_status", label: "GTEC status" },
    { key: "region", label: "Region" },
    { key: "location", label: "Town" },
    { key: "website_url", label: "Website", type: "url" },
    { key: "logo_source_url", label: "Logo source", type: "url" },
    { key: "google_place_id", label: "Google place ID" },
    { key: "short_description", label: "Short description", type: "textarea" },
  ],
  programmes: [
    { key: "name", label: "Programme name" },
    { key: "qualification", label: "Degree level" },
    { key: "department", label: "Department" },
    { key: "duration", label: "Duration" },
    { key: "mode", label: "Mode" },
    { key: "admission_summary", label: "Admission summary", type: "textarea" },
    { key: "programme_url", label: "Source", type: "url" },
  ],
  internship_providers: [
    { key: "name", label: "Name" },
    { key: "sector", label: "Sector" },
    { key: "provider_type", label: "Provider type" },
    { key: "website_url", label: "Website", type: "url" },
    { key: "logo_source_url", label: "Logo source", type: "url" },
    { key: "programme_summary", label: "Programme summary", type: "textarea" },
    { key: "application_url", label: "Application link", type: "url" },
    { key: "paid", label: "Paid", type: "boolean" },
  ],
  skill_providers: [
    { key: "provider_name", label: "Provider" },
    { key: "course_name", label: "Course" },
    { key: "skill_area", label: "Skill area" },
    { key: "format", label: "Format" },
    { key: "duration", label: "Duration" },
    { key: "cost", label: "Cost" },
    { key: "certification_issued_by", label: "Certificate issued by" },
    { key: "application_url", label: "Application link", type: "url" },
  ],
};

export const TABLE_LABELS: Record<ReviewTable, string> = {
  institutions: "New institutions",
  universities: "Directory institutions",
  programmes: "Programmes",
  internship_providers: "Internship providers",
  skill_providers: "Skills & course providers",
};

export type ReviewRow = Record<string, any> & { id: string };

const titleOf = (table: ReviewTable, row: ReviewRow) =>
  (row["name"] ?? row["provider_name"] ?? row["official_name"] ?? "Untitled") as string;

export const rowTitle = titleOf;

/** Every row still awaiting review, grouped by table. */
export const useReviewQueue = (table: ReviewTable, enabled: boolean) =>
  useQuery({
    queryKey: ["review_queue", table],
    enabled,
    queryFn: async (): Promise<ReviewRow[]> => {
      const select =
        table === "universities"
          ? "id, name, institution_type, gtec_accreditation_status, region, location, website_url, logo_url, logo_source_url, logo_verification_status, google_place_id, short_description, source_urls, last_verified_at, needs_review, verification_notes, verified_by, verification_method"
          : table === "institutions"
            ? "id, official_name, institution_type, gtec_accreditation_status, region, town, website_url, logo_source_url, logo_verification_status, google_place_id, short_description, source_urls, last_verified_at, needs_review, verification_notes, verified_by, verification_method"
            : table === "programmes"
              ? "id, name, qualification, department, duration, mode, admission_summary, programme_url, source_url, source_urls, verification_status, last_verified_at, needs_review, verification_notes, verified_by, verification_method, universities(name)"
              : "*";
      const { data, error } = await supabase
        .from(table as any)
        .select(select)
        .eq("needs_review", true)
        .limit(300);
      if (error) throw error;
      const rows = ((data ?? []) as unknown as ReviewRow[]).slice();
      rows.sort((a, b) => {
        const t = String(a["institution_type"] ?? "").localeCompare(String(b["institution_type"] ?? ""));
        return t !== 0 ? t : titleOf(table, a).localeCompare(titleOf(table, b));
      });
      return rows;
    },
  });

export const useReviewCounts = (enabled: boolean) =>
  useQuery({
    queryKey: ["review_counts"],
    enabled,
    queryFn: async () => {
      const tables: ReviewTable[] = [
        "institutions",
        "universities",
        "programmes",
        "internship_providers",
        "skill_providers",
      ];
      const entries = await Promise.all(
        tables.map(async (t) => {
          const { count, error } = await supabase
            .from(t as any)
            .select("id", { count: "exact", head: true })
            .eq("needs_review", true);
          if (error) throw error;
          return [t, count ?? 0] as const;
        }),
      );
      return Object.fromEntries(entries) as Record<ReviewTable, number>;
    },
  });

/** Save edits and/or mark a row as reviewed. */
export const useReviewAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      table,
      id,
      patch,
      approve,
    }: {
      table: ReviewTable;
      id: string;
      patch?: Record<string, any>;
      approve?: boolean;
    }) => {
      const body: Record<string, any> = { ...(patch ?? {}) };
      if (approve) {
        const { data: auth } = await supabase.auth.getUser();
        body["needs_review"] = false;
        body["last_verified_at"] = new Date().toISOString();
        body["verification_method"] = "manual_review";
        body["verified_by"] = auth.user?.id ?? null;
        if (table === "universities" || table === "programmes") {
          body["verified"] = true;
          body["verification_status"] = "verified";
        }
      }
      const { error } = await supabase.from(table as any).update(body).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["review_queue"] });
      qc.invalidateQueries({ queryKey: ["review_counts"] });
      qc.invalidateQueries({ queryKey: ["universities"] });
    },
  });
};

/** Reject: keep the row flagged and record why. */
export const useRejectRow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ table, id, label, note }: { table: ReviewTable; id: string; label: string; note: string }) => {
      const { error } = await supabase.from("corrections").insert({
        table_name: table,
        row_id: id,
        row_label: label,
        note: `Rejected in review: ${note}`,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["corrections"] }),
  });
};

export const useCorrections = (enabled: boolean) =>
  useQuery({
    queryKey: ["corrections"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("corrections")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });

export const useResolveCorrection = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("corrections").update({ resolved: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["corrections"] }),
  });
};

/** Public "flag this listing" submission. */
export const useFlagListing = () =>
  useMutation({
    mutationFn: async ({ table, id, label, note }: { table: string; id?: string; label: string; note: string }) => {
      const { error } = await supabase.from("corrections").insert({
        table_name: table,
        ...(id ? { row_id: id } : {}),
        row_label: label,
        note,
      });
      if (error) throw error;
    },
  });
