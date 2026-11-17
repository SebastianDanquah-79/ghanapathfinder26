import { describe, expect, it } from "vitest";
import {
  buildLocalAIMessages,
  LOCAL_AI_MODEL_ID,
} from "./local-webllm.client";

describe("browser-local AI prompt preparation", () => {
  it("uses the registered lightweight WebLLM model", () => {
    expect(LOCAL_AI_MODEL_ID).toBe("Qwen2.5-0.5B-Instruct-q4f16_1-MLC");
  });

  it("uses tutor instructions and preserves only the latest seven turns", () => {
    const history = Array.from({ length: 10 }, (_, index) => ({
      role: index % 2 === 0 ? "user" as const : "assistant" as const,
      text: `message-${index}`,
    }));

    const messages = buildLocalAIMessages({
      mode: "personal-tutor",
      contextText: "Discrete mathematics lecture notes",
      history,
    });

    expect(messages).toHaveLength(8);
    expect(messages[0]?.role).toBe("system");
    expect(messages[0]?.content).toContain("personal tutor");
    expect(messages[0]?.content).toContain("Discrete mathematics lecture notes");
    expect(messages[1]?.content).toBe("message-3");
    expect(messages.at(-1)?.content).toBe("message-9");
  });

  it("bounds the supplied page context and each conversation turn", () => {
    const messages = buildLocalAIMessages({
      mode: "general",
      contextText: "x".repeat(8_000),
      history: [
        { role: "user", text: "y".repeat(5_000) },
      ],
    });

    expect(messages[0]?.content.length).toBeLessThan(4_000);
    expect(messages[1]?.content.length).toBeLessThanOrEqual(1_200);
  });

  it("uses a separate critical instruction set for co-founder mode", () => {
    const messages = buildLocalAIMessages({
      mode: "cofounder",
      contextText: "",
      history: [{ role: "user", text: "Review this product idea." }],
    });

    expect(messages[0]?.content).toContain("AI co-founder");
    expect(messages[0]?.content).toContain("do not invent market sizes");
  });
});
