import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Provider helper for the Lovable AI Gateway. Server-only: the API key must
 * never reach the browser.
 */
export const createLovableAiGatewayProvider = (apiKey: string) =>
  createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: {
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "vercel-ai-sdk",
    },
  });
