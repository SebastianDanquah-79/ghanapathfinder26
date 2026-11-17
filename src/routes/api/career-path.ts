import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
import { z } from "zod";
import { checkApiRateLimit, readJsonBody, rateLimitResponse } from "@/lib/api-rate-limit";
import { aiErrorResponse, createOpenAIResponsesModel, getAIErrorDetails } from "@/lib/openai.server";
import {
  retrieveCareerEvidence,
  summarizeCareerEvidence,
  type CareerCandidate,
} from "@/lib/ai/career-evidence.server";

type CareerPathRequest = {
  dreamJob?: unknown;
  education?: unknown;
  skills?: unknown;
  interests?: unknown;
  experience?: unknown;
  projects?: unknown;
  goals?: unknown;
  location?: unknown;
};

const safeText = (value: unknown, max = 800) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const careerPathOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  current_state: z.string(),
  stages: z.array(z.object({
    name: z.string(),
    timeframe: z.string(),
    focus: z.string(),
    skills: z.array(z.string()).max(8),
    actions: z.array(z.string()).max(8),
    milestones: z.array(z.string()).max(6),
  })).min(1).max(8),
  next_step: z.string(),
  faq: z.array(z.object({ question: z.string(), answer: z.string() })).max(8),
  evidenceNote: z.string(),
});

function sourceRecords(evidence: ReturnType<typeof summarizeCareerEvidence>) {
  const rows: Array<{ title: string; url: string; status: string }> = [];
  const add = (title: unknown, url: unknown, status: unknown) => {
    if (typeof title !== "string" || typeof url !== "string") return;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return;
      rows.push({
        title: title.slice(0, 180),
        url: parsed.toString(),
        status: typeof status === "string" ? status.slice(0, 80) : "Not recorded",
      });
    } catch {
      // Ignore malformed external links in source records.
    }
  };

  for (const row of evidence.records.programmes.slice(0, 8)) {
    add(row["name"], row["source_url"] || row["primary_source_url"], row["verification_status"]);
    const university = row["university"] && typeof row["university"] === "object"
      ? row["university"] as Record<string, unknown>
      : null;
    if (university) add(university["name"], university["admissions_url"] || university["website_url"], university["verification_status"]);
    const institution = row["institution"] && typeof row["institution"] === "object"
      ? row["institution"] as Record<string, unknown>
      : null;
    if (institution) add(institution["official_name"], institution["primary_source_url"] || institution["website_url"], institution["verification_status"]);
  }
  for (const row of evidence.records.learningResources.slice(0, 5)) {
    add(row["title"], row["url"] || row["source_url"], "Catalogue resource");
  }
  for (const row of evidence.records.skills.slice(0, 5)) {
    add(row["name"], row["primary_source_url"], row["verification_status"]);
  }
  for (const row of evidence.records.scholarships.slice(0, 4)) {
    add(row["title"] || row["name"], row["source_url"] || row["application_url"], row["verified"] === true ? "Verified catalogue record" : "Verification not confirmed");
  }
  for (const row of evidence.records.opportunities.slice(0, 4)) {
    add(row["title"], row["source_url"] || row["application_url"] || row["apply_url"], row["verified"] === true ? "Verified listing" : "Verification not confirmed");
  }

  const unique = new Map<string, { title: string; url: string; status: string }>();
  for (const row of rows) if (!unique.has(row["url"])) unique.set(row["url"], row);
  return Array.from(unique.values()).slice(0, 10);
}

function compactEvidence(evidence: ReturnType<typeof summarizeCareerEvidence>) {
  return {
    counts: {
      programmes: evidence.programmesFound,
      careerLinks: evidence.programmeCareerLinksFound,
      skills: evidence.skillsFound,
      learningResources: evidence.learningResourcesFound,
      verifiedScholarships: evidence.verifiedScholarshipsFound,
      currentVerifiedOpportunities: evidence.currentVerifiedOpportunitiesFound,
    },
    programmes: evidence.records.programmes.slice(0, 10).map((row) => ({
      name: row["name"],
      field: row["field"],
      qualification: row["qualification"],
      qualification_level: row["qualification_level"],
      duration: row["duration"],
      entry_requirements: row["entry_requirements"],
      source_url: row["source_url"] || row["primary_source_url"],
      verification_status: row["verification_status"],
      verified: row["verified"],
      university: row["university"],
      institution: row["institution"],
    })),
    careerLinks: evidence.records.careerLinks.slice(0, 8).map((row) => ({
      career: row["career"],
      occupation: row["occupation"],
      description: row["description"],
      licence_note: row["licence_note"],
      last_verified: row["last_verified"],
    })),
    skills: evidence.records.skills.slice(0, 8).map((row) => ({
      name: row["name"],
      category: row["category"],
      description: row["description"],
      difficulty: row["difficulty"],
      prerequisites: row["prerequisites"],
      primary_source_url: row["primary_source_url"],
    })),
    learningResources: evidence.records.learningResources.slice(0, 6).map((row) => ({
      title: row["title"],
      provider: row["provider"],
      url: row["url"],
      category: row["category"],
      level: row["level"],
      country_code: row["country_code"],
    })),
    scholarships: evidence.records.scholarships.slice(0, 4).map((row) => ({
      title: row["title"] || row["name"],
      provider: row["provider"],
      eligibility: row["eligibility"],
      deadline_date: row["deadline_date"],
      application_url: row["application_url"],
      source_url: row["source_url"],
      verified: row["verified"],
      last_verified_at: row["last_verified_at"],
    })),
    opportunities: evidence.records.opportunities.slice(0, 4).map((row) => ({
      title: row["title"],
      company_name: row["company_name"],
      country_code: row["country_code"],
      location: row["location"],
      skills: row["skills"] || row["skills_required"],
      application_url: row["application_url"] || row["apply_url"],
      deadline_date: row["deadline_date"],
      source_url: row["source_url"],
      verified: row["verified"],
      last_verified_at: row["last_verified_at"],
    })),
  };
}

function buildDeterministicCareerPath(
  dreamJob: string,
  profile: Record<string, string>,
  evidence: ReturnType<typeof summarizeCareerEvidence>,
  sources: Array<{ title: string; url: string; status: string }>,
) {
  const evidenceSkills = evidence.records.skills
    .map((row) => row["name"])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .slice(0, 6);
  const resourceTitles = evidence.records.learningResources
    .map((row) => row["title"])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .slice(0, 3);
  const programmeNames = evidence.records.programmes
    .map((row) => row["name"])
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .slice(0, 5);
  const existingSkills = profile.skills.split(/[,;\s]+/).map((item) => item.trim()).filter(Boolean);
  const suggestedSkills = evidenceSkills.length ? evidenceSkills : existingSkills.slice(0, 5);

  return {
    generationMode: "deterministic_fallback",
    title: `A practical starting path towards ${dreamJob}`,
    summary: `This is a structured, deterministic plan based on the information you supplied and the GhanaPathFinder records currently available. It is a starting framework, not an AI-generated assessment or a guarantee of admission, employment or a particular outcome.`,
    current_state: [
      profile.education ? `Education: ${profile.education}.` : "Your education stage was not specified.",
      profile.skills ? `Skills and experience supplied: ${profile.skills.slice(0, 220)}.` : "Your current skills were not specified.",
      profile.projects ? `Projects supplied: ${profile.projects.slice(0, 180)}.` : "No project experience was supplied.",
      profile.location ? `Preferred location: ${profile.location}.` : "",
    ].filter(Boolean).join(" "),
    stages: [
      {
        name: "Clarify the foundations",
        timeframe: "First 2–4 weeks (estimate)",
        focus: `Identify the prerequisite knowledge and core skills for ${dreamJob}. Use your current education and interests to decide what to learn first.`,
        skills: suggestedSkills.slice(0, 4),
        actions: [
          "Write down the main knowledge areas and prerequisites for the role.",
          resourceTitles.length
            ? `Review these matching platform resources: ${resourceTitles.join(", ")}.`
            : "Find a reputable introductory learning resource and check who provides it.",
          "Break the first learning goal into small weekly tasks.",
        ],
        milestones: [
          "A written list of learning priorities.",
          "A realistic weekly learning routine.",
        ],
      },
      {
        name: "Build a small portfolio project",
        timeframe: "Weeks 5–12 (estimate)",
        focus: `Apply what you have learned to a small project related to ${dreamJob}. Prefer a complete, understandable project over an ambitious unfinished one.`,
        skills: suggestedSkills.slice(0, 5),
        actions: [
          "Choose one project with a clear problem and a manageable scope.",
          "Record the tools, decisions and steps used to build it.",
          "Test the result and write down limitations and possible improvements.",
        ],
        milestones: [
          "One completed project or documented practical exercise.",
          "A short explanation of the problem, approach and result.",
        ],
      },
      {
        name: "Get feedback and strengthen experience",
        timeframe: "Months 3–6 (estimate)",
        focus: "Use feedback to identify gaps, improve your work and understand what entry-level roles or further study require.",
        skills: suggestedSkills.slice(0, 5),
        actions: [
          "Ask a lecturer, mentor or knowledgeable practitioner to review your work.",
          "Improve the project using specific feedback.",
          "Review only current, published and verified opportunities in the platform; confirm details with the provider.",
        ],
        milestones: [
          "A revised portfolio item.",
          "A short list of skills or experience gaps to address next.",
        ],
      },
      {
        name: "Plan the next progression step",
        timeframe: "Months 6–12 (estimate)",
        focus: "Compare suitable further-study and experience options using current, attributable information.",
        skills: suggestedSkills.slice(0, 5),
        actions: [
          programmeNames.length
            ? `Compare these programme records: ${programmeNames.join(", ")}. Confirm entry requirements with each institution.`
            : "Search the programme directory and verify requirements directly with institutions.",
          "Update your CV or portfolio with completed work and evidence of skills.",
          "Choose the next specialisation based on your progress and feedback.",
        ],
        milestones: [
          "A verified shortlist of further-study or experience options.",
          "A revised learning and portfolio plan.",
        ],
      },
    ],
    next_step: "Choose one foundational skill or prerequisite from the first stage and schedule a small, specific task to begin this week.",
    faq: [
      { question: "Are the timeframes guaranteed?", answer: "No. They are planning estimates. Your starting point, available time, access to resources and progress will change the pace." },
      { question: "Does this confirm I qualify for a programme or job?", answer: "No. Check current entry requirements, licensing rules and opportunity details with the official institution or provider." },
      { question: "Why is this a deterministic plan?", answer: "The configured AI provider has exhausted its available quota. This plan was assembled from your inputs and available catalogue records using fixed rules; it was not generated by a language model." },
    ],
    evidenceNote: `Deterministic fallback: AI generation is unavailable because the configured provider quota is exhausted. The catalogue contained ${evidence.programmesFound} programmes, ${evidence.programmeCareerLinksFound} career links, ${evidence.skillsFound} skill records, ${evidence.learningResourcesFound} learning resources, ${evidence.verifiedScholarshipsFound} verified scholarship records and ${evidence.currentVerifiedOpportunitiesFound} active verified opportunity records. ${sources.length} source links were attached. Verify all current requirements, deadlines and availability with the relevant official source.`,
    sources,
    evidenceCounts: {
      programmes: evidence.programmesFound,
      careerLinks: evidence.programmeCareerLinksFound,
      skills: evidence.skillsFound,
      learningResources: evidence.learningResourcesFound,
      verifiedScholarships: evidence.verifiedScholarshipsFound,
      currentVerifiedOpportunities: evidence.currentVerifiedOpportunitiesFound,
    },
  };
}

export const Route = createFileRoute("/api/career-path")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkApiRateLimit(request, "career-path", 6, 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);

        let body: CareerPathRequest;
        try {
          body = await readJsonBody(request, 16 * 1024) as CareerPathRequest;
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return Response.json({
            error: tooLarge ? "Career profile data is too large." : "A valid JSON request is required.",
            code: tooLarge ? "request_too_large" : "invalid_json",
          }, { status: tooLarge ? 413 : 400 });
        }

        if (!body || typeof body !== "object" || Array.isArray(body)) {
          return Response.json({ error: "A valid career profile is required.", code: "invalid_profile" }, { status: 400 });
        }

        const dreamJob = safeText(body.dreamJob, 200);
        if (!dreamJob) {
          return Response.json({ error: "Dream job is required.", code: "dream_job_required" }, { status: 400 });
        }

        const profile = {
          education: safeText(body.education),
          skills: safeText(body.skills),
          interests: safeText(body.interests),
          experience: safeText(body.experience),
          projects: safeText(body.projects),
          goals: safeText(body.goals),
          location: safeText(body.location, 160),
        };

        const evidenceCandidate: CareerCandidate = {
          id: "career-path-request",
          careerName: dreamJob,
          major: dreamJob,
          description: `${profile.education} ${profile.skills} ${profile.interests} ${profile.experience}`,
          relevantSubjects: [],
          recommendedProgrammes: [],
          skills: [],
          entryLevelRoles: [],
          industries: [],
        };

        let deterministicFallback: Record<string, unknown> | null = null;
        try {
          const rawEvidence = await retrieveCareerEvidence({
            targetCareer: dreamJob,
            interests: profile.interests,
            existingSkills: `${profile.skills} ${profile.experience} ${profile.projects}`,
          }, [{ candidate: evidenceCandidate }]);
          const evidence = summarizeCareerEvidence(rawEvidence);
          const compact = compactEvidence(evidence);
          const sources = sourceRecords(evidence);
          deterministicFallback = buildDeterministicCareerPath(dreamJob, profile, evidence, sources);

          const result = await generateText({
            maxRetries: 0,
            model: createOpenAIResponsesModel(undefined, "structured"),
            output: Output.object({ schema: careerPathOutputSchema }),
            system: `You are GhanaPathFinder's evidence-aware career progression adviser.

Create a practical pathway from the user's current position toward the requested career. Use their education, skills, interests, experience, projects, goals and location together.

Rules:
- Build a pathway that adapts to the supplied current profile. Do not generate the same generic plan for every user.
- Use the supplied GhanaPathFinder programme, career, skill, learning-resource, scholarship and opportunity records where relevant.
- Distinguish verified facts from general learning advice. A programme description is not automatically an official admission requirement.
- Never invent a university programme, accreditation, entry requirement, licence, fee, scholarship, internship, vacancy, salary or application deadline.
- A current opportunity may be mentioned only when supplied as active, published and verified.
- A career directory relationship is not a promise of employment.
- Do not assume that a user must move abroad. Consider Ghana, Africa and international progression when useful and consistent with the user's location and goals.
- For missing information, state the limitation in current_state or evidenceNote.
- Make timeframes realistic and label them as estimates rather than guarantees.
- Make skills and projects actionable, with sensible sequencing and milestones.
- Return the required structured object. Do not include Markdown fences.`,
            prompt: `CAREER GOAL
${dreamJob}

USER PROFILE
${JSON.stringify(profile)}

LIVE GHANAPATHFINDER DATABASE EVIDENCE
${JSON.stringify(compact)}

Create a pathway with 3–7 logical stages. Begin at the user's current level, identify prerequisites, connect suitable programme options to their real institution records, and include practical skills, projects, experience and further specialisation. If the platform has no matching programme or opportunity records, say so and provide general advice without pretending those records exist. The evidenceNote should state which types of platform records were found and what must be independently confirmed.`,
            maxOutputTokens: 2_000,
            timeout: { totalMs: 45_000 },
          });

          if (!result.output) {
            throw new Error("Career Path did not return a complete structured result.");
          }

          return Response.json({
            ...result.output,
            sources,
            evidenceCounts: compact.counts,
          }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          console.error("Career Path generation failed", error instanceof Error ? error.message : "Unknown error");
          if (getAIErrorDetails(error).code === "credits_exhausted" && deterministicFallback) {
            return Response.json(deterministicFallback, { headers: { "Cache-Control": "no-store" } });
          }
          return aiErrorResponse(error, "Career Path could not be built. Please try again.");
        }
      },
    },
  },
});
