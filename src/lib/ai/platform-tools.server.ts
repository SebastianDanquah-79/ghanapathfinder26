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
  eq(column: string, value: string | boolean | number): SearchBuilder;
  in(column: string, values: string[]): Promise<QueryResult>;
  limit(count: number): Promise<QueryResult>;
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
  return input.replace(/[%,.*_()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 100);
}

async function getAdminClient(): Promise<PublicAdminClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as PublicAdminClient;
}

const SEARCH_STOP_WORDS = new Set([
  "a", "an", "and", "are", "at", "be", "by", "for", "from", "how", "in",
  "into", "is", "it", "of", "on", "or", "the", "to", "what", "where",
  "which", "with", "who", "within", "does", "do", "can", "could", "my",
  "me", "page", "pages", "take", "that", "not", "exist", "existing", "thing",
]);

async function runPublicSearch(
  table: string,
  select: string,
  columnTerms: string[],
  query: string,
  limit = 8,
  filters?: (builder: SearchBuilder) => SearchBuilder,
) {
  const phrase = safeFilterTerm(query);
  if (phrase.length < 2) return { records: [], note: "Provide a more specific search phrase." };

  // Search the complete phrase first, then a few meaningful terms. This finds
  // records for natural questions such as "Computer Science at GCTU" even
  // when the full phrase is not stored as one contiguous database string.
  const keywords = phrase.toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length >= 3 && !SEARCH_STOP_WORDS.has(word))
    .slice(0, 3);
  const searchTerms = Array.from(new Set([phrase, ...keywords])).slice(0, 4);
  const columns = columnTerms.slice(0, 4);

  try {
    const admin = await getAdminClient();
    const requests = searchTerms.flatMap((term) =>
      columns.map((column) => {
        let builder = admin.from(table).select(select);
        if (filters) builder = filters(builder);
        return builder.ilike(column, `%${term}%`).limit(limit);
      }),
    );
    const results = await Promise.all(requests);
    const failed = results.find((result) => result.error);
    if (failed?.error) {
      console.error("GhanaPathFinder platform search failed", {
        table,
        code: failed.error.code,
        message: failed.error.message.slice(0, 200),
      });
      return { records: [], note: "The platform catalogue search is temporarily unavailable." };
    }

    const ranked = new Map<string, { row: Record<string, unknown>; score: number }>();
    results.forEach((result, resultIndex) => {
      const termIndex = Math.floor(resultIndex / columns.length);
      const columnIndex = resultIndex % columns.length;
      const score = (termIndex === 0 ? 5 : 1) + (columnIndex === 0 ? 2 : 0);
      for (const row of result.data ?? []) {
        const key = String(row["id"] ?? JSON.stringify(row));
        const existing = ranked.get(key);
        if (existing) existing.score += score;
        else ranked.set(key, { row, score });
      }
    });

    const records = Array.from(ranked.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(Math.max(limit, 1), 20))
      .map((item) => item.row);

    return { records, note: undefined };
  } catch {
    console.error("GhanaPathFinder platform search failed", { table });
    return { records: [], note: "The platform catalogue search is temporarily unavailable." };
  }
}

async function searchProgrammes(query: string) {
  const result = await runPublicSearch(
    "programmes",
    "id,name,field,description,duration,degree_type,qualification,qualification_level,entry_requirements,admission_summary,wassce_requirements,application_url,programme_url,source_url,verification_status,verified,last_verified_at,university_id,institution_id",
    ["name", "field", "description"],
    query,
    8,
  );
  const universityIds = result.records.map((row) => row["university_id"]).filter((id): id is string => typeof id === "string");
  const institutionIds = result.records.map((row) => row["institution_id"]).filter((id): id is string => typeof id === "string");

  try {
    const admin = await getAdminClient();
    const [universities, institutions] = await Promise.all([
      universityIds.length
        ? admin.from("universities")
            .select("id,name,short_name,city,region,country,website_url,admissions_url,source_url,verification_status,verified,last_verified_at")
            .in("id", universityIds.slice(0, 20))
        : Promise.resolve({ data: [], error: null }),
      institutionIds.length
        ? admin.from("institutions")
            .select("id,official_name,institution_type,town,region,website_url,gtec_accreditation_status,verification_status,last_verified_at,primary_source_url")
            .in("id", institutionIds.slice(0, 20))
        : Promise.resolve({ data: [], error: null }),
    ]);
    const universityMap = new Map((universities.data ?? []).map((row) => [String(row["id"]), row]));
    const institutionMap = new Map((institutions.data ?? []).map((row) => [String(row["id"]), row]));
    return {
      ...result,
      records: result.records.map((row) => ({
        ...row,
        university: universityMap.get(String(row["university_id"])) ?? null,
        institution: institutionMap.get(String(row["institution_id"])) ?? null,
      })),
    };
  } catch {
    return result;
  }
}

type NavigationItem = {
  section: string;
  href: string;
  description: string;
  keywords: string[];
  requiresSignIn?: boolean;
};

const navigation: NavigationItem[] = [
  { section: "Home", href: "/", description: "Open the GhanaPathFinder home page.", keywords: ["home", "homepage", "start", "main page"] },
  { section: "Feed", href: "/feed", description: "View the main community and platform feed.", keywords: ["feed", "posts", "updates", "timeline"] },
  { section: "For You", href: "/for-you", description: "View personalised recommendations and content.", keywords: ["for you", "personalised", "recommendations", "recommended"] },
  { section: "About GhanaPathFinder", href: "/about", description: "Learn what GhanaPathFinder does and how the platform works.", keywords: ["about", "what is ghanapathfinder", "how it works"] },
  { section: "University directory", href: "/ghana", description: "Browse Ghanaian universities and tertiary institutions.", keywords: ["university", "universities", "tertiary institution", "institution directory", "ghana universities", "campus"] },
  { section: "University search", href: "/search?kind=university", description: "Search for a university by name or location.", keywords: ["find university", "search university", "university search", "school search"] },
  { section: "Programmes", href: "/programmes", description: "Search degree, diploma and other academic programmes.", keywords: ["programme", "program", "course of study", "degree", "diploma", "major", "field of study"] },
  { section: "Admission Match", href: "/admission-match", description: "Compare a student's WASSCE results with programme admission information.", keywords: ["admission", "admissions", "wassce matching", "cutoff", "cut off", "entry requirements", "eligible", "admission match"] },
  { section: "WASSCE Scan", href: "/waec-scan", description: "Use the WASSCE result scanning and review tool.", keywords: ["waec scan", "wassce scan", "result slip", "upload results", "grades"] },
  { section: "Scholarships", href: "/scholarships", description: "Find scholarship and funding records.", keywords: ["scholarship", "scholarships", "bursary", "funding", "financial aid", "grant"] },
  { section: "Compare Scholarships", href: "/compare-scholarships", description: "Compare scholarship opportunities and their recorded requirements.", keywords: ["compare scholarships", "scholarship comparison", "funding comparison"] },
  { section: "Compare", href: "/compare", description: "Compare education options available on the platform.", keywords: ["compare", "comparison", "side by side", "compare schools", "compare programmes"] },
  { section: "Careers", href: "/careers", description: "Explore career profiles, occupations and related skills.", keywords: ["career", "careers", "occupation", "job role", "career profile"] },
  { section: "Career Path", href: "/career-path", description: "Build a staged progression plan from a student's current position to a career goal.", keywords: ["career path", "career roadmap", "roadmap", "career plan", "career intelligence", "dream job"] },
  { section: "My Path", href: "/my-path", description: "View a personal education, funding, skills and career plan.", keywords: ["my path", "personal path", "my plan", "saved pathway"], requiresSignIn: true },
  { section: "Jobs", href: "/jobs", description: "Explore job and employment information listed on GhanaPathFinder.", keywords: ["job", "jobs", "employment", "vacancy", "hiring"] },
  { section: "Opportunities", href: "/opportunities", description: "Browse jobs, internships, training and other opportunity listings.", keywords: ["opportunity", "opportunities", "internship", "training", "placement", "attachments"] },
  { section: "Internships", href: "/internships", description: "Explore internships, industrial attachments and graduate programmes.", keywords: ["internship", "internships", "industrial attachment", "national service", "graduate programme"] },
  { section: "Companies", href: "/companies", description: "Explore organisations, employers and their official careers pages.", keywords: ["company", "companies", "employer", "employers", "organisation", "careers page"] },
  { section: "Hire from Africa", href: "/hire-from-africa", description: "Explore the employer-facing experience for discovering talent in Africa.", keywords: ["hire", "hire from africa", "recruit", "recruitment", "talent", "employer portal"] },
  { section: "Skills Hub", href: "/skills", description: "Explore skills, prerequisites, difficulty levels and related learning resources.", keywords: ["skill", "skills", "skills hub", "prerequisites", "competencies"] },
  { section: "Courses", href: "/courses", description: "Explore educational courses and learning materials.", keywords: ["course", "courses", "online learning", "study material", "lessons"] },
  { section: "Startups", href: "/startups", description: "Explore African startups and the innovation ecosystem.", keywords: ["startup", "startups", "companies in africa", "entrepreneurship", "founders"] },
  { section: "Build in Africa", href: "/build-in-africa", description: "Explore the Build in Africa hub for creating and growing projects.", keywords: ["build in africa", "build", "create a startup", "build a business", "founder"] },
  { section: "Growth OS", href: "/growth", description: "Open the Growth OS workspace for planning and improving growth.", keywords: ["growth", "growth os", "business growth", "growth planning"] },
  { section: "Work in Africa", href: "/work", description: "Explore work-related information and opportunities across Africa.", keywords: ["work", "work in africa", "careers in africa", "employment in africa"] },
  { section: "Explore Africa", href: "/explore", description: "Explore African countries, people and opportunities.", keywords: ["explore africa", "africa", "countries", "continent"] },
  { section: "Africa", href: "/africa", description: "Open the Africa hub and its country and regional content.", keywords: ["africa hub", "african countries", "regions"] },
  { section: "Africa Now", href: "/africa-now", description: "Read Africa-wide reporting and news updates.", keywords: ["africa now", "africa news", "pan-african news"] },
  { section: "Live Africa", href: "/live-africa", description: "Read recent published news records from across Africa.", keywords: ["live africa", "latest africa news", "recent africa news"] },
  { section: "Global News", href: "/global-news", description: "Read Ghanaian, African and international news articles.", keywords: ["global news", "world news", "ghana news", "international news"] },
  { section: "My Africa", href: "/my-africa", description: "Open the My Africa experience.", keywords: ["my africa", "africa experience"] },
  { section: "Ask Africa", href: "/ask-africa", description: "Ask questions about Africa, education, careers and development.", keywords: ["ask africa", "questions about africa", "african development"] },
  { section: "International Community", href: "/international-community", description: "Visit the international student and professional community.", keywords: ["international community", "global community", "international students"] },
  { section: "Study Destinations", href: "/study-destinations", description: "Explore international study destinations and application guidance.", keywords: ["study abroad", "study destination", "study destinations", "international education", "overseas university"] },
  { section: "Community", href: "/community", description: "Visit GhanaPathFinder's student and professional community.", keywords: ["community", "groups", "discussions", "chat", "forum"] },
  { section: "People", href: "/people", description: "Explore people and profiles available on the platform.", keywords: ["people", "members", "profiles", "professionals"] },
  { section: "Mentorship", href: "/mentorship", description: "Explore mentorship and guidance opportunities.", keywords: ["mentor", "mentorship", "guidance", "mentors"] },
  { section: "Events", href: "/events", description: "Browse events and activities listed on GhanaPathFinder.", keywords: ["event", "events", "workshop", "conference", "webinar"] },
  { section: "Stories", href: "/stories", description: "Read stories shared through GhanaPathFinder.", keywords: ["stories", "success stories", "testimonials"] },
  { section: "Daily Drop", href: "/daily-drop", description: "Open the Daily Drop content experience.", keywords: ["daily drop", "daily content", "daily update"] },
  { section: "Inspiration", href: "/inspiration", description: "Explore motivational and inspirational content.", keywords: ["inspiration", "motivation", "encouragement"] },
  { section: "Heroes", href: "/heroes", description: "Discover people and profiles featured as heroes.", keywords: ["heroes", "role models", "inspiring people"] },
  { section: "Life Game", href: "/life-game", description: "Open the Life Game decision and scenario experience.", keywords: ["life game", "life simulator", "simulation", "life decisions"] },
  { section: "Travel", href: "/travel", description: "Explore travel-related country and destination information.", keywords: ["travel", "travelling", "visiting countries", "destinations"] },
  { section: "Connect", href: "/connect", description: "Open the Connect hub for networking and making connections.", keywords: ["connect", "network", "networking", "connections"] },
  { section: "Dashboard", href: "/dashboard", description: "Open the signed-in user's dashboard.", keywords: ["dashboard", "my dashboard", "account overview"], requiresSignIn: true },
  { section: "Profile", href: "/profile", description: "View and manage the signed-in user's profile.", keywords: ["profile", "my profile", "account profile"], requiresSignIn: true },
  { section: "Applications", href: "/applications", description: "Track applications and related next steps.", keywords: ["applications", "my applications", "application tracker"], requiresSignIn: true },
  { section: "Saved", href: "/saved", description: "View universities, programmes and other items saved by the user.", keywords: ["saved", "bookmarks", "saved items", "favourites"], requiresSignIn: true },
  { section: "Notifications", href: "/notifications", description: "View account and platform notifications.", keywords: ["notification", "notifications", "alerts"], requiresSignIn: true },
  { section: "Settings", href: "/settings", description: "Manage account settings.", keywords: ["settings", "account settings", "security settings"], requiresSignIn: true },
  { section: "Preferences", href: "/preferences", description: "Manage personal preferences used by the platform.", keywords: ["preferences", "personalisation", "personalization"], requiresSignIn: true },
  { section: "Student Portal", href: "/portal/student", description: "Open the student portal. Sign-in and portal access rules may apply.", keywords: ["student portal", "student account"], requiresSignIn: true },
  { section: "Employer Portal", href: "/portal/employer", description: "Open the employer portal for employer-facing tools. Sign-in and role access rules apply.", keywords: ["employer portal", "employer dashboard"], requiresSignIn: true },
  { section: "Employee Portal", href: "/portal/employee", description: "Open the employee portal. Sign-in and role access rules apply.", keywords: ["employee portal", "employee dashboard"], requiresSignIn: true },
  { section: "Founder Portal", href: "/portal/founder", description: "Open the founder portal for startup-related tools. Sign-in and role access rules apply.", keywords: ["founder portal", "startup founder"], requiresSignIn: true },
  { section: "International Student Portal", href: "/portal/international-student", description: "Open the international student portal. Sign-in and role access rules apply.", keywords: ["international student portal", "international student account"], requiresSignIn: true },
  { section: "Parent View", href: "/parent", description: "Open the parent and guardian view.", keywords: ["parent", "guardian", "parent view"] },
  { section: "Study Destination Portal", href: "/portal/study-destinations", description: "Open the study destinations portal. Sign-in and role access rules may apply.", keywords: ["study destination portal", "destination portal"], requiresSignIn: true },
  { section: "Onboarding", href: "/onboarding", description: "Complete initial setup for a new GhanaPathFinder account.", keywords: ["onboarding", "get started", "account setup"], requiresSignIn: true },
  { section: "Sign In", href: "/auth", description: "Sign in or create a GhanaPathFinder account.", keywords: ["sign in", "login", "log in", "register", "create account"] },
  { section: "FAQ", href: "/faq", description: "Read frequently asked questions about GhanaPathFinder.", keywords: ["faq", "frequently asked questions", "help"] },
  { section: "Contact", href: "/contact", description: "Contact the GhanaPathFinder team.", keywords: ["contact", "support", "help desk", "reach the team"] },
  { section: "References", href: "/references", description: "Read references and acknowledgements for platform information.", keywords: ["references", "acknowledgements", "sources"] },
  { section: "Credits", href: "/credits", description: "View platform credits and source acknowledgements.", keywords: ["credits", "attributions"] },
  { section: "Disclaimer", href: "/disclaimer", description: "Read the platform's information and guidance disclaimer.", keywords: ["disclaimer", "not official advice", "limitations"] },
  { section: "Privacy Policy", href: "/privacy", description: "Read the privacy policy.", keywords: ["privacy", "privacy policy", "data protection"] },
  { section: "Terms", href: "/terms", description: "Read the terms and conditions.", keywords: ["terms", "terms of service", "conditions"] },
  { section: "Professional Councils", href: "/professional-councils", description: "Explore professional councils and regulatory bodies.", keywords: ["professional council", "professional councils", "regulatory body", "licensing"] },
];

export function findPlatformNavigation(query: string): Array<Omit<NavigationItem, "keywords">> {
  const phrase = safeFilterTerm(query).toLowerCase();
  if (phrase.length < 2) return [];

  const words = phrase.split(" ").filter((word) =>
    word.length > 1 && !SEARCH_STOP_WORDS.has(word),
  );
  if (words.length === 0) return [];

  return navigation
    .map((item) => {
      const corpus = `${item.section} ${item.description} ${item.href} ${item.keywords.join(" ")}`.toLowerCase();
      const wordHits = words.filter((word) => corpus.includes(word)).length;
      const phraseHit = corpus.includes(phrase) ? 4 : 0;
      const aliasHit = item.keywords.some((keyword) =>
        keyword.includes(phrase) || phrase.includes(keyword),
      ) ? 3 : 0;
      return { ...item, score: wordHits * 2 + phraseHit + aliasHit };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ score: _score, keywords: _keywords, ...item }) => item);
}

export function createPlatformTools() {
  return {
    searchUniversities: tool({
      description: "Search GhanaPathFinder's university catalogue by university name, short name, country or city. Return verification metadata and official URLs.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "universities",
        "id,name,short_name,city,region,country,type,category,accreditation_status,gtec_accreditation_status,website_url,admissions_url,financial_aid_url,source_url,verified,verification_status,last_verified_at",
        ["name", "short_name", "country", "city"],
        query,
        8,
      ),
    }),
    searchInstitutions: tool({
      description: "Search GhanaPathFinder's institution registry for tertiary institutions and other education providers. Include GTEC accreditation and source/verification status.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "institutions",
        "id,official_name,institution_type,town,region,website_url,gtec_accreditation_status,verification_status,last_verified_at,primary_source_url,source_urls,needs_review",
        ["official_name", "town", "region"],
        query,
        8,
      ),
    }),
    searchProgrammes: tool({
      description: "Search GhanaPathFinder's live programme catalogue. Use this for programme names, fields, qualifications, durations and recorded admission requirements. Include institution and verification details.",
      inputSchema: querySchema,
      execute: async ({ query }) => searchProgrammes(query),
    }),
    searchProgrammeCareers: tool({
      description: "Search the programme-to-career relationship catalogue for occupations connected to academic programmes. Do not interpret a relationship as a guaranteed job outcome.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "programme_careers",
        "id,career,occupation,description,licence_note,last_verified,salary_experience_level,salary_period,salary_range,salary_data_source,programme_id",
        ["career", "occupation", "description"],
        query,
        8,
      ),
    }),
    searchScholarships: tool({
      description: "Search scholarship records for funding, eligibility, deadlines, providers and application links. Inspect verified and last_verified_at fields and distinguish unverified records.",
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
      description: "Search only active and published job, internship, training and other opportunity records. Verify deadlines and source details before calling an item open.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "opportunities",
        "id,title,opportunity_type,company_name,organisation,country_code,country,location,remote,is_remote,employment_type,description,requirements,eligibility,skills,skills_required,application_url,apply_url,source_name,source_url,posted_at,deadline,deadline_date,status,is_active,published,verified,last_verified_at",
        ["title", "description", "company_name"],
        query,
        8,
        (builder) => builder.eq("is_active", true).eq("published", true),
      ),
    }),
    searchInternshipProviders: tool({
      description: "Search the employer and provider directory for organisations that may offer internships or industrial attachments. A provider directory entry is not proof of an open vacancy; inspect needs_review and verification evidence.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "internship_providers",
        "id,name,sector,provider_type,website_url,programme_summary,application_url,paid,source_urls,verification_method,verification_notes,needs_review,last_verified_at",
        ["name", "sector", "programme_summary"],
        query,
        8,
      ),
    }),
    searchCompanies: tool({
      description: "Search GhanaPathFinder's organisation directory by company name, sector or description. Return official websites and verification metadata. Do not infer that a company is hiring.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "companies",
        "id,name,sector,location,region,description,website_url,careers_url,verification_status,verified,last_verified_at,primary_source_url",
        ["name", "sector", "description"],
        query,
        8,
      ),
    }),
    searchInvestors: tool({
      description: "Search the investor directory by investor name, sector or country. Return the supplied website, source and verification fields.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "investors",
        "id,name,type,country_code,sectors,stages,website_url,source_url,description,verified",
        ["name", "description", "country_code"],
        query,
        8,
      ),
    }),
    searchSkills: tool({
      description: "Search the skills catalogue for skill definitions, difficulty, prerequisites, learning resources and related jobs.",
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
      description: "Search learning resources by subject, provider, skill, level or country. Return URLs and any supplied source details.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "learning_resources",
        "id,provider,title,url,category,skills,level,country_code,source_url",
        ["title", "category", "provider"],
        query,
        8,
      ),
    }),
    searchInternationalQualifications: tool({
      description: "Search the international qualification catalogue by country, qualification name or qualification code. Include source and verification status; do not infer equivalence unless a supplied pathway rule confirms it.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "international_qualification_catalog",
        "id,country_code,country_name,qualification_code,qualification_name,level,notes,source_url,verification_status,last_verified_at",
        ["country_name", "qualification_name", "qualification_code"],
        query,
        8,
      ),
    }),
    searchCountryGuides: tool({
      description: "Search country-specific international education application guides for outbound study and Ghana application guidance. Use the country code or name and retain official portal links and verification dates.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "international_country_directory",
        "country_code,country_name,region,outbound_application_summary,outbound_application_steps,outbound_official_portal_url,outbound_source_urls,ghana_application_summary,ghana_application_steps,ghana_source_urls,qualification_examples,verification_status,last_verified_at",
        ["country_name", "country_code", "region"],
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
    searchNews: tool({
      description: "Search the news articles already indexed in GhanaPathFinder. Return source name, publication date, category, excerpt and original URL. Do not describe old articles as breaking news.",
      inputSchema: querySchema,
      execute: async ({ query }) => runPublicSearch(
        "news_articles",
        "id,title,excerpt,original_url,country_code,category,published_at,source_name,fetched_at",
        ["title", "excerpt", "source_name"],
        query,
        8,
      ),
    }),
    searchGlobalKnowledge: tool({
      description: "Search GhanaPathFinder's curated global knowledge library for sourced information about international education, countries, careers, technology, science, business and scholarships. If no records are returned, say the knowledge library has no matching sourced record.",
      inputSchema: globalKnowledgeSchema,
      execute: async ({ query, countryCode, category }) => searchGlobalKnowledge(query, {
        ...(countryCode ? { countryCode } : {}),
        ...(category ? { category } : {}),
        limit: 8,
      }),
    }),
    searchPlatformNavigation: tool({
      description: "Find the correct GhanaPathFinder section and internal route. Use this when a user asks where to find a feature or how to navigate the platform. Return only routes from this verified route map.",
      inputSchema: querySchema,
      execute: async ({ query }) => ({
        records: findPlatformNavigation(query),
      }),
    }),
  };
}
