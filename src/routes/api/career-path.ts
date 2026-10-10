import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

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
  const cleaned = text.trim().replace(/^\`\`\`json\s*/i, "").replace(/\`\`\`$/i, "").trim();
  return JSON.parse(cleaned);
}

export const Route = createFileRoute("/api/career-path")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: CareerPathRequest;
        try {
          body = (await request.json()) as CareerPathRequest;
        } catch {
          return new Response("A valid JSON request is required.", { status: 400 });
        }

        const dreamJob = typeof body.dreamJob === "string" ? body.dreamJob.trim().slice(0, 200) : "";
        if (!dreamJob) return new Response("Dream job is required.", { status: 400 });

        const apiKey = process.env["OPENAI_API_KEY"];
        if (!apiKey) return new Response("AI is not configured. Add OPENAI_API_KEY to the Vercel project environment variables.", { status: 503 });

        const profile = Object.entries(body)
          .filter(([key, value]) => key !== "dreamJob" && typeof value === "string" && value.trim())
          .map(([key, value]) => `${key}: ${String(value).trim().slice(0, 1200)}`)
          .join("\n");

        const openai = createOpenAICompatible({
          name: "openai",
          baseURL: "https://api.openai.com/v1",
          apiKey,
        });

        try {
          const result = await generateText({
            model: openai("gpt-6-luna"),
            system: SYSTEM,
            prompt: `Dream job: ${dreamJob}\n${profile || "No additional profile information was provided."}`,
            maxOutputTokens: 1800,
          });
          const parsed = parseJson(result.text);
          return Response.json(parsed);
        } catch (error) {
          console.error("Career Path generation failed", error);
          return new Response("Career Path could not be built. Check the OpenAI API key, model access and billing, then try again.", { status: 502 });
        }
      },
    },
  },
});
