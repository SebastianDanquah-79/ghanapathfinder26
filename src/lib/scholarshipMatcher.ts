import { Scholarship, scholarships } from "@/data/scholarships";

export interface MatcherAnswers {
  level: string;
  field: string;
  region: string;
  needBased: boolean;
  aggregate: number | null;
  gender: string;
}

export interface ScholarshipMatch {
  scholarship: Scholarship;
  score: number;
  reasons: string[];
  gaps: string[];
}

const text = (s: Scholarship) =>
  `${s.name} ${s.provider} ${s.coverage} ${s.level} ${s.eligibility}`.toLowerCase();

export const matchScholarships = (a: MatcherAnswers): ScholarshipMatch[] => {
  return scholarships
    .map((s) => {
      const body = text(s);
      const reasons: string[] = [];
      const gaps: string[] = [];
      let score = 40;

      if (a.level && body.includes(a.level.toLowerCase())) {
        score += 20;
        reasons.push(`Open to ${a.level.toLowerCase()} students`);
      }

      if (a.field && a.field !== "Any") {
        if (body.includes(a.field.toLowerCase())) {
          score += 18;
          reasons.push(`Supports ${a.field} students`);
        } else if (/all fields|any (field|programme|program)|any discipline/.test(body)) {
          score += 10;
          reasons.push("Open to all fields of study");
        }
      }

      if (a.needBased) {
        if (/need|needy|financial need|low.income|underserved/.test(body)) {
          score += 15;
          reasons.push("Prioritises students with financial need");
        }
      } else if (/merit|outstanding|brilliant|excellent/.test(body)) {
        score += 8;
        reasons.push("Rewards strong academic performance");
      }

      if (a.gender === "Female" && /women|female|girls/.test(body)) {
        score += 12;
        reasons.push("Dedicated support for young women");
      }

      if (a.region && body.includes(a.region.toLowerCase())) {
        score += 8;
        reasons.push(`Relevant to applicants from ${a.region}`);
      }

      const cutoff = body.match(/aggregate\s*(\d{1,2})\s*[–-]\s*(\d{1,2})/);
      if (a.aggregate != null && cutoff) {
        const max = Number(cutoff[2]);
        if (a.aggregate <= max) {
          score += 12;
          reasons.push(`Your aggregate of ${a.aggregate} meets the usual cut-off`);
        } else {
          score -= 15;
          gaps.push(`Usually asks for aggregate ${cutoff[1]}–${cutoff[2]}`);
        }
      }

      if (/ghanaian/.test(body)) reasons.push("Open to Ghanaian citizens");
      if (s.type === "International") gaps.push("International award — extra documents and English test may apply");
      if (!reasons.length) reasons.push("General eligibility — worth checking the full criteria");

      return {
        scholarship: s,
        score: Math.max(5, Math.min(99, score)),
        reasons: reasons.slice(0, 4),
        gaps,
      };
    })
    .sort((x, y) => y.score - x.score);
};
