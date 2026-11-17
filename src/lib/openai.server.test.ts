import { describe, expect, it } from "vitest";
import { getAIErrorDetails } from "./openai.server";

describe("getAIErrorDetails", () => {
  it("identifies the AI Gateway credit-card prerequisite without exposing billing instructions", () => {
    const result = getAIErrorDetails(new Error(
      "AI Gateway requires a valid credit card on file to service requests. Please add a card to unlock free credits.",
    ));

    expect(result.code).toBe("billing_setup_required");
    expect(result.status).toBe(503);
    expect(result.message).toContain("project owner or administrator");
    expect(result.message).not.toMatch(/credit card|billing portal|payment method/i);
  });

  it("classifies exhausted API credits before generic HTTP 429 handling", () => {
    const result = getAIErrorDetails(Object.assign(
      new Error("You have no credits remaining. Add credits to continue using the API."),
      { status: 429 },
    ));

    expect(result.code).toBe("credits_exhausted");
    expect(result.status).toBe(503);
    expect(result.retryAfterSeconds).toBeUndefined();
    expect(result.message).toContain("provider quota has been exhausted");
  });

  it("classifies insufficient_quota as a non-retryable quota problem", () => {
    const result = getAIErrorDetails(Object.assign(
      new Error("insufficient_quota"),
      { status: 429 },
    ));

    expect(result.code).toBe("credits_exhausted");
    expect(result.status).toBe(503);
    expect(result.retryAfterSeconds).toBeUndefined();
  });

  it("classifies provider rate limits and returns a retry delay", () => {
    const result = getAIErrorDetails(new Error(
      "Rate limit reached. Please try again in 30 seconds.",
    ));

    expect(result.code).toBe("rate_limited");
    expect(result.status).toBe(429);
    expect(result.retryAfterSeconds).toBe(30);
  });

  it("classifies request timeouts separately from provider configuration errors", () => {
    const result = getAIErrorDetails(new Error("Request timed out after 50 seconds."));

    expect(result.code).toBe("timeout");
    expect(result.status).toBe(504);
  });
  it("parses fractional Groq retry delays and explains the per-minute token limit", () => {
    const result = getAIErrorDetails(Object.assign(
      new Error("Rate limit reached on tokens per minute (TPM). Please try again in 12.645s."),
      { status: 429 },
    ));

    expect(result.code).toBe("rate_limited");
    expect(result.retryAfterSeconds).toBe(13);
    expect(result.message).toContain("per-minute token allowance");
    expect(result.message).toContain("13 seconds");
  });

  it("routes legacy OpenAI configuration to Groq", async () => {
    const previous = process.env["AI_PROVIDER"];
    process.env["AI_PROVIDER"] = "openai";
    try {
      const { getAIProvider } = await import("./openai.server");
      expect(getAIProvider()).toBe("groq");
    } finally {
      if (previous === undefined) delete process.env["AI_PROVIDER"];
      else process.env["AI_PROVIDER"] = previous;
    }
  });

  it("uses the configured Groq model for structured generation", async () => {
    const previousProvider = process.env["AI_PROVIDER"];
    const previousModel = process.env["GROQ_MODEL_STRUCTURED"];
    process.env["AI_PROVIDER"] = "groq";
    process.env["GROQ_MODEL_STRUCTURED"] = "openai/gpt-oss-20b";
    try {
      const { getGroqModelName } = await import("./openai.server");
      expect(getGroqModelName("structured")).toBe("openai/gpt-oss-20b");
    } finally {
      if (previousProvider === undefined) delete process.env["AI_PROVIDER"];
      else process.env["AI_PROVIDER"] = previousProvider;
      if (previousModel === undefined) delete process.env["GROQ_MODEL_STRUCTURED"];
      else process.env["GROQ_MODEL_STRUCTURED"] = previousModel;
    }
  });

});
