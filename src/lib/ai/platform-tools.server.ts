import { tool } from "ai";
import { z } from "zod";
import { searchGlobalKnowledge } from "./knowledge.server";

type QueryResult = {
  data: Array<Record<string, unknown>> | null;
  error: { code?: string; message: string } | null;
};

type SearchBuilder = {
  select(columns: string): SearchBuilder;
  ilike(column: string, pattern: string): SearchBuilder;
  limit(count: number): Promise<QueryResult>;
  in(column: string, values: string[]): Promise<QueryResult>;
};

type PublicAdminClient = {
  from(table: string): SearchBuilder;
};

const querySchema = z.object({
  query: z.string().trim().min(2).max(120).describe("The topic, institution, programme, skill, scholarship, employer or opportunity to search for."),
});

const globalKnowledgeSchema = z.object({
  query: z.string().trim().min(3).max(1200).describe("A concise natural-language question or phrase to search in GhanaPathFinder's curated global knowledge library."),
  countryCode: z.string().trim().length(2).optional().describe("Optional ISO alpha-2 country code, for example GH, NG, US, GB or CA."),
  category: z.string().trim().max(80).optional().describe("Optional knowledge category such as education, careers, technology, science or scholarships."),
});

function safeFilterTerm(input: string): string {
  return input
    .replace(/[%,.*_()]/g, " ")
    .replace(/\\s+/g, " ")
    .trim()
    .slice(0, 100);
}

async function getAdminClient(): Promise<PublicAdminClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as PublicAdminClient;
}

async function runPublicSearch(
  table: string,
  select: string,
  columnTerms: string[],
  query: string,
  limit = 8,
) {
  const term = safeFilterTerm(query);
  if (term.length < 2) return { records: [], note: "Provide a more specific search phrase." };

  try {
    const admin = await getAdminClient();
    const pattern = `%${term}%`;
    const results = await Promise.all(
      columnTerms.slice(0, 3).map((column) =>
        admin.from(table).select(select).ilike(column, pattern).limit(limit),
      ),
    );
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      console.error("GhanaPathFinder platform search failed", {
        table,
        code: failed.error.code,
        message: failed.error.message.slice(0, 200),
      });
      return { records: [], note: "The platform catalogue search is temporarily unavailable." };
    }

    const byId = new Map<string, Record<string, unknown>>();
    for (const result of results) {
      for (const row of result.data ?? []) {
        const key = String(row.id ?? JSON.stringify(row));
        if (!byId.has(key)) byId.set(key, row);
      }
    }
    return { records: Array.from(byId.values()).slice(0, limit), note: undefined };
  } catch {
    console.error("GhanaPathFinder platform search failed", { table });
    return { records: [], note: "The platform catalogue search is temporarily unavailable." };
  }
}

async function searchProgrammes(query: string) {
  const result = await runPublicSearch(
    "programmes",
    "id,name,field,description,duration,degree_type,qualification,qualification_level,entry_requirements,admission_summary,wassce_requirements,application_url,programme_url,source_url,verification_status,verified,last_verified_at,university_id",
    ["name", "field", "description"],
    query,
    8,
  );
  const programmeIds = result.records
    .map((row) => row["university_id"])
    .filter((id): id is string => typeof id === "string");
  if (!programmeIds.length) return result;

  try {
    const admin = await getAdminClient();
    const { data, error } = await admin
      .from("universities")
      .select("id,name,short_name,city,region,country,website_url,admissions_url,source_url,verification_status,verified,last_verified_at")
      .in("id", programmeIds.slice(0, 20));
    if (error) return result;
    const universities = new Map(
      (data ?? []).map((row) => [String(row["id"]), row]),
    );
    return {
      ...result,
      records: result.records.map((row) => ({
        ...row,
        institution: universities.get(String(row["university_id"])) ?? null,
      })),
    };
  } catch {
    return result;
  }
}

const navigation = [
  { section: "Universities", href: "/universities", description: "Explore and compare universities and tertiary institutions." },
  { section: "Programmes", href: "/programmes", description: "Search degree, diploma and other academic programmes." },
  { section: "Scholarships", href: "/scholarships", description: "Explore scholarships and funding records." },
  { section: "Admissions", href: "/admissions", description: "Explore admission guidance and matching tools." },
  { section: "Careers", href: "/careers", description: "Explore career profiles and career pathways." },
  { section: "My Path", href: "/my-path", description: "View the student's saved education and career direction." },
  { section: "Opportunities", href: "/opportunities", description: "Explore jobs, internships and other opportunities." },
  { section: "Learning resources", href: "/learning-resources", description: "Find learning materials and skill-development resources." },
  { section: "News", href: "/news", description: "Read Ghana, African and international news." },
  { section: "Startups", href: "/startups", description: "Explore African startups and the innovation ecosystem." },
];

export function createPlatformTools() {
  return {
    searchUniversities: tool({
      description: "Search GhanaPathFinder's university and institution catalogue. Use this for questions about institutions, campuses, locations, official websites or admissions pages. Do not invent results.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "universities",
        "id,name,short_name,city,region,country,type,category,accreditation_status,gtec_accreditation_status,website_url,admissions_url,financial_aid_url,source_url,verified,verification_status,last_verified_at",
        ["name", "short_name", "city"],
        query,
        8,
      ),
    }),
    searchProgrammes: tool({
      description: "Search GhanaPathFinder's live programme catalogue. Use this for programme names, fields of study, qualifications, durations and recorded admission requirements. Include institution and verification details when returned.",
      inputSchema: querySchema,
      execute: async ({ query }) => searchProgrammes(query),
    }),
    searchScholarships: tool({
      description: "Search the scholarship catalogue. Use this for funding, scholarship eligibility, deadlines, providers and application links. Treat a record as unverified unless its verification fields explicitly say otherwise.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "scholarships",
        "id,title,name,provider,type,funding_type,study_level,fields,description,eligibility,academic_requirements,coverage,deadline,deadline_date,deadline_text,application_url,website_url,source_url,verified,last_verified_at",
        ["title", "name", "description"],
        query,
        8,
      ),
    }),
    searchOpportunities: tool({
      description: "Search job, internship, training and other opportunity records. Always inspect is_active, published, status, verified and deadline fields before saying an opportunity is currently open.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "opportunities",
        "id,title,opportunity_type,company_name,organisation,country_code,country,location,city,remote,is_remote,employment_type,description,requirements,eligibility,skills,skills_required,application_url,apply_url,source_name,source_url,posted_at,deadline,deadline_date,status,is_active,published,verified,last_verified_at",
        ["title", "description", "company_name"],
        query,
        8,
      ),
    }),
    searchSkills: tool({
      description: "Search the platform's skills catalogue for skill definitions, difficulty, prerequisites, learning resources and related jobs.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "skills",
        "id,name,slug,category,description,difficulty,prerequisites,learning_resources,projects,related_jobs,verification_status,primary_source_url,last_checked_at",
        ["name", "category", "description"],
        query,
        8,
      ),
    }),
    searchLearningResources: tool({
      description: "Search learning resources by subject, provider, skill, level or country. Return the URLs stored in the catalogue.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "learning_resources",
        "id,provider,title,url,category,skills,level,country_code,source_url",
        ["title", "category", "provider"],
        query,
        8,
      ),
    }),
    searchAfricanStartups: tool({
      description: "Search African startup records by company name, country, city or sector. Include source and verification metadata; never invent valuations or funding.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "african_startups",
        "id,company_name,country,city,sector,stage,capital_usd,metric_type,evidence_date,official_url,source_url,source_name,active_status,last_verified_at,founded_year,valuation_usd,valuation_as_of,valuation_source_url,valuation_status,verification_status",
        ["company_name", "sector", "country"],
        query,
        8,
      ),
    }),
    searchGlobalKnowledge: tool({
      description: "Search GhanaPathFinder's curated global knowledge library for sourced information about international education, countries, careers, technology, science, business and scholarships. Use this when a question needs information beyond the platform's structured Ghana catalogues. If no records are returned, say the knowledge library has no matching sourced record; do not pretend it did.",
      inputSchema: globalKnowledgeSchema,
      execute: async ({ query, countryCode, category }) => searchGlobalKnowledge(query, {
        countryCode,
        category,
        limit: 8,
      }),
    }),
    searchPlatformNavigation: tool({
      description: "Find the correct GhanaPathFinder section and internal route. Use this when a user asks where to find a feature or how to navigate the platform. Return only routes from this verified route map.",
      inputSchema: z.object({
        query: z.string().trim().min(2).max(120),
      }),
      execute: async ({ query }) => {
        const words = safeFilterTerm(query).toLowerCase().split(" ").filter(Boolean);
        const ranked = navigation
          .map((item) => ({
            ...item,
            score: words.filter((word) =>
              `${item.section} ${item.description} ${item.href}`.toLowerCase().includes(word),
            ).length,
          }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map(({ score: _score, ...item }) => item);
        return { records: ranked };
      },
    }),
  };
}
