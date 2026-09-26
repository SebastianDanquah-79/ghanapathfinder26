import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SourceRecord {
  url: string;
  name: string;
  /** Human category, e.g. "Regulatory Body". */
  type: string;
  /** What GhanaPathFinder actually uses this source for. */
  usedFor: string[];
  /** How many stored records trace back to this source. */
  records: number;
  lastVerified: string | null;
  status: string;
}

const push = (
  map: Map<string, SourceRecord>,
  url: string | null | undefined,
  name: string,
  type: string,
  usedFor: string,
  verified: string | null,
  status: string,
) => {
  if (!url) return;
  const key = url.replace(/\/$/, "").toLowerCase();
  const existing = map.get(key);
  if (existing) {
    existing.records += 1;
    if (!existing.usedFor.includes(usedFor)) existing.usedFor.push(usedFor);
    if (verified && (!existing.lastVerified || verified > existing.lastVerified))
      existing.lastVerified = verified;
    if (status === "verified") existing.status = "verified";
    return;
  }
  map.set(key, { url, name, type, usedFor: [usedFor], records: 1, lastVerified: verified, status });
};

/**
 * Builds the public source directory strictly from records already stored in the
 * GhanaPathFinder database , nothing is invented or hard-coded.
 */
export const useSourceDirectory = () =>
  useQuery({
    queryKey: ["source_directory"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<SourceRecord[]> => {
      const [regulators, institutions, progSources, cutoffs, scholarships] = await Promise.all([
        supabase.from("data_sources").select("source_url,source_name,source_type,verification_status,verified_at"),
        supabase
          .from("universities")
          .select("name,source_url,website_url,source_type,verification_status,last_verified_at")
          .limit(1000),
        supabase.from("programme_sources").select("source_url,source_type,verification_status,verified_at").limit(1000),
        supabase
          .from("programme_cutoffs")
          .select("official_source_url,source_name,source_type,verification_status,last_verified_at")
          .limit(1000),
        supabase.from("scholarships").select("name,provider,website_url,verified,last_verified_at").limit(500),
      ]);

      const map = new Map<string, SourceRecord>();

      for (const r of regulators.data ?? [])
        push(
          map,
          r.source_url,
          r.source_name ?? "Official source",
          r.source_type ?? "regulator",
          "Institution accreditation status",
          r.verified_at,
          r.verification_status ?? "verified",
        );

      for (const u of institutions.data ?? []) {
        push(
          map,
          u.source_url ?? u.website_url,
          u.name,
          u.source_type ?? "official_university",
          "Institution details",
          u.last_verified_at,
          u.verification_status ?? "needs_review",
        );
      }

      for (const p of progSources.data ?? [])
        push(
          map,
          p.source_url,
          "Official programme source",
          p.source_type ?? "official_institution",
          "Programme details",
          p.verified_at,
          p.verification_status ?? "verified",
        );

      for (const c of cutoffs.data ?? [])
        push(
          map,
          c.official_source_url,
          c.source_name ?? "Official admissions source",
          c.source_type ?? "admissions_portal",
          "Admission requirements and cut-off points",
          c.last_verified_at,
          c.verification_status ?? "verified",
        );

      for (const s of scholarships.data ?? [])
        push(
          map,
          s.website_url,
          s.provider ?? s.name,
          "scholarship_provider",
          "Scholarship details and deadlines",
          s.last_verified_at,
          s.verified ? "verified" : "needs_review",
        );

      return [...map.values()].sort((a, b) => b.records - a.records || a.name.localeCompare(b.name));
    },
  });
