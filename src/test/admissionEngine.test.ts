import { describe, expect, it } from "vitest";
import { computeAggregate, evaluateMatch, type CutoffRecord } from "@/lib/admissionEngine";

const cutoff = (over: Partial<CutoffRecord> = {}): CutoffRecord => ({
  id: "1",
  university_id: "u",
  programme_name: "BSc. Computer Science",
  academic_year: "2025/2026",
  applicant_category: "First Choice",
  cut_off_aggregate: 7,
  subject_requirements: "B3 in Elective Mathematics",
  admission_notes: null,
  official_source_url: "https://example.org",
  source_name: "Source",
  verification_status: "verified",
  last_verified_at: null,
  ...over,
});

const strong = [
  { subject: "English Language", grade: "A1" },
  { subject: "Core Mathematics", grade: "A1" },
  { subject: "Integrated Science", grade: "B2" },
  { subject: "Elective Mathematics", grade: "A1" },
  { subject: "Physics", grade: "B2" },
  { subject: "Chemistry", grade: "B3" },
];

describe("computeAggregate", () => {
  it("sums 3 cores plus best 3 electives", () => {
    expect(computeAggregate(strong).aggregate).toBe(1 + 1 + 2 + 1 + 2 + 3);
  });

  it("flags missing cores and refuses to score", () => {
    const b = computeAggregate([{ subject: "Physics", grade: "A1" }]);
    expect(b.aggregate).toBeNull();
    expect(b.missingCores).toContain("English Language");
  });

  it("ignores D7 and below as passes", () => {
    const b = computeAggregate([...strong, { subject: "Biology", grade: "E8" }]);
    expect(b.failedSubjects).toHaveLength(1);
  });
});

describe("evaluateMatch", () => {
  it("treats a lower aggregate as better", () => {
    const b = computeAggregate(strong); // aggregate 10 vs cut-off 7
    const r = evaluateMatch(cutoff({ cut_off_aggregate: 20 }), strong, b);
    expect(r.category).toBe("Excellent Match");
    expect(r.confidence).toBeGreaterThan(80);
  });

  it("marks students who miss a subject requirement as not eligible", () => {
    const results = strong.map((s) =>
      s.subject === "Elective Mathematics" ? { ...s, grade: "C6" } : s,
    );
    const r = evaluateMatch(cutoff(), results, computeAggregate(results));
    expect(r.category).toBe("Not Eligible");
    expect(r.confidence).toBe(0);
  });

  it("never scores without a published cut-off", () => {
    const r = evaluateMatch(cutoff({ cut_off_aggregate: null }), strong, computeAggregate(strong));
    expect(r.category).toBe("Insufficient Data");
    expect(r.confidence).toBeNull();
  });

  it("calls an on-the-line aggregate competitive, not excellent", () => {
    const b = computeAggregate(strong);
    const r = evaluateMatch(cutoff({ cut_off_aggregate: b.aggregate! }), strong, b);
    expect(r.category).toBe("Competitive");
    expect(r.confidence).toBeLessThan(60);
  });

  it("caps confidence below 100 even for very strong students", () => {
    const b = computeAggregate(strong);
    const r = evaluateMatch(cutoff({ cut_off_aggregate: 30, subject_requirements: null }), strong, b);
    expect(r.confidence).toBeLessThanOrEqual(92);
  });
});
