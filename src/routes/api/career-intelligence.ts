import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
import { z } from "zod";
import { checkApiRateLimit, readJsonBody, rateLimitResponse } from "@/lib/api-rate-limit";
import { aiErrorResponse, createOpenAIResponsesModel } from "@/lib/openai.server";
import {
  rankCareerCandidates,
  retrieveCareerEvidence,
  summarizeCareerEvidence,
  type CareerCandidate,
} from "@/lib/ai/career-evidence.server";

type RequestBody = {
  profile?: {
    targetCareer?: unknown;
    currentStage?: unknown;
    interests?: unknown;
    existingSkills?: unknown;
    location?: unknown;
  };
  wassceResults?: unknown;
  candidates?: unknown;
};

const text = (value: unknown, max = 320) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const list = (value: unknown, maxItems = 10, maxLength = 120): string[] =>
  Array.isArray(value)
    ? value.slice(0, maxItems).map((item) => text(item, maxLength)).filter(Boolean)
    : [];

const outputSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.object({
    id: z.string(),
    reason: z.string(),
    skillsToDevelop: z.array(z.string()).max(5),
    starterProjects: z.array(z.string()).max(4),
    nextActions: z.array(z.string()).max(4),
  })).max(4),
  next90Days: z.array(z.object({
    period: z.string(),
    focus: z.string(),
    actions: z.array(z.string()).max(3),
  })).max(3),
  evidenceNote: z.string(),
});

function compactEvidence(evidence: ReturnType<typeof summarizeCareerEvidence>) {
  return {
    counts: {
      programmes: evidence.programmesFound,
      programmeCareerLinks: evidence.programmeCareerLinksFound,
      skills: evidence.skillsFound,
      learningResources: evidence.learningResourcesFound,
      verifiedScholarships: evidence.verifiedScholarshipsFound,
      currentVerifiedOpportunities: evidence.currentVerifiedOpportunitiesFound,
    },
    programmes: evidence.records.programmes.slice(0, 8).map((row) => ({
      name: row["name"],
      field: row["field"],
      qualification: row["qualification"],
      qualification_level: row["qualification"]_level,
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
    skills: evidence.records.skills.slice(0, 6).map((row) => ({
      name: row["name"],
      category: row["category"],
      description: row["description"],
      difficulty: row["difficulty"],
      prerequisites: row["prerequisites"],
      primary_source_url: row["primary_source_url"],
    })),
    learningResources: evidence.records.learningResources.slice(0, 5).map((row) => ({
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
      last_verified_at: row["last_verified"]_at,
    })),
    opportunities: evidence.records.opportunities.slice(0, 4).map((row) => ({
      title: row["title"],
      company_name: row["company_name"],
      country_code: row["country_code"],
      location: row["location"],
      skills: row["skills"] || row["skills"]_required,
      application_url: row["application_url"] || row["apply_url"],
      deadline_date: row["deadline_date"],
      source_url: row["source_url"],
      verified: row["verified"],
      last_verified_at: row["last_verified"]_at,
    })),
  };
}

export const Route = createFileRoute("/api/career-intelligence")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkApiRateLimit(request, "career-intelligence", 6, 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);

        let body: RequestBody;
        try {
          body = await readJsonBody(request, 48 * 1024) as RequestBody;
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return Response.json({
            error: tooLarge ? "Career profile data is too large." : "A valid JSON request is required.",
            code: tooLarge ? "request_too_large" : "invalid_json",
          }, { status: tooLarge ? 413 : 400 });
        }

        const profile = {
          targetCareer: text(body?.profile?.targetCareer, 160),
          currentStage: text(body?.profile?.currentStage, 180),
          interests: text(body?.profile?.interests, 1000),
          existingSkills: text(body?.profile?.existingSkills, 1000),
          location: text(body?.profile?.location, 120),
        };

        const wassceResults = Array.isArray(body?.wassceResults)
          ? body.wassceResults.slice(0, 20).flatMap((item) => {
              if (!item || typeof item !== "object") return [];
              const row = item as Record<string, unknown>;
              const subject = text(row["subject"], 100);
              const grade = text(row["grade"], 8).toUpperCase();
              if (!subject || !["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"].includes(grade)) return [];
              return [{ subject, grade }];
            })
          : [];

        if (
          !profile.targetCareer &&
          !profile.interests &&
          !profile.existingSkills &&
          !profile.currentStage &&
          wassceResults.length === 0
        ) {
          return Response.json({
            error: "Add a career goal, interests, skills, current study stage or WASSCE results before requesting an analysis.",
            code: "profile_required",
          }, { status: 400 });
        }

        if (!Array.isArray(body?.candidates) || body.candidates.length < 1 || body.candidates.length > 60) {
          return Response.json({
            error: "A valid career catalogue of up to 60 options is required.",
            code: "career_catalogue_invalid",
          }, { status: 400 });
        }

        const candidates: CareerCandidate[] = body.candidates
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item) => ({
            id: text(item["id"], 180),
            careerName: text(item["careerName"], 160),
            major: text(item["major"], 120),
            description: text(item["description"], 420),
            relevantSubjects: list(item["relevantSubjects"], 8, 100),
            recommendedProgrammes: list(item["recommendedProgrammes"], 8, 120),
            skills: list(item["skills"], 10, 100),
            entryLevelRoles: list(item["entryLevelRoles"], 8, 120),
            industries: list(item["industries"], 8, 100),
          }))
          .filter((item) => item.id && item.careerName && item.major);

        if (!candidates.length) {
          return Response.json({
            error: "The supplied career catalogue contains no usable options.",
            code: "career_catalogue_empty",
          }, { status: 400 });
        }

        try {
          const ranked = rankCareerCandidates(candidates, profile, wassceResults);
          const topCandidates = ranked.slice(0, 12);
          const evidence = await retrieveCareerEvidence(profile, ranked);
          const compact = compactEvidence(summarizeCareerEvidence(evidence));

          const modelCandidates = topCandidates.map((item) => ({
            id: item.candidate.id,
            careerName: item.candidate.careerName,
            major: item.candidate.major,
            description: item.candidate.description,
            relevantSubjects: item.candidate.relevantSubjects,
            recommendedProgrammes: item.candidate.recommendedProgrammes,
            skills: item.candidate.skills,
            entryLevelRoles: item.candidate.entryLevelRoles,
            industries: item.candidate.industries,
            deterministicProfileMatch: item.relevance,
            matchingEvidence: item.evidence,
          }));

          const result = await generateText({
            model: createOpenAIResponsesModel(undefined, "structured"),
            output: Output.object({ schema: outputSchema }),
            system: `You are GhanaPathFinder's Career Intelligence adviser.

Use the student's profile, deterministically ranked career options, and live GhanaPathFinder evidence supplied in the prompt.

Rules:
- Recommend only careers whose exact IDs appear in the supplied candidate list.
- The deterministicProfileMatch score is calculated by the application from the student's stated profile. Do not change, reinterpret or present it as an employment probability.
- Use the student's interests, existing skills, stage, location and WASSCE subjects together. WASSCE results are context, not a verdict on potential.
- Explain why a recommendation fits using supplied profile evidence. Never shame a student.
- Distinguish formally stated admission requirements from general programme descriptions. If the database does not provide a verified requirement, say it must be checked with the institution.
- Use live catalogue evidence only when it is actually present in the prompt. Do not invent programmes, institutions, scholarships, jobs, salaries, deadlines or employers.
- Treat directory records as leads unless their verification and publication fields confirm more.
- Never imply that an internship or job is open unless a current active, published and verified listing is supplied.
- Give realistic, low-cost projects and useful next steps.
- Return the required structured object. Do not include Markdown fences.`,
            prompt: `STUDENT PROFILE
${JSON.stringify(profile)}

WASSCE RESULTS (lower aggregate is better; these are subject grades, not a total aggregate)
${JSON.stringify(wassceResults)}

DETERMINISTICALLY RANKED CAREER CATALOGUE (recommend only exact IDs; profile scores are computed by the application)
${JSON.stringify(modelCandidates)}

LIVE GHANAPATHFINDER EVIDENCE (use only supplied records; respect source and verification metadata)
${JSON.stringify(compact)}

Return at most four career recommendations, ordered by the deterministic profile match ranking. Do not fill the list with weak matches. For each recommendation, explain the fit, identify realistic skills to develop, suggest starter projects and provide concrete next actions. Build a staged 90-day plan. The evidence note must identify what live platform evidence was found and what is missing.`,
            maxOutputTokens: 1_800,
            timeout: { totalMs: 40_000 },
          });

          if (!result.output) {
            throw new Error("Career Intelligence did not return a complete structured result.");
          }

          const rankedById = new Map(ranked.map((item) => [item.candidate.id, item]));
          const recommendations = result.output.recommendations.slice(0, 4).flatMap((item) => {
            const match = rankedById.get(text(item.id, 180));
            if (!match) return [];
            return [{
              id: match.candidate.id,
              careerName: match.candidate.careerName,
              major: match.candidate.major,
              relevantSubjects: match.candidate.relevantSubjects,
              recommendedProgrammes: match.candidate.recommendedProgrammes,
              entryLevelRoles: match.candidate.entryLevelRoles,
              industries: match.candidate.industries,
              relevance: match.relevance,
              reason: text(item.reason, 700),
              matchingEvidence: match.evidence,
              skillsToDevelop: list(item.skillsToDevelop, 5, 180),
              starterProjects: list(item.starterProjects, 4, 220),
              nextActions: list(item.nextActions, 4, 220),
            }];
          });

          const counts = compact.counts;
          const evidenceSummary = [
            `Live catalogue evidence retrieved: ${counts.programmes} programmes, ${counts.programmeCareerLinks} programme-career links, ${counts.skills} skills, ${counts.learningResources} learning resources, ${counts.verifiedScholarships} verified scholarships and ${counts.currentVerifiedOpportunities} active verified opportunities.`,
            "Records can change. Confirm programme entry requirements, scholarship deadlines and opportunity availability with the linked official source before acting.",
          ].join(" ");

          return Response.json({
            summary: text(result.output.summary, 1000),
            recommendations,
            next90Days: result.output.next90Days.slice(0, 3).map((item) => ({
              period: text(item.period, 60),
              focus: text(item.focus, 240),
              actions: list(item.actions, 3, 220),
            })),
            evidenceNote: [text(result.output.evidenceNote, 600), evidenceSummary].filter(Boolean).join(" "),
          }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          console.error("Career Intelligence analysis failed", error instanceof Error ? error.message : "Unknown error");
          return aiErrorResponse(error, "Career Intelligence could not complete the analysis. Please try again.");
        }
      },
    },
  },
});
