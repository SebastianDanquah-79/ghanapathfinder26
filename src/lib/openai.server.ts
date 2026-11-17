import { createOpenAI } from "@ai-sdk/openai";

export type AIModelPurpose = "fast" | "chat" | "reasoning" | "structured";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
const DEFAULT_GROQ_FAST_MODEL = "openai/gpt-oss-20b";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/**
 * Generation now defaults to Groq. The legacy AI_PROVIDER=openai value is
 * deliberately treated as Groq so an old Vercel variable cannot silently
 * keep production traffic on the exhausted OpenAI account.
 */
export function getAIProvider(): "groq" | "vercel-gateway" {
  return readEnv("AI_PROVIDER")?.toLowerCase() === "vercel-gateway"
    ? "vercel-gateway"
    : "groq";
}

export function getGroqModelName(purpose: AIModelPurpose = "chat"): string {
  const shared = readEnv("GROQ_MODEL") || DEFAULT_GROQ_MODEL;
  const byPurpose: Record<AIModelPurpose, string | undefined> = {
    fast: readEnv("GROQ_MODEL_FAST"),
    chat: readEnv("GROQ_MODEL_CHAT"),
    reasoning: readEnv("GROQ_MODEL_REASONING"),
    structured: readEnv("GROQ_MODEL_STRUCTURED"),
  };
  return byPurpose[purpose] || (purpose === "fast" ? DEFAULT_GROQ_FAST_MODEL : shared);
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
 * Shared server-side Responses API model factory.
 *
 * Groq currently exposes an OpenAI-compatible Responses API at
 * /openai/v1/responses, so existing AI SDK routes keep their current
 * generateText/streamText and structured-output call sites.
 */
export function createOpenAIResponsesModel(
  modelOverride?: string,
  purpose: AIModelPurpose = "chat",
) {
  if (getAIProvider() === "vercel-gateway") {
    return getGatewayModelName(purpose);
  }

  const apiKey = readEnv("GROQ_API_KEY");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured in the Vercel project environment variables.");
  }

  const modelName = modelOverride || getGroqModelName(purpose);
  return createOpenAI({
    apiKey,
    baseURL: GROQ_BASE_URL,
    name: "groq",
  }).responses(modelName);
}

export type AIConfigurationDiagnostics = {
  provider: "groq" | "vercel-gateway";
  model: string;
  credentialSource: "groq-api-key" | "gateway-api-key" | "vercel-oidc-auto-resolution" | "missing";
};

export function getAIConfigurationDiagnostics(
  purpose: AIModelPurpose = "chat",
): AIConfigurationDiagnostics {
  const provider = getAIProvider();
  if (provider === "vercel-gateway") {
    let model = "model-not-configured";
    try {
      model = getGatewayModelName(purpose);
    } catch {
      // Return a safe diagnostic value without throwing from telemetry.
    }
    const credentialSource = readEnv("AI_GATEWAY_API_KEY")
      ? "gateway-api-key"
      : "vercel-oidc-auto-resolution";
    return { provider, model, credentialSource };
  }

  return {
    provider,
    model: getGroqModelName(purpose),
    credentialSource: readEnv("GROQ_API_KEY") ? "groq-api-key" : "missing",
  };
}

export type AIErrorDetails = {
  status: 429 | 502 | 503 | 504;
  code: "rate_limited" | "credits_exhausted" | "configuration_error" | "billing_setup_required" | "timeout" | "provider_error";
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

  // Some providers report exhausted account credits as HTTP 429. Detect that
  // account-level condition before treating every 429 as a transient rate limit.
  if (
    message.includes("no credits remaining") ||
    message.includes("insufficient_quota") ||
    message.includes("exceeded your current quota") ||
    message.includes("credit balance is too low") ||
    message.includes("billing hard limit has been reached")
  ) {
    return {
      status: 503,
      code: "credits_exhausted",
      message: "AI replies are unavailable because the platform's AI provider quota has been exhausted. Your conversation is saved. The platform owner must restore an authorised provider quota before AI generation can resume.",
    };
  }

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
    message.includes("requires a valid credit card on file") ||
    message.includes("valid credit card on file") ||
    message.includes("unlock your free credits")
  ) {
    return {
      status: 503,
      code: "billing_setup_required",
      message: "GhanaPathFinder's AI provider needs setup by the project owner or administrator. Please ask them to complete the provider account setup, then try again.",
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
