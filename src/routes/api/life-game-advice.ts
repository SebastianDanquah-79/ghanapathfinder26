import { createFileRoute } from "@tanstack/react-router";
import { generateText, Output } from "ai";
import { z } from "zod";
import { checkApiRateLimit, readJsonBody, rateLimitResponse } from "@/lib/api-rate-limit";
import { createOpenAIResponsesModel } from "@/lib/openai.server";

type GameType =
  | "venture-builder"
  | "ai-craft"
  | "capital-builder"
  | "academic-strategist"
  | "impact-builder"
  | "whole-life"
  | "general-strategist";

type RequestBody = {
  goal?: unknown;
  gameType?: unknown;
  startingStage?: unknown;
  weeklyHours?: unknown;
  riskProfile?: unknown;
  horizonYears?: unknown;
};

const GAME_TYPES = new Set<GameType>([
  "venture-builder",
  "ai-craft",
  "capital-builder",
  "academic-strategist",
  "impact-builder",
  "whole-life",
  "general-strategist",
]);

const lifeGameAdviceSchema = z.object({
  overview: z.string(),
  firstFocus: z.string(),
  tradeoff: z.string(),
  weeklyPlan: z.array(z.string()).min(1).max(3),
  checkIn: z.string(),
});
function safeText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export const Route = createFileRoute("/api/life-game-advice")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkApiRateLimit(request, "life-game-advice", 8, 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);

        let body: RequestBody;
        try {
          body = (await readJsonBody(request, 6 * 1024)) as RequestBody;
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return new Response(
            tooLarge ? "The life simulation request is too large." : "A valid JSON request is required.",
            { status: tooLarge ? 413 : 400 },
          );
        }

        const goal = safeText(body?.goal, 240);
        const gameType = body?.gameType as GameType;
        const startingStage = safeText(body?.startingStage, 100);
        const weeklyHours = Number(body?.weeklyHours);
        const riskProfile = safeText(body?.riskProfile, 20);
        const horizonYears = Number(body?.horizonYears);

        if (!goal || goal.length < 5 || !GAME_TYPES.has(gameType)) {
          return new Response("A valid goal and simulation type are required.", { status: 400 });
        }
        if (!Number.isFinite(weeklyHours) || weeklyHours < 1 || weeklyHours > 80 ||
            !Number.isFinite(horizonYears) || horizonYears < 1 || horizonYears > 20 ||
            !["low", "balanced", "high"].includes(riskProfile)) {
          return new Response("The weekly hours, risk profile or time horizon is invalid.", { status: 400 });
        }

        try {
          const result = await generateText({
            model: createOpenAIResponsesModel(),
            output: Output.object({ schema: lifeGameAdviceSchema }),
            system: `You are the GhanaPathFinder Life Simulator's strategy coach. Give grounded, practical advice, not promises. Respect that users have real study, work, health, family and financial responsibilities. Never recommend sleep deprivation, unsafe financial risk, or abandoning school/work based on a hypothetical simulation. Do not treat game metrics as measurements of real human worth. The scenario choice and score remain controlled by the simulator; you only explain the selected game and suggest a realistic way to approach it. Return valid JSON only.`,
            prompt: `GOAL: ${goal}
RECOMMENDED SIMULATION: ${gameType}
CURRENT STAGE: ${startingStage}
AVAILABLE HOURS PER WEEK: ${weeklyHours}
RISK PREFERENCE: ${riskProfile}
TIME HORIZON: ${horizonYears} years

Return JSON in exactly this shape:
{
  "overview": "A concise, personalised explanation of why this simulation is relevant to the goal.",
  "firstFocus": "The most useful first priority.",
  "tradeoff": "One important trade-off the user should keep visible.",
  "weeklyPlan": ["Three small, realistic actions that fit the stated weekly hours."],
  "checkIn": "One question the user should revisit as the simulation progresses."
}`,
            maxOutputTokens: 850,
          });

          const parsed = result.output;
          if (!parsed) throw new Error("Life Simulator advice did not return a complete structured result.");
          const list = Array.isArray(parsed.weeklyPlan)
            ? parsed.weeklyPlan.slice(0, 3).map((item) => safeText(item, 240)).filter(Boolean)
            : [];
          return Response.json({
            overview: safeText(parsed.overview, 800),
            firstFocus: safeText(parsed.firstFocus, 280),
            tradeoff: safeText(parsed.tradeoff, 320),
            weeklyPlan: list,
            checkIn: safeText(parsed.checkIn, 300),
          }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          console.error("OpenAI Life Simulator advice failed", error);
          return new Response("AI strategy advice is temporarily unavailable. You can still use the scenario-based simulator.", { status: 502 });
        }
      },
    },
  },
});
