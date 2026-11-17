import { describe, expect, it } from "vitest";
import { findPlatformNavigation } from "./platform-tools.server";

describe("GhanaPathFinder platform navigation", () => {
  it("finds the scholarship section from a natural-language question", () => {
    const results = findPlatformNavigation("Where can I find scholarships and funding?");
    expect(results[0]?.href).toBe("/scholarships");
  });

  it("finds the Career Path builder from roadmap wording", () => {
    const results = findPlatformNavigation("Build me a career roadmap");
    expect(results[0]?.href).toBe("/career-path");
  });

  it("finds role-specific portals", () => {
    const results = findPlatformNavigation("I need the employee portal");
    expect(results[0]?.href).toBe("/portal/employee");
    expect(results[0]?.requiresSignIn).toBe(true);
  });

  it("finds account settings and explains sign-in requirement", () => {
    const results = findPlatformNavigation("Where do I change account settings?");
    expect(results[0]?.href).toBe("/settings");
    expect(results[0]?.requiresSignIn).toBe(true);
  });

  it("returns no unverified route for an unknown destination", () => {
    expect(findPlatformNavigation("take me to a page that does not exist")).toEqual([]);
  });
});
