import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type GtecRow = Pick<
  Tables<"universities">,
  | "id"
  | "name"
  | "slug"
  | "institution_type"
  | "category"
  | "region"
  | "location"
  | "website_url"
  | "logo_url"
  | "logo_source_url"
  | "logo_verification_status"
  | "accreditation_status"
  | "gtec_accreditation_status"
  | "accreditation_expiry_date"
  | "verification_status"
  | "source_url"
  | "source_urls"
  | "last_verified_at"
  | "needs_review"
>;

export type GtecFilter = "all" | "confirmed" | "unconfirmed" | "no_source" | "in_review";

/** The GTEC ground-truth list an admin should check each record against. */
export const GTEC_LIST_URL = "https://gtec.edu.gh/accredited-institutions/";

const SELECT =
  "id, name, slug, institution_type, category, region, location, website_url, logo_url, logo_source_url, logo_verification_status, accreditation_status, gtec_accreditation_status, accreditation_expiry_date, verification_status, source_url, source_urls, last_verified_at, needs_review";

/** Every published institution, ready to be checked line by line against GTEC. */
export const useGtecInstitutions = (search: string, filter: GtecFilter, enabled: boolean) =>
  useQuery({
    queryKey: ["gtec_dashboard", search, filter],
    enabled,
    queryFn: async (): Promise<GtecRow[]> => {
      let q = supabase.from("universities").select(SELECT).order("name").limit(400);
      if (search.trim()) {
        const t = `%${search.trim()}%`;
        q = q.or(`name.ilike.${t},region.ilike.${t},location.ilike.${t}`);
      }
      if (filter === "confirmed") q = q.eq("gtec_accreditation_status", "Accredited");
      if (filter === "unconfirmed") q = q.or("gtec_accreditation_status.is.null,gtec_accreditation_status.neq.Accredited");
      if (filter === "no_source") q = q.is("source_url", null);
      if (filter === "in_review") q = q.eq("needs_review", true);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as unknown as GtecRow[];
    },
  });

export const useGtecCounts = (enabled: boolean) =>
  useQuery({
    queryKey: ["gtec_counts"],
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("universities")
        .select("gtec_accreditation_status, source_url, needs_review")
        .limit(1000);
      if (error) throw error;
      const rows = data ?? [];
      return {
        total: rows.length,
        confirmed: rows.filter((r) => r.gtec_accreditation_status === "Accredited").length,
        unconfirmed: rows.filter((r) => r.gtec_accreditation_status !== "Accredited").length,
        noSource: rows.filter((r) => !r.source_url).length,
        inReview: rows.filter((r) => r.needs_review).length,
      };
    },
  });

/** One-click decision against the GTEC list. */
export const useGtecDecision = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      decision,
      sourceUrl,
      name,
      note,
    }: {
      id: string;
      decision: "approve" | "reject";
      sourceUrl?: string | null;
      name: string;
      note?: string;
    }) => {
      const patch =
        decision === "approve"
          ? {
              gtec_accreditation_status: "Accredited",
              accreditation_status: "Accredited",
              verification_status: "verified",
              verified: true,
              needs_review: false,
              last_verified_at: new Date().toISOString(),
              ...(sourceUrl ? { source_url: sourceUrl, source_type: "regulator" } : {}),
            }
          : {
              gtec_accreditation_status: "Needs Verification",
              accreditation_status: "Needs Verification",
              verification_status: "needs_review",
              verified: false,
              needs_review: true,
            };

      const { error } = await supabase.from("universities").update(patch as never).eq("id", id);
      if (error) throw error;
      if (decision === "reject") {
        await supabase.from("corrections").insert({
          table_name: "universities",
          row_id: id,
          row_label: name,
          note: `Sent back from GTEC dashboard: ${note?.trim() || "not found on the GTEC accredited list"}`,
        });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gtec_dashboard"] });
      qc.invalidateQueries({ queryKey: ["gtec_counts"] });
      qc.invalidateQueries({ queryKey: ["review_counts"] });
      qc.invalidateQueries({ queryKey: ["universities"] });
    },
  });
};
