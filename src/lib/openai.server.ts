import { createOpenAI } from "@ai-sdk/openai";

export type AIModelPurpose = "fast" | "chat" | "reasoning" | "structured";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "openai/gpt-oss-120b";
const DEFAULT_GROQ_FAST_MODEL = "openai/gpt-oss-20b";

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function readProviderErrorMessage(response: Response): Promise<string> {
  return response.clone().json().then((payload: unknown) => {
    if (!payload || typeof payload !== "object") return "";
    const root = payload as Record<string, unknown>;
    const error = root["error"];
    if (typeof error === "string") return error;
    if (error && typeof error === "object" && "message" in error) {
      const message = (error as { message?: unknown }).message;
      return typeof message === "string" ? message : "";
    }
    return typeof root["message"] === "string" ? root["message"] : "";
  }).catch(() => "");
}

function parseRetryAfterHeader(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds;
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, (date - Date.now()) / 1000);
}

function waitForRetry(milliseconds: number, signal: AbortSignal): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(signal.reason ?? new DOMException("The request was aborted.", "AbortError"));
  }

  return new Promise((resolve, reject) => {
    const finish = () => {
      signal.removeEventListener("abort", abort);
      resolve();
    };
    const timer = setTimeout(finish, milliseconds);
    const abort = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      reject(signal.reason ?? new DOMException("The request was aborted.", "AbortError"));
    };
    signal.addEventListener("abort", abort, { once: true });
  });
}

/**
 * Groq returns a precise reset estimate with 429 responses. Wait for short
 * TPM/RPM windows and retry twice instead of returning an immediate stream
 * error. Long daily quota resets are surfaced to the caller without sleeping.
 */
async function groqFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const requestTemplate = new Request(input, init);
  const signal = requestTemplate.signal;
  const perform = () => fetch(requestTemplate.clone());

  let response = await perform();
  for (let attempt = 0; response.status === 429 && attempt < 2; attempt += 1) {
    const providerMessage = await readProviderErrorMessage(response);
    const retryAfter = parseRetryAfterHeader(response.headers.get("retry-after"))
      ?? parseRetryAfter(providerMessage);

    // Do not hold a streaming request open for daily quota resets or an
    // unknown limit. The caller receives the provider's original 429 instead.
    if (retryAfter === undefined || retryAfter > 30) break;

    const delayMs = Math.max(250, Math.ceil(retryAfter * 1000) + 250);
    await waitForRetry(delayMs, signal);
    response = await perform();
  }

  return response;
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
    fetch: groqFetch,
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
  const match = message.match(/try again in\s+(\d+(?:\.\d+)?)\s*(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h)/i);
  if (!match) return undefined;
  const amount = Number(match[1]);
  const unit = match[2]?.toLowerCase() ?? "s";
  const multiplier = unit.startsWith("h") ? 3600 : unit.startsWith("m") ? 60 : 1;
  return Math.max(1, Math.min(86_400, Math.ceil(amount * multiplier)));
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
    const retryAfterSeconds = parseRetryAfter(rawMessage) ?? 15;
    const isDailyLimit = message.includes("per day") ||
      message.includes("(rpd)") ||
      message.includes("(tpd)");
    return {
      status: 429,
      code: "rate_limited",
      message: isDailyLimit
        ? `Groq's daily token or request allowance has been reached. Your conversation is saved. The provider reset estimate is about ${retryAfterSeconds} seconds; if it is longer, try again after the displayed reset time.`
        : `Groq's per-minute token allowance is temporarily full. Your conversation is saved. GhanaPathFinder automatically waits for short provider reset windows and retries. Please try again in about ${retryAfterSeconds} seconds if this attempt still fails.`,
      retryAfterSeconds,
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
