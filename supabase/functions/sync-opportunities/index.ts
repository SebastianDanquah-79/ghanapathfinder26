import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

type RemoteJob = Record<string, unknown>;
const upsertRows: Record<string, unknown>[] = [];

function safeDate(value: unknown) {
  if (typeof value !== "string" && typeof value !== "number") return new Date().toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

const countryLookup: Record<string, { name: string; code: string }> = {
  ghana: { name: "Ghana", code: "GH" },
  nigeria: { name: "Nigeria", code: "NG" },
  kenya: { name: "Kenya", code: "KE" },
  "south africa": { name: "South Africa", code: "ZA" },
  uganda: { name: "Uganda", code: "UG" },
  rwanda: { name: "Rwanda", code: "RW" },
  tanzania: { name: "Tanzania", code: "TZ" },
  senegal: { name: "Senegal", code: "SN" },
  namibia: { name: "Namibia", code: "NA" },
  egypt: { name: "Egypt", code: "EG" },
  morocco: { name: "Morocco", code: "MA" },
  zambia: { name: "Zambia", code: "ZM" },
  zimbabwe: { name: "Zimbabwe", code: "ZW" },
  botswana: { name: "Botswana", code: "BW" },
  ethiopia: { name: "Ethiopia", code: "ET" },
  "united kingdom": { name: "United Kingdom", code: "GB" },
  uk: { name: "United Kingdom", code: "GB" },
  "united states": { name: "United States", code: "US" },
  usa: { name: "United States", code: "US" },
  canada: { name: "Canada", code: "CA" },
  australia: { name: "Australia", code: "AU" },
  india: { name: "India", code: "IN" },
  germany: { name: "Germany", code: "DE" },
  france: { name: "France", code: "FR" },
  netherlands: { name: "Netherlands", code: "NL" },
  ireland: { name: "Ireland", code: "IE" },
  singapore: { name: "Singapore", code: "SG" },
  "united arab emirates": { name: "United Arab Emirates", code: "AE" },
};
const worldwideTerms = /^(worldwide|anywhere|global|all countries|remote)$/i;

function jobGeography(job: RemoteJob) {
  const raw = String(
    job.jobGeo ?? job.job_geo ?? job.candidate_required_location ?? job.country ?? job.jobCountry ?? "",
  ).trim();
  if (!raw || worldwideTerms.test(raw)) {
    return { country: null, countryCode: null, location: "Remote · Worldwide" };
  }
  const parts = raw.split(/[;,|]/).map((part) => part.trim()).filter(Boolean);
  const candidate = (parts.at(-1) ?? raw).toLowerCase();
  const match = countryLookup[candidate] ??
    Object.values(countryLookup).find((item) => item.code.toLowerCase() === candidate);
  return {
    country: match?.name ?? (raw.length <= 80 ? raw : null),
    countryCode: match?.code ?? null,
    location: raw.slice(0, 180),
  };
}

function addJob(job: RemoteJob, source: "jobicy" | "remotive") {
  const id = String(job.id ?? job.jobId ?? job.url ?? "");
  const title = String(job.jobTitle ?? job.title ?? "");
  const company = String(job.companyName ?? job.company_name ?? job.company ?? "");
  const url = String(job.url ?? job.jobUrl ?? "");
  if (!id || !title || !url || !/^https?:\/\//i.test(url)) return;

  const rawSkills = job.skills ?? job.jobIndustry ?? [];
  const skills = Array.isArray(rawSkills)
    ? rawSkills.map(String)
    : String(rawSkills).split(",").map((value) => value.trim()).filter(Boolean);
  const postedAt = safeDate(job.pubDate ?? job.publication_date ?? job.published_at);
  const geography = jobGeography(job);
  const jobType = String(job.job_type ?? job.jobType ?? "job");
  const isInternship = jobType.toLowerCase().includes("intern");

  upsertRows.push({
    title,
    opportunity_type: isInternship ? "internship" : "job",
    employment_type: jobType || "job",
    type: jobType || "job",
    company_name: company || null,
    company: company || null,
    organisation: company || null,
    location: geography.location,
    city: String(job.city ?? "").trim() || null,
    country: geography.country,
    country_code: geography.countryCode,
    remote: true,
    is_remote: true,
    work_mode: "remote",
    description: String(job.jobDescription ?? job.jobExcerpt ?? job.description ?? "") || null,
    skills,
    skills_required: skills,
    fields: Array.isArray(job.jobIndustry) ? job.jobIndustry.map(String) : [],
    category: String(job.category ?? job.jobIndustry ?? (isInternship ? "Internship" : "Employment")),
    application_url: url,
    apply_url: url,
    source,
    source_id: id,
    source_name: source === "remotive" ? "Remotive" : "Jobicy",
    source_url: url,
    posted_at: postedAt,
    is_active: true,
    published: true,
    verified: true,
    status: "active",
    last_verified_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rowsBySource: Record<"jobicy" | "remotive", number> = { jobicy: 0, remotive: 0 };
  const successfulSources = new Set<"jobicy" | "remotive">();
  const errors: string[] = [];

  const fetchSource = async (source: "jobicy" | "remotive", url: string) => {
    try {
      const response = await fetch(url, { headers: { accept: "application/json" } });
      if (!response.ok) throw new Error(source + " returned HTTP " + response.status);
      const payload = await response.json();
      const jobs = Array.isArray(payload.jobs) ? payload.jobs : [];
      for (const job of jobs) addJob(job as RemoteJob, source);
      rowsBySource[source] = jobs.length;
      successfulSources.add(source);
    } catch (error) {
      errors.push(source + ": " + (error instanceof Error ? error.message : String(error)).slice(0, 240));
    }
  };

  await Promise.all([
    fetchSource("jobicy", "https://jobicy.com/api/v2/remote-jobs?count=50"),
    fetchSource("remotive", "https://remotive.com/api/remote-jobs?limit=50"),
  ]);

  const unique = Array.from(
    new Map(upsertRows.map((row) => [String(row.source) + ":" + String(row.source_id), row])).values(),
  );

  if (unique.length) {
    const { error } = await supabase.from("opportunities").upsert(unique, { onConflict: "source,source_id" });
    if (error) {
      return Response.json({ ok: false, error: error.message, fetched: unique.length, rowsBySource }, { status: 500 });
    }
  }

  // Expire only imported source rows, and only after that source fetched successfully.
  // Human-submitted grants, scholarships and employer posts are not touched.
  const staleBefore = new Date(Date.now() - 30 * 86400000).toISOString();
  const expired: Record<string, number> = {};
  for (const source of successfulSources) {
    const { data, error } = await supabase
      .from("opportunities")
      .update({ is_active: false, status: "expired", updated_at: new Date().toISOString() })
      .eq("source", source)
      .eq("is_active", true)
      .lt("posted_at", staleBefore)
      .select("id");
    if (error) errors.push(source + " expiry: " + error.message.slice(0, 180));
    expired[source] = data?.length ?? 0;
  }

  return Response.json({
    ok: successfulSources.size > 0,
    fetched: rowsBySource,
    synced: unique.length,
    expired,
    errors,
    refreshed_at: new Date().toISOString(),
  }, { status: successfulSources.size > 0 ? 200 : 502 });
});
