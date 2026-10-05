import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatRequestBody = {
  messages?: unknown;
  context?: unknown;
};

const SYSTEM = `You are the GhanaPathFinder AI Career Copilot. You help people make better decisions about education, careers, skills, scholarships, internships, jobs, entrepreneurship and international pathways. Ghana is the starting market, but the product is global.

Rules:
- Prefer the supplied Guide results context whenever it is relevant. Treat it as structured GhanaPathFinder data.
- Never invent fees, cut-offs, deadlines, eligibility, visa requirements, salaries or official links.
- For application or country guidance, distinguish GhanaPathFinder guidance from official-source requirements and tell users to verify current requirements with the official institution or authority.
- Use a lower WASSCE aggregate as better when comparing Ghana admission aggregates.
- Give practical next actions, not vague motivation.
- When a user has a stated goal, connect the answer to a concrete path: education, skills, projects, opportunities and the next action.
- Be concise, plain English and use markdown.
- If context is insufficient, say what is missing rather than guessing.
- Never present an AI estimate as an official fact.`;


export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(body.messages)) {
          return new Response("Messages are required", { status: 400 });
        }

        const key = process.env["LOVABLE_API_KEY"];
        if (!key) {
          return new Response("AI is not configured", { status: 500 });
        }

        const context = typeof body.context === "string" ? body.context.slice(0, 12000) : "";

        const gateway = createLovableAiGatewayProvider(key);

        try {
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: context ? `${SYSTEM}\n\nGuide results context:\n${context}` : SYSTEM,
            messages: await convertToModelMessages(body.messages as UIMessage[]),
          });

          return result.toUIMessageStreamResponse({
            originalMessages: body.messages as UIMessage[],
          });
        } catch (err) {
          const status =
            typeof err === "object" && err && "statusCode" in err
              ? Number((err as { statusCode?: number }).statusCode) || 500
              : 500;
          const message =
            status === 402
              ? "The AI assistant is out of credits. Please try again later."
              : status === 429
                ? "Too many questions right now — please wait a moment and try again."
                : "The AI assistant could not answer that. Please try again.";
          return new Response(message, { status });
        }
      },
    },
  },
});
