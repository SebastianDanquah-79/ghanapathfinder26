import { describe, expect, it } from "vitest";
import { buildAskContext } from "./askContext";

describe("buildAskContext", () => {
  it("keeps source context compact and structured", () => {
    const result = buildAskContext("AI jobs", [
      { kind: "opportunity", title: "AI Engineer", subtitle: "Ghana · Remote", blurb: "Build ML systems.", to: "https://example.com" },
    ]);
    expect(result).toContain('Current search: "AI jobs"');
    expect(result).toContain("[opportunity] AI Engineer");
    expect(result).toContain("Build ML systems.");
    expect(result).toContain("https://example.com");
  });

  it("reports an honest empty result", () => {
    expect(buildAskContext("robotics", [])).toContain('no results matched');
  });
});
