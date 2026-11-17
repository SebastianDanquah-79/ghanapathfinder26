import { createOpenAI } from "@ai-sdk/openai";

export type AIModelPurpose = "fast" | "chat" | "reasoning" | "structured";

const DEFAULT_OPENAI_MODEL = "gpt-6-luna";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function getAIProvider(): "openai" | "vercel-gateway" {
  return readEnv("AI_PROVIDER")?.toLowerCase() === "vercel-gateway"
    ? "vercel-gateway"
    : "openai";
}

export function getOpenAIModelName(purpose: AIModelPurpose = "chat"): string {
  const shared = readEnv("OPENAI_MODEL") || DEFAULT_OPENAI_MODEL;
  const byPurpose: Record<AIModelPurpose, string | undefined> = {
    fast: readEnv("OPENAI_MODEL_FAST"),
    chat: readEnv("OPENAI_MODEL_CHAT"),
    reasoning: readEnv("OPENAI_MODEL_REASONING"),
    structured: readEnv("OPENAI_MODEL_STRUCTURED"),
  };
  return byPurpose[purpose] || shared;
}

export function getGatewayModelName(purpose: AIModelPurpose = "chat"): string {
  const byPurpose: Record<AIModelPurpose, string | undefined> = {
    fast: readEnv("AI_GATEWAY_MODEL_FAST"),
    chat: readEnv("AI_GATEWAY_MODEL_CHAT"),
    reasoning: readEnv("AI_GATEWAY_MODEL_REASONING"),
    structured: readEnv("AI_GATEWAY_MODEL_STRUCTURED"),
  };
  const configured = byPurpose[purpose] || readEnv("AI_GATEWAY_MODEL");
  if (!configured || !configured.includes("/")) {
    throw new Error(
      `Set AI_GATEWAY_MODEL_${purpose.toUpperCase()} or AI_GATEWAY_MODEL to a provider/model identifier before enabling Vercel AI Gateway.`,
    );
  }
  return configured;
}

/**
 * Central server-side model factory. The default remains the existing OpenAI
 * provider for backwards compatibility. Set AI_PROVIDER=vercel-gateway and
 * configure AI_GATEWAY_MODEL_* values to route calls through Vercel AI Gateway.
 */
export function createOpenAIResponsesModel(
  modelOverride?: string,
  purpose: AIModelPurpose = "chat",
) {
  if (getAIProvider() === "vercel-gateway") {
    // Do not pass legacy plain OpenAI model names into the gateway. Gateway
    // model IDs must include their provider prefix (provider/model).
    const gatewayModel = getGatewayModelName(purpose);
    return gatewayModel;
  }

  const apiKey = readEnv("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured in the Vercel project environment variables.");
  }

  const modelName = modelOverride || getOpenAIModelName(purpose);
  return createOpenAI({ apiKey }).responses(modelName);
}

export type AIErrorDetails = {
  status: 429 | 502 | 503 | 504;
  code: "rate_limited" | "configuration_error" | "timeout" | "provider_error";
  message: string;
  retryAfterSeconds?: number;
};

function readStatus(error: unknown): number | undefined {
  if (!error || typeof error !== "object") return undefined;
  const candidate = error as { status?: unknown; statusCode?: unknown };
  const value = candidate.statusCode ?? candidate.status;
  return typeof value === "number" ? value : undefined;
}

function readMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const value = (error as { message?: unknown }).message;
    if (typeof value === "string") return value;
  }
  return String(error ?? "");
}

function parseRetryAfter(message: string): number | undefined {
  const match = message.match(/try again in\s+(\d+)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)/i);
  if (!match) return undefined;
  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? "s";
  const multiplier = unit.startsWith("h") ? 3600 : unit.startsWith("m") ? 60 : 1;
  return Math.max(1, Math.min(86_400, amount * multiplier));
}

export function getAIErrorDetails(error: unknown): AIErrorDetails {
  const rawMessage = readMessage(error);
  const message = rawMessage.toLowerCase();
  const status = readStatus(error);

  if (
    status === 429 ||
    message.includes("rate limit") ||
    message.includes("rate_limit") ||
    message.includes("too many requests") ||
    message.includes("tokens per min")
  ) {
    return {
      status: 429,
      code: "rate_limited",
      message: "GhanaPathFinder AI is temporarily at capacity. Your conversation is saved; please wait before retrying.",
      retryAfterSeconds: parseRetryAfter(rawMessage) ?? 60,
    };
  }

  if (
    status === 401 || status === 403 ||
    message.includes("api key") ||
    message.includes("authentication") ||
    message.includes("insufficient_quota") ||
    message.includes("billing") ||
    message.includes("not configured")
  ) {
    return {
      status: 503,
      code: "configuration_error",
      message: "The AI service is not correctly configured right now. Please try again later.",
    };
  }

  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("aborterror")
  ) {
    return {
      status: 504,
      code: "timeout",
      message: "That request took too long to complete. Your conversation is saved; please try again.",
      retryAfterSeconds: 5,
    };
  }

  return {
    status: 502,
    code: "provider_error",
    message: "The AI service could not complete that request. Your conversation is saved; please try again.",
  };
}

export function aiErrorResponse(error: unknown, fallbackMessage?: string): Response {
  const details = getAIErrorDetails(error);
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (details.retryAfterSeconds) headers["Retry-After"] = String(details.retryAfterSeconds);

  return Response.json({
    error: fallbackMessage && details.code === "provider_error" ? fallbackMessage : details.message,
    code: details.code,
  }, {
    status: details.status,
    headers,
  });
}
