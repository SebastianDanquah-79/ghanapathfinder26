import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { checkApiRateLimit, readJsonBody, rateLimitResponse } from "@/lib/api-rate-limit";
import { createOpenAIResponsesModel } from "@/lib/openai.server";

type Candidate = {
  programme: string;
  university: string;
  category: string;
  confidence: number | null;
  benchmarkKind: string;
  benchmarkLabel: string;
  explanation: string;
  gaps: string[];
};

type RequestBody = {
  profile?: {
    studentName?: unknown;
    major?: unknown;
    aggregate?: unknown;
    preference?: unknown;
    english?: unknown;
    mathematics?: unknown;
    science?: unknown;
  };
  matches?: unknown;
};

function parseJsonObject(value: string): unknown {
  const cleaned = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  return JSON.parse(cleaned);
}

function short(value: unknown, max = 240): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/admission-recommendation")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkApiRateLimit(request, "admission-recommendation", 8, 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);

        let body: RequestBody;
        try {
          body = (await readJsonBody(request, 24 * 1024)) as RequestBody;
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return new Response(
            tooLarge ? "The recommendation request is too large." : "A valid JSON request is required.",
            { status: tooLarge ? 413 : 400 },
          );
        }

        if (!body || typeof body !== "object" || !body.profile || typeof body.profile !== "object" || !Array.isArray(body.matches)) {
          return new Response("A student profile and match list are required.", { status: 400 });
        }
        if (body.matches.length < 1 || body.matches.length > 8) {
          return new Response("Send between 1 and 8 ranked programme matches.", { status: 400 });
        }

        const profile = {
          studentName: short(body.profile.studentName, 80),
          major: short(body.profile.major, 100),
          aggregate: Number(body.profile.aggregate),
          preference: short(body.profile.preference, 40),
          english: short(body.profile.english, 8),
          mathematics: short(body.profile.mathematics, 8),
          science: short(body.profile.science, 8),
        };

        const matches: Candidate[] = [];
        for (const raw of body.matches) {
          if (!raw || typeof raw !== "object") continue;
          const item = raw as Record<string, unknown>;
          matches.push({
            programme: short(item.programme, 180),
            university: short(item.university, 140),
            category: short(item.category, 60),
            confidence: typeof item.confidence === "number" ? Math.max(0, Math.min(100, item.confidence)) : null,
            benchmarkKind: short(item.benchmarkKind, 70),
            benchmarkLabel: short(item.benchmarkLabel, 120),
            explanation: short(item.explanation, 500),
            gaps: Array.isArray(item.gaps) ? item.gaps.slice(0, 4).map((gap) => short(gap, 220)) : [],
          });
        }
        if (matches.length === 0 || matches.some((item) => !item.programme || !item.university)) {
          return new Response("The programme match data is incomplete.", { status: 400 });
        }

        try {
          const result = await generateText({
            model: createOpenAIResponsesModel(),
            system: `You are GhanaPathFinder's admissions decision assistant. Explain and prioritise only the programme matches and student data supplied. Never change the rule-based match category or confidence. Never invent admission requirements, cut-offs, official sources, deadlines, fees, eligibility or probabilities. Clearly distinguish official cut-offs, estimates and cases where no benchmark is available. Do not treat the AI summary as an admissions decision. Return a valid JSON object only.`,
            prompt: `STUDENT PROFILE
${JSON.stringify(profile)}

RULE-BASED MATCHES (already scored; do not recalculate)
${JSON.stringify(matches)}

Return JSON in exactly this shape:
{
  "summary": "A concise overview of what these results mean for this student.",
  "strongest_option": "Name one supplied programme and university, or say there is not enough evidence to identify one.",
  "priorities": ["Up to three grounded priorities based only on the supplied data."],
  "next_steps": ["Up to three practical actions. Tell the student to verify current requirements with the university."],
  "caution": "One sentence explaining uncertainty, particularly where no official benchmark is supplied."
}`,
            maxOutputTokens: 1000,
          });

          const parsed = parseJsonObject(result.text) as Record<string, unknown>;
          const list = (value: unknown) =>
            Array.isArray(value) ? value.slice(0, 3).map((item) => short(item, 260)).filter(Boolean) : [];
          return Response.json({
            summary: short(parsed.summary, 900),
            strongestOption: short(parsed.strongest_option, 260),
            priorities: list(parsed.priorities),
            nextSteps: list(parsed.next_steps),
            caution: short(parsed.caution, 400),
          }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          console.error("OpenAI admission recommendation failed", error);
          return new Response("AI recommendation guidance is temporarily unavailable. The evidence-based match results are still available.", { status: 502 });
        }
      },
    },
  },
});
