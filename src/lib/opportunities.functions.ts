import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const PUBLIC_COLUMNS =
  "id, slug, title, organisation, company_name, opportunity_type, category, country, location, remote, work_mode, eligibility, description, deadline, deadline_date, application_url, source_name, source_url, verified, verification_status, last_verified_at, fields, skills, compensation";

export type PublicOpportunity = {
  id: string;
  slug: string;
  title: string;
  organisation: string | null;
  company_name: string | null;
  opportunity_type: string;
  category: string;
  country: string | null;
  location: string | null;
  remote: boolean;
  work_mode: string | null;
  eligibility: string | null;
  description: string | null;
  deadline: string | null;
  deadline_date: string | null;
  application_url: string | null;
  source_name: string | null;
  source_url: string | null;
  verified: boolean;
  verification_status: string;
  last_verified_at: string | null;
  fields: string[];
  skills: string[];
  compensation: string | null;
};

const publicClient = () =>
  createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    {
      auth: {
        storage: undefined,
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );

const listInput = z.object({
  type: z.string().max(60).optional(),
  country: z.string().max(80).optional(),
  field: z.string().max(80).optional(),
  verifiedOnly: z.boolean().optional(),
  includeExpired: z.boolean().optional(),
  limit: z.number().int().min(1).max(200).optional(),
});

export const listOpportunities = createServerFn({ method: "GET" })
  .inputValidator((d) => listInput.parse(d ?? {}))
  .handler(
    async ({
      data,
    }): Promise<{ items: PublicOpportunity[]; error: string | null }> => {
      try {
        let q = publicClient()
          .from("opportunities")
          .select(PUBLIC_COLUMNS)
          .eq("published", true)
          .eq("is_active", true)
          .order("deadline_date", { ascending: true, nullsFirst: false })
          .limit(data.limit ?? 120);
        if (data.type) q = q.eq("opportunity_type", data.type);
        if (data.country) q = q.ilike("country", data.country);
        if (data.field) q = q.contains("fields", [data.field]);
        if (data.verifiedOnly) q = q.eq("verification_status", "verified");
        if (!data.includeExpired) {
          const today = new Date().toISOString().slice(0, 10);
          q = q.or(`deadline_date.is.null,deadline_date.gte.${today}`);
        }
        const { data: rows, error } = await q;
        if (error) {
          console.error("listOpportunities", error.message);
          return {
            items: [],
            error: "Opportunities are unavailable right now.",
          };
        }
        return {
          items: (rows ?? []) as unknown as PublicOpportunity[],
          error: null,
        };
      } catch (e) {
        console.error("listOpportunities", e);
        return { items: [], error: "Opportunities are unavailable right now." };
      }
    },
  );

export const getOpportunity = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ slug: z.string().min(1).max(200) }).parse(d),
  )
  .handler(async ({ data }): Promise<PublicOpportunity | null> => {
    const { data: row, error } = await publicClient()
      .from("opportunities")
      .select(PUBLIC_COLUMNS)
      .eq("slug", data.slug)
      .eq("published", true)
      .eq("is_active", true)
      .maybeSingle();
    if (error) {
      console.error("getOpportunity", error.message);
      return null;
    }
    return (row ?? null) as unknown as PublicOpportunity | null;
  });
