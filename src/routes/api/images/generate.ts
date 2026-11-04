import { createFileRoute } from "@tanstack/react-router";
import { checkApiRateLimit, rateLimitResponse, readJsonBody } from "@/lib/api-rate-limit";

type ImageGenerationBody = {
  prompt?: unknown;
};

type OpenAIImageResponse = {
  data?: Array<{ b64_json?: string }>;
  error?: {
    code?: string;
    type?: string;
  };
};

const MAX_PROMPT_LENGTH = 1_800;
const MAX_BODY_BYTES = 8 * 1024;

export const Route = createFileRoute("/api/images/generate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Image generation has a separate, tighter limit because each request
        // can incur additional provider charges. This is best-effort per instance.
        const rate = checkApiRateLimit(request, "image-generation", 3, 10 * 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);

        let body: ImageGenerationBody;
        try {
          body = (await readJsonBody(request, MAX_BODY_BYTES)) as ImageGenerationBody;
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return Response.json(
            { error: tooLarge ? "The image prompt is too long." : "A valid JSON request is required." },
            { status: tooLarge ? 413 : 400, headers: { "Cache-Control": "no-store" } },
          );
        }

        if (typeof body?.prompt !== "string") {
          return Response.json(
            { error: "Enter a description of the image you want to create." },
            { status: 400, headers: { "Cache-Control": "no-store" } },
          );
        }

        const prompt = body.prompt.trim();
        if (!prompt) {
          return Response.json(
            { error: "Enter a description of the image you want to create." },
            { status: 400, headers: { "Cache-Control": "no-store" } },
          );
        }
        if (prompt.length > MAX_PROMPT_LENGTH) {
          return Response.json(
            { error: `Keep the image description under ${MAX_PROMPT_LENGTH.toLocaleString()} characters.` },
            { status: 413, headers: { "Cache-Control": "no-store" } },
          );
        }

        const apiKey = process.env["OPENAI_API_KEY"];
        if (!apiKey) {
          return Response.json(
            { error: "Image generation is not configured. Add OPENAI_API_KEY to the Vercel project environment variables." },
            { status: 503, headers: { "Cache-Control": "no-store" } },
          );
        }

        try {
          const providerResponse = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: process.env["OPENAI_IMAGE_MODEL"] || "gpt-image-2.5-flare",
              prompt,
              size: "1024x1024",
              quality: "low",
              output_format: "webp",
              output_compression: 80,
              n: 1,
              moderation: "auto",
            }),
          });

          let providerBody: OpenAIImageResponse | null = null;
          try {
            providerBody = (await providerResponse.json()) as OpenAIImageResponse;
          } catch {
            providerBody = null;
          }

          if (!providerResponse.ok) {
            const providerError = providerBody?.error;
            console.error(
              "GhanaPathFinder image generation provider error",
              providerResponse.status,
              providerError?.type ?? providerError?.code ?? "unknown",
            );

            if (providerError?.code === "insufficient_quota" || providerError?.type === "insufficient_quota") {
              return Response.json(
                { error: "Image generation is disabled because this OpenAI API project has no remaining quota. The project owner must check API billing, usage limits and the project budget before image generation can work." },
                { status: 503, headers: { "Cache-Control": "no-store" } },
              );
            }

            if (providerResponse.status === 429) {
              return Response.json(
                { error: "Image generation is temporarily rate-limited by OpenAI. Please wait a moment before trying again." },
                { status: 503, headers: { "Cache-Control": "no-store" } },
              );
            }

            if (providerResponse.status === 401 || providerResponse.status === 403) {
              return Response.json(
                { error: "Image generation is not enabled for this OpenAI API key or organisation. Check API billing and image-model access." },
                { status: 503, headers: { "Cache-Control": "no-store" } },
              );
            }

            return Response.json(
              { error: "The image could not be generated. Try a different description." },
              { status: providerResponse.status >= 400 && providerResponse.status < 500 ? 422 : 502,
                headers: { "Cache-Control": "no-store" } },
            );
          }

          const imageBase64 = providerBody?.data?.[0]?.b64_json;
          if (!imageBase64) {
            console.error("GhanaPathFinder image generation returned no image data");
            return Response.json(
              { error: "The image service returned an empty result. Please try again." },
              { status: 502, headers: { "Cache-Control": "no-store" } },
            );
          }

          return Response.json(
            { image: `data:image/webp;base64,${imageBase64}` },
            { headers: { "Cache-Control": "no-store" } },
          );
        } catch (error) {
          console.error(
            "GhanaPathFinder image generation request failed",
            error instanceof Error ? error.message : "Unknown error",
          );
          return Response.json(
            { error: "The image service could not be reached. Check your connection and try again." },
            { status: 502, headers: { "Cache-Control": "no-store" } },
          );
        }
      },
    },
  },
});
