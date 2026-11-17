type SearchRow = Record<string, unknown>;

type SearchBuilder = {
  select(columns: string): SearchBuilder;
  ilike(column: string, pattern: string): SearchBuilder;
  eq(column: string, value: string | boolean): SearchBuilder;
  limit(count: number): Promise<{ data: SearchRow[] | null; error: { code?: string; message: string } | null }>;
};

type AdminClient = {
  from(table: string): SearchBuilder;
};

export type CareerCandidate = {
  id: string;
  careerName: string;
  major: string;
  description: string;
  relevantSubjects: string[];
  recommendedProgrammes: string[];
  skills: string[];
  entryLevelRoles: string[];
  industries: string[];
};

export type CareerEvidence = {
  programmes: SearchRow[];
  careerLinks: SearchRow[];
  skills: SearchRow[];
  learningResources: SearchRow[];
  scholarships: SearchRow[];
  opportunities: SearchRow[];
};

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in",
  "into", "is", "it", "of", "on", "or", "the", "to", "with", "my", "me",
  "want", "like", "interested", "career", "careers", "engineering", "engineer",
  "science", "studies", "study", "technology", "technologies",
]);

function tokens(value: string): string[] {
  return Array.from(new Set(
    value.toLowerCase()
      .replace(/[^a-z0-9+.#\s-]/g, " ")
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part.length > 1 && !STOP_WORDS.has(part)),
  ));
}

function safeTerm(value: string): string {
  return value.replace(/[%,.*_()]/g, " ").replace(/\s+/g, " ").trim().slice(0, 90);
}

function overlapCount(left: string[], right: Set<string>): number {
  return left.filter((item) => right.has(item)).length;
}

export function rankCareerCandidates(
  candidates: CareerCandidate[],
  profile: {
    targetCareer: string;
    interests: string;
    existingSkills: string;
    currentStage: string;
  },
  wassceResults: Array<{ subject: string; grade: string }>,
) {
  const profileTokens = new Set(tokens([
    profile.targetCareer,
    profile.interests,
    profile.existingSkills,
    profile.currentStage,
  ].join(" ")));
  const targetTokens = new Set(tokens(profile.targetCareer));
  const interestTokens = new Set(tokens(profile.interests));
  const skillTokens = new Set(tokens(profile.existingSkills));
  const subjectTokens = new Set(wassceResults.flatMap((item) => tokens(item.subject)));

  return candidates.map((candidate) => {
    const descriptionTokens = tokens([
      candidate.careerName,
      candidate.major,
      candidate.description,
      ...candidate.relevantSubjects,
      ...candidate.recommendedProgrammes,
      ...candidate.skills,
      ...candidate.entryLevelRoles,
      ...candidate.industries,
    ].join(" "));
    const targetHits = overlapCount(tokens(candidate.careerName + " " + candidate.major), targetTokens);
    const interestHits = overlapCount(descriptionTokens, interestTokens);
    const skillHits = overlapCount(descriptionTokens, skillTokens);
    const subjectHits = overlapCount(tokens(candidate.relevantSubjects.join(" ")), subjectTokens);
    const profileHits = overlapCount(descriptionTokens, profileTokens);

    const score = Math.min(100,
      targetHits * 12 +
      Math.min(interestHits, 6) * 7 +
      Math.min(skillHits, 4) * 5 +
      Math.min(subjectHits, 4) * 5 +
      Math.min(profileHits, 5) * 2,
    );

    const evidence: string[] = [];
    if (targetHits) evidence.push("Matches words in your stated career goal or preferred study field.");
    if (interestHits) evidence.push("Overlaps with topics you listed as interests.");
    if (skillHits) evidence.push("Connects with skills or experience you said you already have.");
    if (subjectHits) evidence.push("Connects with subjects in the WASSCE results you supplied.");
    if (!evidence.length) evidence.push("This is an adjacent option from the platform career catalogue; more profile information would improve the comparison.");

    return {
      candidate,
      relevance: score,
      evidence,
      _sortScore: targetHits * 5 + interestHits * 3 + skillHits * 2 + subjectHits * 2 + profileHits,
    };
  }).sort((a, b) =>
    b._sortScore - a._sortScore || a.candidate.careerName.localeCompare(b.candidate.careerName),
  ).slice(0, 12);
}

async function getAdminClient(): Promise<AdminClient> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as unknown as AdminClient;
}

async function searchRows(
  admin: AdminClient,
  table: string,
  select: string,
  column: string,
  term: string,
  filters?: (builder: SearchBuilder) => SearchBuilder,
  limit = 5,
): Promise<SearchRow[]> {
  const clean = safeTerm(term);
  if (clean.length < 3) return [];
  try {
    let builder = admin.from(table).select(select);
    if (filters) builder = filters(builder);
    const { data, error } = await builder.ilike(column, `%${clean}%`).limit(limit);
    if (error) {
      console.error("Career evidence query failed", {
        table,
        column,
        code: error.code,
        message: error.message.slice(0, 180),
      });
      return [];
    }
    return data ?? [];
  } catch {
    console.error("Career evidence query failed", { table, column });
    return [];
  }
}

function dedupe(rows: SearchRow[], limit: number): SearchRow[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const id = String(row.id ?? JSON.stringify(row));
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, limit);
}

export async function retrieveCareerEvidence(
  profile: {
    targetCareer: string;
    interests: string;
    existingSkills: string;
  },
  rankedCandidates: Array<{ candidate: CareerCandidate }>,
): Promise<CareerEvidence> {
  try {
    const admin = await getAdminClient();
    const topCandidates = rankedCandidates.slice(0, 6).map((item) => item.candidate);
    const candidateTerms = topCandidates.flatMap((candidate) => [
      candidate.careerName,
      candidate.major,
      candidate.recommendedProgrammes[0] ?? "",
    ]);
    const terms = Array.from(new Set([
      profile.targetCareer,
      ...candidateTerms,
      ...tokens(profile.interests).slice(0, 2),
      ...tokens(profile.existingSkills).slice(0, 2),
    ].map((value) => safeTerm(value)).filter((value) => value.length >= 3))).slice(0, 7);

    const queryGroups = await Promise.all(terms.map(async (term) => {
      const [
        programmeName,
        programmeField,
        careerName,
        occupation,
        skillName,
        resourceTitle,
        scholarshipTitle,
        opportunityTitle,
      ] = await Promise.all([
        searchRows(admin, "programmes",
          "id,name,field,description,qualification,qualification_level,duration,entry_requirements,admission_summary,wassce_requirements,application_url,programme_url,source_url,primary_source_url,verification_status,verified,last_verified_at,university_id,institution_id",
          "name", term),
        searchRows(admin, "programmes",
          "id,name,field,description,qualification,qualification_level,duration,entry_requirements,admission_summary,wassce_requirements,application_url,programme_url,source_url,primary_source_url,verification_status,verified,last_verified_at,university_id,institution_id",
          "field", term),
        searchRows(admin, "programme_careers",
          "id,career,occupation,description,licence_note,last_verified,programme_id",
          "career", term),
        searchRows(admin, "programme_careers",
          "id,career,occupation,description,licence_note,last_verified,programme_id",
          "occupation", term),
        searchRows(admin, "skills",
          "id,name,category,description,difficulty,prerequisites,learning_resources,projects,related_jobs,verification_status,primary_source_url,last_checked_at",
          "name", term),
        searchRows(admin, "learning_resources",
          "id,provider,title,url,category,skills,level,country_code,source_url",
          "title", term),
        searchRows(admin, "scholarships",
          "id,title,name,provider,study_level,fields,description,eligibility,academic_requirements,coverage,deadline,deadline_date,application_url,website_url,source_url,verified,last_verified_at",
          "title", term,
          (builder) => builder.eq("verified", true)),
        searchRows(admin, "opportunities",
          "id,title,opportunity_type,company_name,country_code,country,location,description,requirements,eligibility,skills,skills_required,application_url,apply_url,source_name,source_url,posted_at,deadline,deadline_date,status,is_active,published,verified,last_verified_at",
          "title", term,
          (builder) => builder.eq("is_active", true).eq("published", true).eq("verified", true)),
      ]);
      return {
        programmes: [...programmeName, ...programmeField],
        careerLinks: [...careerName, ...occupation],
        skills: skillName,
        learningResources: resourceTitle,
        scholarships: scholarshipTitle,
        opportunities: opportunityTitle,
      };
    }));

    const all = (key: keyof CareerEvidence) => dedupe(
      queryGroups.flatMap((group) => group[key]),
      key === "programmes" ? 12 : key === "careerLinks" ? 12 : 8,
    );

    const programmes = all("programmes");
    const universityIds = Array.from(new Set(programmes
      .map((row) => row.university_id)
      .filter((value): value is string => typeof value === "string"))).slice(0, 12);
    const institutionIds = Array.from(new Set(programmes
      .map((row) => row.institution_id)
      .filter((value): value is string => typeof value === "string"))).slice(0, 12);

    const [universities, institutions] = await Promise.all([
      universityIds.length
        ? admin.from("universities")
          .select("id,name,short_name,city,region,country,website_url,admissions_url,source_url,verification_status,verified,last_verified_at")
          .in("id", universityIds)
        : Promise.resolve({ data: [], error: null }),
      institutionIds.length
        ? admin.from("institutions")
          .select("id,official_name,institution_type,town,region,website_url,gtec_accreditation_status,verification_status,last_verified_at,primary_source_url")
          .in("id", institutionIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const universityMap = new Map((universities.data ?? []).map((row) => [String(row.id), row]));
    const institutionMap = new Map((institutions.data ?? []).map((row) => [String(row.id), row]));
    const programmesWithInstitutions = programmes.map((row) => ({
      ...row,
      university: universityMap.get(String(row.university_id)) ?? null,
      institution: institutionMap.get(String(row.institution_id)) ?? null,
    }));

    return {
      programmes: programmesWithInstitutions,
      careerLinks: all("careerLinks"),
      skills: all("skills"),
      learningResources: all("learningResources"),
      scholarships: all("scholarships"),
      opportunities: all("opportunities"),
    };
  } catch {
    console.error("Career evidence retrieval is temporarily unavailable");
    return {
      programmes: [],
      careerLinks: [],
      skills: [],
      learningResources: [],
      scholarships: [],
      opportunities: [],
    };
  }
}

export function summarizeCareerEvidence(evidence: CareerEvidence) {
  return {
    programmesFound: evidence.programmes.length,
    programmeCareerLinksFound: evidence.careerLinks.length,
    skillsFound: evidence.skills.length,
    learningResourcesFound: evidence.learningResources.length,
    verifiedScholarshipsFound: evidence.scholarships.length,
    currentVerifiedOpportunitiesFound: evidence.opportunities.length,
    records: evidence,
  };
}
