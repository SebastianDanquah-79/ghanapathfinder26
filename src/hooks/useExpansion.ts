import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCategory } from "@/lib/opportunity-categories";

export interface Bucket { label: string; value: number }
export interface PlatformStats {
  universities: number; programmes: number; scholarships: number; internships: number;
  companies: number; courses: number; opportunities: number; countries: number; directory_members: number;
  universities_by_type: Bucket[]; universities_by_category: Bucket[]; universities_by_country: Bucket[];
  universities_by_region: Bucket[]; programmes_by_degree: Bucket[]; scholarships_by_funding: Bucket[];
  opportunities_by_type: Bucket[]; generated_at: string;
}

export const platformStatsQueryOptions = queryOptions({
  queryKey: ["platform_stats"],
  queryFn: async () => {
    const { data, error } = await supabase.rpc("platform_stats");
    if (error) throw error;
    return data as unknown as PlatformStats;
  },
  staleTime: 5 * 60_000,
});

export const usePlatformStats = () => useQuery(platformStatsQueryOptions);

/** A normalised listing row, whichever real table it came from. */
export interface Listing {
  key: string;
  title: string;
  organisation: string | null;
  location: string | null;
  summary: string | null;
  deadline: string | null;
  url: string | null;
  source: string | null;
  verified: boolean;
  kind: "opportunity" | "internship" | "course";
  internalHref?: string;
  tags: string[];
}

export const useCategoryListings = (slug: string) =>
  useQuery({
    queryKey: ["category_listings", slug],
    queryFn: async (): Promise<Listing[]> => {
      const cat = getCategory(slug);
      if (!cat) return [];
      const tasks: Promise<Listing[]>[] = [];

      tasks.push(
        (async () => {
          const { data, error } = await supabase
            .from("opportunities")
            .select("id, slug, title, organisation, location, country, description, deadline_date, application_url, source_url, verified, fields")
            .eq("category", slug)
            .order("deadline_date", { ascending: true, nullsFirst: false })
            .limit(200);
          if (error) throw error;
          return (data ?? []).map((o) => ({
            key: `o-${o.id}`, title: o.title, organisation: o.organisation,
            location: [o.location, o.country].filter(Boolean).join(", ") || null,
            summary: o.description, deadline: o.deadline_date, url: o.application_url,
            source: o.source_url, verified: o.verified, kind: "opportunity" as const, tags: o.fields ?? [],
          }));
        })(),
      );

      if (cat.internshipTypes?.length) {
        tasks.push(
          (async () => {
            const { data, error } = await supabase
              .from("internships")
              .select("id, slug, title, opportunity_type, location, description, deadline_date, deadline_text, application_url, source_url, verified, fields, companies(name)")
              .in("opportunity_type", cat.internshipTypes!)
              .limit(200);
            if (error) throw error;
            return (data ?? []).map((i) => ({
              key: `i-${i.id}`, title: i.title,
              organisation: (i.companies as { name: string } | null)?.name ?? null,
              location: i.location, summary: i.description, deadline: i.deadline_date ?? i.deadline_text,
              url: i.application_url, source: i.source_url, verified: i.verified, kind: "internship" as const,
              internalHref: `/internships/${i.slug ?? i.id}`, tags: [i.opportunity_type, ...(i.fields ?? [])].filter(Boolean) as string[],
            }));
          })(),
        );
      }

      if (cat.includeCourses) {
        tasks.push(
          (async () => {
            const { data, error } = await supabase
              .from("skill_providers")
              .select("id, provider_name, course_name, skill_area, format, cost, application_url, source_urls, needs_review")
              .eq("needs_review", false)
              .limit(200);
            if (error) throw error;
            return (data ?? []).map((s) => ({
              key: `c-${s.id}`, title: s.course_name ?? s.provider_name, organisation: s.provider_name,
              location: s.format, summary: [s.skill_area, s.cost].filter(Boolean).join(" · ") || null,
              deadline: null, url: s.application_url, source: s.source_urls?.[0] ?? null, verified: true,
              kind: "course" as const, tags: s.skill_area ? [s.skill_area] : [],
            }));
          })(),
        );
      }

      // One unavailable source must not hide the others.
      const settled = await Promise.allSettled(tasks);
      const ok = settled.filter((s): s is PromiseFulfilledResult<Listing[]> => s.status === "fulfilled");
      if (!ok.length && settled.length) throw (settled[0] as PromiseRejectedResult).reason;
      return ok.flatMap((s) => s.value);
    },
    staleTime: 5 * 60_000,
  });
