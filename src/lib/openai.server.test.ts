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
});
