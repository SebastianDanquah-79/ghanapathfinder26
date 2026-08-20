import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Company = Tables<"companies">;
export type Internship = Tables<"internships">;

export interface InternshipWithCompany extends Internship {
  companies: Pick<
    Company,
    "id" | "slug" | "name" | "sector" | "employer_type" | "website_url" | "careers_url" | "logo_url"
  > | null;
}

const INTERNSHIP_SELECT =
  "id, slug, title, opportunity_type, description, fields, careers, location, region, work_mode, duration, paid, stipend_text, eligibility, application_url, deadline_text, deadline_date, verified, source_url, last_verified_at, company_id, companies(id, slug, name, sector, employer_type, website_url, careers_url, logo_url)";

/** All published internships / attachments / graduate programmes. */
export const useInternships = () =>
  useQuery({
    queryKey: ["internships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internships")
        .select(INTERNSHIP_SELECT)
        .order("title", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as InternshipWithCompany[];
    },
    staleTime: 5 * 60_000,
  });

/** Opportunities relevant to one career/programme name (matched on the careers + fields arrays). */
export const useInternshipsForCareer = (career?: string | null) => {
  const query = useInternships();
  const term = (career ?? "").toLowerCase().trim();
  const rows = !term
    ? []
    : (query.data ?? []).filter(
        (i) =>
          i.careers.some((c) => c.toLowerCase().includes(term) || term.includes(c.toLowerCase())) ||
          i.fields.some((f) => f.toLowerCase() === term),
      );
  return { ...query, rows };
};

export const useCompanies = () =>
  useQuery({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select(
          "id, slug, name, sector, employer_type, description, location, region, size, website_url, careers_url, logo_url, verified, source_url, last_verified_at",
        )
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Company[];
    },
    staleTime: 5 * 60_000,
  });

export const useCompany = (slug?: string) =>
  useQuery({
    queryKey: ["company", slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("*")
        .eq("slug", slug!)
        .maybeSingle();
      if (error) throw error;
      return data as Company | null;
    },
    staleTime: 5 * 60_000,
  });

export const useCompanyInternships = (companyId?: string) =>
  useQuery({
    queryKey: ["company_internships", companyId],
    enabled: !!companyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("internships")
        .select(INTERNSHIP_SELECT)
        .eq("company_id", companyId!)
        .order("title", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as InternshipWithCompany[];
    },
    staleTime: 5 * 60_000,
  });
