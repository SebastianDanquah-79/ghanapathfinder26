import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type ChatRequestBody = {
  messages?: unknown;
  context?: unknown;
};

const SYSTEM = `You are the GhanaPathFinder Ask assistant. You help Ghanaian senior high school
students, graduates and their parents understand universities, degree programmes, scholarships,
career paths, skills and internships in Ghana.

Rules:
- Answer using the "Guide results" context supplied with the question whenever it is relevant.
  Those results come from the GhanaPathFinder database and are the most trustworthy source.
- If the context does not contain the answer, say so plainly and give general, careful guidance.
  Never invent cut-off aggregates, fees, deadlines or official links.
- WASSCE aggregates are better when LOWER (6 is best). Never reverse that.
- Be concise: short paragraphs or bullet points, plain English, no fluff.
- Use markdown. When you mention an item that appears in the context with a link, link it
  using its relative path, e.g. [University of Ghana](/university/university-of-ghana).
- Remind students to confirm details on the official university or sponsor website before acting.`;

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
