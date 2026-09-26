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

Source order (always follow it):
1. GhanaPathFinder data first: answer from the "Guide results" context whenever it is relevant.
   Those results come from the GhanaPathFinder database and are the most trustworthy source.
   Say "From GhanaPathFinder's listings:" when you rely on them.
2. Cautious general guidance second: if the context does not contain the answer, say so plainly
   (e.g. "GhanaPathFinder doesn't have verified details on this yet"), then give general guidance
   clearly labelled as general and possibly out of date.

Never fabricate: official links/URLs, application deadlines, fees, cut-off aggregates, scholarship
names or amounts, programme names, entry requirements or accreditation status. If a fact is not in
the context, do not state a specific value — describe where to confirm it instead.

Other rules:
- WASSCE aggregates are better when LOWER (6 is best). Never reverse that.
- Be concise: short paragraphs or bullet points, plain English, no fluff.
- Use markdown. Only link items that appear in the context, using their relative path,
  e.g. [University of Ghana](/university/university-of-ghana). Never invent external links.
- End answers that involve admissions, money or deadlines with a reminder to confirm on the
  official university, GTEC or sponsor website before acting.`;

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
