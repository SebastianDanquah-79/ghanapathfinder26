/**
 * GhanaPath Admission Match Confidence Engine
 *
 * Principles:
 *  - WASSCE aggregates are golf scores: LOWER is better (aggregate 7 beats aggregate 8).
 *  - A match is only ever as good as the evidence behind it. No cut-off data = no score.
 *  - Subject requirements are hard gates, not soft signals.
 *  - The engine is calibrated to be truthful, not encouraging.
 */

export const GRADE_POINTS: Record<string, number> = {
  A1: 1, B2: 2, B3: 3, C4: 4, C5: 5, C6: 6, D7: 7, E8: 8, F9: 9,
};

export const GRADES = Object.keys(GRADE_POINTS);

/** A single WASSCE subject result held for a student. */
export interface SubjectResult {
  subject: string;
  grade: string;
}

export interface CutoffRecord {
  id: string;
  university_id: string;
  programme_name: string;
  academic_year: string;
  applicant_category: string;
  cut_off_aggregate: number | null;
  subject_requirements: string | null;
  admission_notes: string | null;
  official_source_url: string | null;
  source_name: string | null;
  verification_status: string;
  last_verified_at: string | null;
}

export type MatchCategory =
  | "Excellent Match"
  | "Strong Match"
  | "Competitive"
  | "Reach"
  | "Low Match"
  | "Not Eligible"
  | "Insufficient Data";

export const CATEGORY_STYLES: Record<MatchCategory, string> = {
  "Excellent Match": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Strong Match": "bg-primary/15 text-primary border-primary/30",
  Competitive: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Reach: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "Low Match": "bg-destructive/15 text-destructive border-destructive/30",
  "Not Eligible": "bg-muted text-muted-foreground border-border",
  "Insufficient Data": "bg-muted text-muted-foreground border-border",
};

const CORE_PATTERNS: Array<{ key: string; label: string; test: RegExp }> = [
  { key: "english", label: "English Language", test: /english/i },
  { key: "coremaths", label: "Core Mathematics", test: /(core\s*math|^math(ematic)?s?$|general\s*math)/i },
  { key: "science", label: "Integrated Science", test: /integrated\s*science/i },
  { key: "social", label: "Social Studies", test: /social\s*stud/i },
];

const isCore = (subject: string) => CORE_PATTERNS.some((c) => c.test.test(subject.trim()));

const normalise = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();

/** Find the student's grade for a named subject, tolerating wording differences. */
export function findGrade(results: SubjectResult[], wanted: string): SubjectResult | null {
  const w = normalise(wanted)
    .replace(/\bmath\b/, "mathematics")
    .replace(/\bmaths\b/, "mathematics");
  const candidates = results.filter((r) => {
    const s = normalise(r.subject).replace(/\bmaths\b/, "mathematics").replace(/\bmath\b/, "mathematics");
    if (s === w) return true;
    // "elective mathematics" must not match "core mathematics"
    if (w.includes("elective") && !s.includes("elective")) return false;
    if (w.includes("core") && s.includes("elective")) return false;
    const wKey = w.replace(/\b(elective|core)\b/g, "").trim();
    const sKey = s.replace(/\b(elective|core)\b/g, "").trim();
    return !!wKey && (sKey === wKey || sKey.includes(wKey) || wKey.includes(sKey));
  });
  if (!candidates.length) return null;
  return candidates.sort((a, b) => (GRADE_POINTS[a.grade] ?? 9) - (GRADE_POINTS[b.grade] ?? 9))[0];
}

export interface AggregateBreakdown {
  aggregate: number | null;
  usedSubjects: SubjectResult[];
  missingCores: string[];
  /** Subjects graded D7 or worse (not counted as passes for admission). */
  failedSubjects: SubjectResult[];
  hasEnoughSubjects: boolean;
}

/**
 * WASSCE aggregate = 3 core subjects (English, Core Maths, Integrated Science)
 * + the 3 best elective subjects. Only C6 or better counts towards admission.
 */
export function computeAggregate(results: SubjectResult[]): AggregateBreakdown {
  const clean = results.filter((r) => GRADE_POINTS[r.grade]);
  const failedSubjects = clean.filter((r) => GRADE_POINTS[r.grade] > 6);
  const passes = clean.filter((r) => GRADE_POINTS[r.grade] <= 6);

  const missingCores: string[] = [];
  const coreUsed: SubjectResult[] = [];
  for (const core of CORE_PATTERNS.slice(0, 3)) {
    const hit = passes.find((r) => core.test.test(r.subject));
    if (hit) coreUsed.push(hit);
    else missingCores.push(core.label);
  }

  const electives = passes
    .filter((r) => !isCore(r.subject))
    .sort((a, b) => GRADE_POINTS[a.grade] - GRADE_POINTS[b.grade])
    .slice(0, 3);

  const usedSubjects = [...coreUsed, ...electives];
  const hasEnoughSubjects = missingCores.length === 0 && electives.length >= 3;

  return {
    aggregate: hasEnoughSubjects
      ? usedSubjects.reduce((sum, r) => sum + GRADE_POINTS[r.grade], 0)
      : null,
    usedSubjects,
    missingCores,
    failedSubjects,
    hasEnoughSubjects,
  };
}

export interface RequirementCheck {
  label: string;
  required: string | null;
  studentGrade: string | null;
  status: "met" | "failed" | "unknown" | "manual";
  note: string;
}

/** Parse free-text requirements such as "B3 in Elective Maths, C6 in Chemistry". */
export function checkSubjectRequirements(
  requirements: string | null,
  results: SubjectResult[],
): RequirementCheck[] {
  if (!requirements?.trim()) return [];
  const text = requirements.trim();
  const checks: RequirementCheck[] = [];

  const re = /([A-F][1-9])\s*(?:or\s+better\s*)?in\s+([^,;]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const required = m[1].toUpperCase();
    const rawSubjects = m[2].replace(/\band\b/gi, ",");
    for (const subj of rawSubjects.split(",").map((s) => s.trim()).filter(Boolean)) {
      const hit = findGrade(results, subj);
      if (!hit) {
        checks.push({
          label: subj,
          required,
          studentGrade: null,
          status: "unknown",
          note: `${subj} is required at ${required} or better — you have not entered a grade for it.`,
        });
      } else if (GRADE_POINTS[hit.grade] <= GRADE_POINTS[required]) {
        checks.push({
          label: subj,
          required,
          studentGrade: hit.grade,
          status: "met",
          note: `${subj}: ${hit.grade} meets the required ${required}.`,
        });
      } else {
        checks.push({
          label: subj,
          required,
          studentGrade: hit.grade,
          status: "failed",
          note: `${subj}: ${hit.grade} does not meet the required ${required}.`,
        });
      }
    }
  }

  if (!checks.length && /audition|interview|portfolio/i.test(text)) {
    checks.push({
      label: text,
      required: null,
      studentGrade: null,
      status: "manual",
      note: `This programme also requires ${text.toLowerCase()}, which grades alone cannot predict.`,
    });
  }

  return checks;
}

export interface MatchResult {
  category: MatchCategory;
  /** 0-97. Null when there is no evidence to score against. */
  confidence: number | null;
  headline: string;
  reasons: string[];
  gaps: string[];
  requirementChecks: RequirementCheck[];
  margin: number | null;
  cutoff: CutoffRecord;
}

/**
 * Score a student against one official cut-off record.
 * Margin = cut-off − student aggregate. Positive margin means the student is
 * comfortably inside the published cut-off; negative means they are outside it.
 */
export function evaluateMatch(
  cutoff: CutoffRecord,
  results: SubjectResult[],
  breakdown: AggregateBreakdown,
): MatchResult {
  const requirementChecks = checkSubjectRequirements(cutoff.subject_requirements, results);
  const reasons: string[] = [];
  const gaps: string[] = [];

  const base = (category: MatchCategory, confidence: number | null, headline: string): MatchResult => ({
    category,
    confidence,
    headline,
    reasons,
    gaps,
    requirementChecks,
    margin: breakdown.aggregate != null && cutoff.cut_off_aggregate != null
      ? cutoff.cut_off_aggregate - breakdown.aggregate
      : null,
    cutoff,
  });

  if (cutoff.cut_off_aggregate == null) {
    gaps.push("No published cut-off, so no score.");
    return base("Insufficient Data", null, "No verified cut-off.");
  }

  if (!breakdown.hasEnoughSubjects || breakdown.aggregate == null) {
    if (breakdown.missingCores.length)
      gaps.push(`Missing a pass (C6 or better) in: ${breakdown.missingCores.join(", ")}.`);
    gaps.push("Add 3 cores and 3 electives to be scored.");
    return base("Insufficient Data", null, "Add more WASSCE results to be scored.");
  }

  // Hard gates -------------------------------------------------------------
  const failedReq = requirementChecks.filter((c) => c.status === "failed");
  if (failedReq.length) {
    failedReq.forEach((c) => gaps.push(c.note));
    return base("Not Eligible", 0, "Subject requirement not met.");
  }

  if (breakdown.aggregate > 36) {
    gaps.push("Above 36 is below the degree minimum.");
    return base("Not Eligible", 0, "Below the minimum for degree entry.");
  }

  const margin = cutoff.cut_off_aggregate - breakdown.aggregate;
  const competitive = cutoff.cut_off_aggregate <= 10;

  requirementChecks.filter((c) => c.status === "met").forEach((c) => reasons.push(c.note));
  requirementChecks.filter((c) => c.status === "unknown").forEach((c) => gaps.push(c.note));
  requirementChecks.filter((c) => c.status === "manual").forEach((c) => gaps.push(c.note));

  const unknownReq = requirementChecks.some((c) => c.status === "unknown" || c.status === "manual");

  let category: MatchCategory;
  let confidence: number;

  if (margin >= 4) {
    category = "Excellent Match";
    confidence = Math.min(92, 84 + margin);
    reasons.push(`Your aggregate of ${breakdown.aggregate} is ${margin} points better than the published cut-off of ${cutoff.cut_off_aggregate}.`);
  } else if (margin >= 2) {
    category = "Strong Match";
    confidence = 72 + margin * 3;
    reasons.push(`Your aggregate of ${breakdown.aggregate} is inside the published cut-off of ${cutoff.cut_off_aggregate}.`);
  } else if (margin >= 0) {
    category = "Competitive";
    confidence = 52 + margin * 6;
    reasons.push(`Your aggregate of ${breakdown.aggregate} sits right on the cut-off of ${cutoff.cut_off_aggregate}.`);
    gaps.push("Cut-offs move yearly — on-the-line is never guaranteed.");
  } else if (margin >= -2) {
    category = "Reach";
    confidence = 30 + margin * 8;
    gaps.push(`Your aggregate of ${breakdown.aggregate} is ${Math.abs(margin)} point(s) outside last year's cut-off of ${cutoff.cut_off_aggregate}.`);
  } else if (margin >= -6) {
    category = "Low Match";
    confidence = Math.max(5, 14 + margin);
    gaps.push(`Your aggregate of ${breakdown.aggregate} is ${Math.abs(margin)} points outside the cut-off of ${cutoff.cut_off_aggregate}.`);
  } else {
    gaps.push(`The published cut-off is ${cutoff.cut_off_aggregate}; your aggregate of ${breakdown.aggregate} is well outside it.`);
    return base("Not Eligible", 0, "Far outside the published cut-off.");
  }

  // Truthfulness adjustments ----------------------------------------------
  if (competitive && confidence > 80) confidence -= 6; // highly contested programmes
  if (unknownReq) confidence = Math.round(confidence * 0.85);
  if (cutoff.applicant_category === "Full-Fee Paying")
    reasons.push("Full-fee-paying cut-off — costs more.");

  confidence = Math.max(1, Math.min(92, Math.round(confidence)));

  const headline =
    category === "Excellent Match"
      ? "Comfortably inside the cut-off."
      : category === "Strong Match"
        ? "Inside the cut-off, with room to spare."
        : category === "Competitive"
          ? "On the line — keep a safer second choice."
          : category === "Reach"
            ? "A stretch — pair with safer options."
            : "Unlikely on published cut-offs.";

  return { ...base(category, confidence, headline), category, confidence, headline, margin };
}

export const formatVerifiedDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "Not yet verified";

/**
 * Score a raw, self-reported aggregate against one cut-off record.
 * Used by the landing-page recommender, where we have an aggregate but not the
 * subject-by-subject breakdown. Academic fit only — career goals, interests and
 * region never change the score, they only filter the list.
 */
export interface AggregateMatch {
  category: MatchCategory;
  confidence: number | null;
  margin: number | null;
  explanation: string;
}

export function evaluateAggregate(
  cutOffAggregate: number | null,
  aggregate: number,
): AggregateMatch {
  if (cutOffAggregate == null)
    return {
      category: "Insufficient Data",
      confidence: null,
      margin: null,
      explanation: "No verified cut-off published.",
    };

  if (aggregate > 36)
    return {
      category: "Not Eligible",
      confidence: 0,
      margin: cutOffAggregate - aggregate,
      explanation: "Above 36 is below the degree minimum.",
    };

  const margin = cutOffAggregate - aggregate;
  const inside = `Your aggregate of ${aggregate} against a published cut-off of ${cutOffAggregate}`;

  if (margin >= 4)
    return {
      category: "Excellent Match",
      confidence: Math.min(92, 84 + margin),
      margin,
      explanation: `${inside} — ${margin} points inside it.`,
    };
  if (margin >= 2)
    return {
      category: "Strong Match",
      confidence: 72 + margin * 3,
      margin,
      explanation: `${inside} — comfortably inside it.`,
    };
  if (margin >= 0)
    return {
      category: "Competitive",
      confidence: 52 + margin * 6,
      margin,
      explanation: `${inside} — you are on the line, and cut-offs move each year.`,
    };
  if (margin >= -2)
    return {
      category: "Reach",
      confidence: Math.max(1, 30 + margin * 8),
      margin,
      explanation: `${inside} — ${Math.abs(margin)} point(s) outside it.`,
    };
  if (margin >= -6)
    return {
      category: "Low Match",
      confidence: Math.max(5, 14 + margin),
      margin,
      explanation: `${inside} — ${Math.abs(margin)} points outside it.`,
    };
  return {
    category: "Not Eligible",
    confidence: 0,
    margin,
    explanation: `${inside} — far outside it for this admission year.`,
  };
}
