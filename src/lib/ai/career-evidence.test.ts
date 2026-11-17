import { describe, expect, it } from "vitest";
import { rankCareerCandidates, type CareerCandidate } from "./career-evidence.server";

const candidates: CareerCandidate[] = [
  {
    id: "ai-engineer",
    careerName: "AI Engineer",
    major: "Computer Science",
    description: "Build and deploy artificial intelligence and machine learning systems.",
    relevantSubjects: ["Mathematics", "Physics", "ICT"],
    recommendedProgrammes: ["Computer Science", "Computer Engineering"],
    skills: ["Python", "Linear Algebra", "Machine Learning"],
    entryLevelRoles: ["Junior Software Developer", "Data Analyst"],
    industries: ["Technology", "Research"],
  },
  {
    id: "accountant",
    careerName: "Accountant",
    major: "Accounting",
    description: "Prepare financial statements, audits and tax reports.",
    relevantSubjects: ["Accounting", "Business Management", "Economics"],
    recommendedProgrammes: ["Accounting", "Finance"],
    skills: ["Financial Reporting", "Auditing", "Taxation"],
    entryLevelRoles: ["Accounts Assistant"],
    industries: ["Finance", "Professional Services"],
  },
];

describe("rankCareerCandidates", () => {
  it("ranks the career that matches the student's stated goal and skills first", () => {
    const ranked = rankCareerCandidates(
      candidates,
      {
        targetCareer: "AI Engineer",
        interests: "machine learning and robotics",
        existingSkills: "Python",
        currentStage: "Computer Science student",
      },
      [{ subject: "Mathematics", grade: "B2" }],
    );

    expect(ranked[0]?.candidate.id).toBe("ai-engineer");
    expect(ranked[0]?.evidence).toContain(
      "Matches words in your stated career goal or preferred study field.",
    );
    expect(ranked[0]?.evidence).toContain(
      "Connects with subjects in the WASSCE results you supplied.",
    );
  });

  it("returns a deterministic profile-alignment score, not a success probability", () => {
    const profile = {
      targetCareer: "Accountant",
      interests: "finance",
      existingSkills: "auditing",
      currentStage: "graduate",
    };
    const once = rankCareerCandidates(candidates, profile, []);
    const twice = rankCareerCandidates(candidates, profile, []);

    expect(once.map((item) => [item.candidate.id, item.relevance]))
      .toEqual(twice.map((item) => [item.candidate.id, item.relevance]));
    expect(once[0]?.candidate.id).toBe("accountant");
    expect(once[0]?.relevance).toBeGreaterThan(0);
    expect(once[0]?.relevance).toBeLessThanOrEqual(100);
  });

  it("does not fabricate profile evidence when no supplied attributes match", () => {
    const ranked = rankCareerCandidates(
      candidates,
      {
        targetCareer: "Marine Biologist",
        interests: "ocean ecology",
        existingSkills: "field observation",
        currentStage: "secondary school",
      },
      [],
    );

    expect(ranked[0]?.evidence).toContain(
      "This is an adjacent option from the platform career catalogue; more profile information would improve the comparison.",
    );
  });
});
