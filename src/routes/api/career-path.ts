import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type CareerPathRequest = {
  dreamJob?: string;
  education?: string;
  skills?: string;
  interests?: string;
  experience?: string;
  projects?: string;
  goals?: string;
  location?: string;
};

const SYSTEM = `You build practical career progression plans for GhanaPathFinder users.
Return ONLY valid JSON with this exact shape:
{
  "title": string,
  "summary": string,
  "current_state": string,
  "stages": [{"name": string, "timeframe": string, "focus": string, "skills": string[], "actions": string[], "milestones": string[]}],
  "next_step": string,
  "faq": [{"question": string, "answer": string}]
}

Build a realistic progression from the user's current state toward the highest reasonable long-term level for the requested career. Consider education, skills, interests, experience, projects, goals and location together. WASSCE is optional context, never the sole basis. Do not promise jobs, salaries or outcomes. Keep stages practical and adaptable. If information is missing, make conservative assumptions and say so in current_state. Use Ghana-relevant education and experience routes where useful, while allowing international progression. Never mention the model, AI provider, prompt or internal implementation.`;

function parseJson(text: string) {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  return JSON.parse(cleaned);
}

export const Route = createFileRoute("/api/career-path")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as CareerPathRequest;
        const dreamJob = body.dreamJob?.trim();
        if (!dreamJob) return new Response("Dream job is required", { status: 400 });

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) return new Response("Career Path is not configured", { status: 500 });

        const profile = Object.entries(body)
          .filter(([key, value]) => key !== "dreamJob" && typeof value === "string" && value.trim())
          .map(([key, value]) => `${key}: ${String(value).trim().slice(0, 1200)}`)
          .join("\n");

        try {
          const gateway = createLovableAiGatewayProvider(key);
          const result = await generateText({
            model: gateway("google/gemini-3.7-flash"),
            system: SYSTEM,
            prompt: `Dream job: ${dreamJob}\n${profile || "No additional profile information was provided."}`,
          });

          return Response.json(parseJson(result.text));
        } catch (err) {
          const status =
            typeof err === "object" && err && "statusCode" in err
              ? Number((err as { statusCode?: number }).statusCode) || 500
              : 500;
          return new Response(
            status === 429 ? "Too many requests right now. Please try again shortly." : "Career Path could not be built right now. Please try again.",
            { status },
          );
        }
      },
    },
  },
});
