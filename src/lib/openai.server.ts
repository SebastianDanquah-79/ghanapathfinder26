import { createOpenAI } from "@ai-sdk/openai";

/**
 * The single server-side OpenAI entry point for GhanaPathFinder.
 * All active AI pages use the same Vercel OPENAI_API_KEY and Responses API.
 */
export function createOpenAIResponsesModel(modelOverride?: string) {
  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured in the Vercel project environment variables.");
  }

  const modelName =
    modelOverride ||
    process.env["OPENAI_MODEL"] ||
    "gpt-6-luna";

  return createOpenAI({ apiKey }).responses(modelName);
}
