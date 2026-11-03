import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { checkApiRateLimit, readJsonBody, rateLimitResponse } from "@/lib/api-rate-limit";
import { createOpenAIResponsesModel } from "@/lib/openai.server";

type Candidate = {
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

function parseObject(value: string): Record<string, unknown> {
  const cleaned = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The career analysis response was not a JSON object.");
  }
  return parsed as Record<string, unknown>;
}

export const Route = createFileRoute("/api/career-intelligence")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkApiRateLimit(request, "career-intelligence", 8, 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);

        let body: RequestBody;
        try {
          body = (await readJsonBody(request, 64 * 1024)) as RequestBody;
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return new Response(
            tooLarge ? "Career profile data is too large." : "A valid JSON request is required.",
            { status: tooLarge ? 413 : 400 },
          );
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
              const subject = text(row.subject, 100);
              const grade = text(row.grade, 8).toUpperCase();
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
          return new Response(
            "Add a career goal, interests, skills, current study stage or WASSCE results before requesting an analysis.",
            { status: 400 },
          );
        }

        if (!Array.isArray(body?.candidates) || body.candidates.length < 1 || body.candidates.length > 100) {
          return new Response("A valid career catalogue of up to 100 options is required.", { status: 400 });
        }

        const candidates: Candidate[] = body.candidates
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item) => ({
            id: text(item.id, 180),
            careerName: text(item.careerName, 160),
            major: text(item.major, 120),
            description: text(item.description, 420),
            relevantSubjects: list(item.relevantSubjects, 8, 100),
            recommendedProgrammes: list(item.recommendedProgrammes, 8, 120),
            skills: list(item.skills, 10, 100),
            entryLevelRoles: list(item.entryLevelRoles, 8, 120),
            industries: list(item.industries, 8, 100),
          }))
          .filter((item) => item.id && item.careerName && item.major);

        if (candidates.length === 0) {
          return new Response("The supplied career catalogue contains no usable options.", { status: 400 });
        }

        try {
          const result = await generateText({
            model: createOpenAIResponsesModel(),
            system: `You are GhanaPathFinder's Career Intelligence adviser. Give balanced, practical career guidance using the student's supplied profile, WASSCE results and career catalogue.

Rules:
- Recommend only careers whose exact IDs appear in the supplied catalogue. Do not invent catalogue entries.
- Treat WASSCE grades as one input, not a verdict on a person's potential. Do not shame students or imply that a single grade permanently closes a career.
- Use interests, skills, current stage, preferred location and goals alongside subjects.
- Distinguish a subject that is formally required from one that is merely useful. The supplied catalogue may not contain verified entry requirements.
- Never invent salaries, employer vacancies, internship openings, licensing rules, admission cut-offs, job guarantees or employment probabilities.
- Explain skill gaps as things to develop, not as fixed personal weaknesses.
- Give low-cost, practical first projects and next steps relevant to Ghana where possible.
- Return a valid JSON object only. Do not include Markdown fences.`,
            prompt: `STUDENT PROFILE
${JSON.stringify(profile)}

RECORDED WASSCE RESULTS
${JSON.stringify(wassceResults)}

CAREER CATALOGUE (recommend only exact IDs from this list)
${JSON.stringify(candidates)}

Return JSON in exactly this shape:
{
  "summary": "A practical overview of this student's career direction and the strongest signals in their profile.",
  "recommendations": [
    {
      "id": "exact career ID from the catalogue",
      "relevance": 0,
      "reason": "Why this career is worth exploring, based on the supplied profile.",
      "matchingEvidence": ["Specific interest, subject or skill that supports the match."],
      "skillsToDevelop": ["Two or three skills to build next."],
      "starterProjects": ["One or two realistic portfolio or practical projects."],
      "nextActions": ["One or two immediate steps."]
    }
  ],
  "next90Days": [
    {"period":"Days 1-30","focus":"A realistic first focus","actions":["Action 1","Action 2"]},
    {"period":"Days 31-60","focus":"A realistic second focus","actions":["Action 1","Action 2"]},
    {"period":"Days 61-90","focus":"A realistic third focus","actions":["Action 1","Action 2"]}
  ],
  "evidenceNote": "Explain what information was available and what was missing. State that this is guidance, not a prediction of career success or employment."
}

Return at most four recommendations. Relevance is an advisory ranking signal, not a probability or guarantee. Do not recommend every career simply to fill the list.`,
            maxOutputTokens: 1900,
          });

          const parsed = parseObject(result.text);
          const allowed = new Map(candidates.map((candidate) => [candidate.id, candidate]));
          const recommendations = Array.isArray(parsed.recommendations)
            ? parsed.recommendations.slice(0, 4).flatMap((item) => {
                if (!item || typeof item !== "object") return [];
                const row = item as Record<string, unknown>;
                const id = text(row.id, 180);
                const candidate = allowed.get(id);
                if (!candidate) return [];
                const relevance = Number(row.relevance);
                return [{
                  id,
                  careerName: candidate.careerName,
                  major: candidate.major,
                  relevantSubjects: candidate.relevantSubjects,
                  recommendedProgrammes: candidate.recommendedProgrammes,
                  entryLevelRoles: candidate.entryLevelRoles,
                  industries: candidate.industries,
                  relevance: Number.isFinite(relevance) ? Math.max(0, Math.min(100, Math.round(relevance))) : 0,
                  reason: text(row.reason, 700),
                  matchingEvidence: list(row.matchingEvidence, 5, 220),
                  skillsToDevelop: list(row.skillsToDevelop, 5, 180),
                  starterProjects: list(row.starterProjects, 4, 220),
                  nextActions: list(row.nextActions, 4, 220),
                }];
              })
            : [];

          const next90Days = Array.isArray(parsed.next90Days)
            ? parsed.next90Days.slice(0, 3).flatMap((item) => {
                if (!item || typeof item !== "object") return [];
                const row = item as Record<string, unknown>;
                return [{
                  period: text(row.period, 60),
                  focus: text(row.focus, 240),
                  actions: list(row.actions, 3, 220),
                }];
              })
            : [];

          return Response.json({
            summary: text(parsed.summary, 1000),
            recommendations,
            next90Days,
            evidenceNote: text(parsed.evidenceNote, 700),
          }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          console.error("OpenAI Career Intelligence failed", error);
          return new Response(
            "Career Intelligence could not complete the analysis. Check OpenAI API access and try again.",
            { status: 502 },
          );
        }
      },
    },
  },
});
