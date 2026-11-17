import { describe, expect, it } from "vitest";
import { getAIErrorDetails, getDeepSeekModelName } from "./openai.server";

describe("AI provider configuration", () => {
  it("uses the current DeepSeek Flash Responses model by default", () => {
    expect(getDeepSeekModelName("chat")).toBe("deepseek-flash");
    expect(getDeepSeekModelName("structured")).toBe("deepseek-flash");
  });
});

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

  it("distinguishes an exhausted provider credit balance from a temporary rate limit", () => {
    const result = getAIErrorDetails(new Error(
      "You have no credits remaining. Add credits to continue using the API.",
    ));

    expect(result.code).toBe("credits_exhausted");
    expect(result.status).toBe(503);
    expect(result.message).toContain("project administrator");
    expect(result.message).toContain("conversation has been preserved");
    expect(result.message).not.toMatch(/add credits|payment method|billing portal/i);
  });

  it("classifies a DeepSeek insufficient-balance response as exhausted provider credits", () => {
    const result = getAIErrorDetails(new Error("Insufficient Balance"));

    expect(result.code).toBe("credits_exhausted");
    expect(result.status).toBe(503);
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
});
