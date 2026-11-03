/**
 * GhanaPathFinder Admission Match Confidence Engine
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
  | "Good Match"
  | "Competitive"
  | "Possible"
  | "Reach"
  | "Low Match"
  | "Not Eligible"
  | "Insufficient Data";

export const CATEGORY_STYLES: Record<MatchCategory, string> = {
  "Excellent Match": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Strong Match": "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Good Match": "bg-primary/15 text-primary border-primary/30",
  Competitive: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Possible: "bg-amber-500/15 text-amber-400 border-amber-500/30",
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
  return candidates.sort((a, b) => (GRADE_POINTS[a.grade] ?? 9) - (GRADE_POINTS[b.grade] ?? 9))[0] ?? null;
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
  const failedSubjects = clean.filter((r) => (GRADE_POINTS[r.grade] ?? 0) > 6);
  const passes = clean.filter((r) => (GRADE_POINTS[r.grade] ?? 9) <= 6);

  const missingCores: string[] = [];
  const coreUsed: SubjectResult[] = [];
  for (const core of CORE_PATTERNS.slice(0, 3)) {
    const hit = passes.find((r) => core.test.test(r.subject));
    if (hit) coreUsed.push(hit);
    else missingCores.push(core.label);
  }

  const electives = passes
    .filter((r) => !isCore(r.subject))
    .sort((a, b) => (GRADE_POINTS[a.grade] ?? 9) - (GRADE_POINTS[b.grade] ?? 9))
    .slice(0, 3);

  const usedSubjects = [...coreUsed, ...electives];
  const hasEnoughSubjects = missingCores.length === 0 && electives.length >= 3;

  return {
    aggregate: hasEnoughSubjects
      ? usedSubjects.reduce((sum, r) => sum + (GRADE_POINTS[r.grade] ?? 0), 0)
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
    const required = (m[1] ?? "").toUpperCase();
    const rawSubjects = (m[2] ?? "").replace(/\band\b/gi, ",");
    for (const subj of rawSubjects.split(",").map((s) => s.trim()).filter(Boolean)) {
      const hit = findGrade(results, subj);
      if (!hit) {
        checks.push({
          label: subj,
          required,
          studentGrade: null,
          status: "unknown",
          note: `${subj} is required at ${required} or better , you have not entered a grade for it.`,
        });
      } else if ((GRADE_POINTS[hit.grade] ?? 9) <= (GRADE_POINTS[required] ?? 9)) {
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
    gaps.push("Cut-offs move yearly , on-the-line is never guaranteed.");
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
    reasons.push("Full-fee-paying cut-off , costs more.");

  confidence = Math.max(1, Math.min(92, Math.round(confidence)));

  const headline =
    category === "Excellent Match"
      ? "Comfortably inside the cut-off."
      : category === "Strong Match"
        ? "Inside the cut-off, with room to spare."
        : category === "Competitive"
          ? "On the line , keep a safer second choice."
          : category === "Reach"
            ? "A stretch , pair with safer options."
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
 * subject-by-subject breakdown. Academic fit only , career goals, interests and
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
      explanation: `${inside} , ${margin} points inside it.`,
    };
  if (margin >= 2)
    return {
      category: "Strong Match",
      confidence: 72 + margin * 3,
      margin,
      explanation: `${inside} , comfortably inside it.`,
    };
  if (margin >= 0)
    return {
      category: "Competitive",
      confidence: 52 + margin * 6,
      margin,
      explanation: `${inside} , you are on the line, and cut-offs move each year.`,
    };
  if (margin >= -2)
    return {
      category: "Reach",
      confidence: Math.max(1, 30 + margin * 8),
      margin,
      explanation: `${inside} , ${Math.abs(margin)} point(s) outside it.`,
    };
  if (margin >= -6)
    return {
      category: "Low Match",
      confidence: Math.max(5, 14 + margin),
      margin,
      explanation: `${inside} , ${Math.abs(margin)} points outside it.`,
    };
  return {
    category: "Not Eligible",
    confidence: 0,
    margin,
    explanation: `${inside} , far outside it for this admission year.`,
  };
}

/* ===========================================================================
 * Broad recommendation engine
 * Works across EVERY verified programme in the database, using either an
 * officially published cut-off or a clearly-labelled estimated range.
 * ========================================================================= */

export interface AdmissionReference {
  programme_id: string;
  programme_slug: string;
  programme_name: string;
  field: string | null;
  degree_type: string;
  university_id: string;
  university_name: string;
  university_short: string | null;
  university_slug: string;
  university_type: string;
  university_category: string;
  region: string | null;
  basis: "official" | "estimated" | "none";
  official_cutoff: number | null;
  applicant_category: string | null;
  academic_year: string | null;
  subject_requirements: string | null;
  official_source_url: string | null;
  source_name: string | null;
  last_verified_at: string | null;
  estimate_low: number | null;
  estimate_high: number | null;
  estimate_method: string | null;
  estimate_evidence: string | null;
  estimate_confidence: string | null;
  entry_requirements: string | null;
  relevant_subjects?: string[] | null;
  university_established_year?: number | null;
  university_student_count?: number | null;
  university_top_programmes?: string[] | null;
  university_admission_aggregate?: string | null;
  university_admission_info?: string | null;
  university_accreditation_status?: string | null;
  institution_gtec_status?: string | null;
  institution_type?: string | null;
}

export interface ReferenceMatch {
  reference: AdmissionReference;
  category: MatchCategory;
  /** Estimated academic/institutional fit score (0-100), not an admission probability. */
  confidence: number | null;
  benchmarkLabel: string;
  benchmarkKind: string;
  why: string;
  requirementChecks: RequirementCheck[];
  gaps: string[];
  rank: number;
  evidenceLevel: "strong" | "moderate" | "limited";
  evidenceBreakdown: {
    academic: number | null;
    subject: number | null;
    institution: number | null;
  };
}

const RANK: Record<MatchCategory, number> = {
  "Excellent Match": 0,
  "Strong Match": 1,
  "Good Match": 2,
  Competitive: 3,
  Possible: 3,
  Reach: 4,
  "Low Match": 5,
  "Not Eligible": 6,
  "Insufficient Data": 7,
};

export const categoryRank = (c: MatchCategory) => RANK[c] ?? 9;

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const GRADE_ACHIEVEMENT: Record<string, number> = {
  A1: 100,
  B2: 94,
  B3: 88,
  C4: 80,
  C5: 74,
  C6: 68,
  D7: 45,
  E8: 20,
  F9: 0,
};

const scoreGradeEvidence = (reference: AdmissionReference, results: SubjectResult[]) => {
  const subjects = reference.relevant_subjects ?? [];
  const relevantGrades = subjects
    .map((subject) => findGrade(results, subject))
    .filter((value): value is SubjectResult => value !== null);

  // If programme-specific subject mappings are not yet in the catalogue,
  // use the student's recorded WASSCE grades as a general achievement signal.
  const grades = relevantGrades.length > 0 ? relevantGrades : results;
  if (grades.length === 0) return null;

  return clampScore(
    grades.reduce((sum, item) => sum + (GRADE_ACHIEVEMENT[item.grade] ?? 0), 0) / grades.length,
  );
};

const parseStoredAggregate = (value: string | null | undefined): number | null => {
  if (!value) return null;
  const match = value.match(/\b([6-9]|[12]\d|3[0-6])\b/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const getInstitutionProfileScore = (reference: AdmissionReference, yearNow: number) => {
  const signals: number[] = [];
  const founded = reference.university_established_year;
  if (founded && founded >= 1800 && founded <= yearNow) {
    const years = yearNow - founded;
    // Historical presence is a modest institutional-context signal, not proof of quality.
    signals.push(clampScore((years / 60) * 100));
  }

  const achievements = reference.university_top_programmes ?? [];
  if (achievements.length > 0) {
    const target = normalise(reference.programme_name);
    const field = normalise(reference.field ?? "");
    const aligned = achievements.some((item) => {
      const value = normalise(item);
      return value && (value.includes(target) || target.includes(value) || (field && value.includes(field)));
    });
    signals.push(aligned ? 100 : 60);
  }

  if (reference.university_student_count != null && reference.university_student_count > 0) {
    // Enrolment is treated only as evidence of a populated institutional profile,
    // not as a direct measure of teaching quality or admission selectivity.
    signals.push(70);
  }

  const accreditation = [
    reference.institution_gtec_status,
    reference.university_accreditation_status,
  ].filter(Boolean).join(" ").toLowerCase();
  if (/active|accredited|chartered/.test(accreditation)) signals.push(90);
  else if (/unverified|needs verification/.test(accreditation)) signals.push(50);

  return signals.length
    ? { score: clampScore(signals.reduce((sum, item) => sum + item, 0) / signals.length), signals: signals.length }
    : null;
};

/**
 * Score the student's academic alignment against programme and institution evidence.
 * The score is an estimate for comparing options, not the probability of receiving an offer.
 * Priority order: official cut-off, programme estimate, historical institution benchmark,
 * then available WASSCE and institution-profile signals.
 */
export function evaluateReference(
  reference: AdmissionReference,
  aggregate: number | null,
  results: SubjectResult[] = [],
): ReferenceMatch {
  const requirementChecks = checkSubjectRequirements(reference.subject_requirements, results);
  const gaps: string[] = [];
  const yearNow = new Date().getFullYear();

  const official = reference.official_cutoff;
  const low = reference.estimate_low;
  const high = reference.estimate_high;
  const historicalAggregate = parseStoredAggregate(reference.university_admission_aggregate);

  const subjectScore = scoreGradeEvidence(reference, results);
  const institutionProfile = getInstitutionProfileScore(reference, yearNow);
  const aggregateScore =
    aggregate != null && Number.isFinite(aggregate) && aggregate >= 6 && aggregate <= 36
      ? clampScore(100 - ((aggregate - 6) / 30) * 65)
      : null;

  const out = (
    category: MatchCategory,
    confidence: number | null,
    why: string,
    benchmarkKind: string,
    benchmarkLabel: string,
    evidenceLevel: ReferenceMatch["evidenceLevel"],
    evidenceBreakdown: ReferenceMatch["evidenceBreakdown"],
  ): ReferenceMatch => ({
    reference,
    category,
    confidence: confidence == null ? null : clampScore(confidence),
    benchmarkLabel,
    benchmarkKind,
    why,
    requirementChecks,
    gaps,
    rank: categoryRank(category),
    evidenceLevel,
    evidenceBreakdown,
  });

  if (aggregateScore == null) {
    return out(
      "Insufficient Data",
      null,
      "Enter your WASSCE aggregate or subject grades to receive an academic-fit estimate.",
      "Estimated academic fit",
      "More WASSCE data required",
      "limited",
      { academic: null, subject: subjectScore, institution: institutionProfile?.score ?? null },
    );
  }

  const failedReq = requirementChecks.filter((item) => item.status === "failed");
  if (failedReq.length) {
    failedReq.forEach((item) => gaps.push(item.note));
    return out(
      "Not Eligible",
      0,
      "One or more recorded subject grades do not meet the supplied programme requirement. Confirm the requirement with the institution.",
      reference.basis === "official" ? "Official requirement check" : "Programme requirement check",
      "Recorded subject requirement not met",
      "strong",
      { academic: aggregateScore, subject: subjectScore, institution: institutionProfile?.score ?? null },
    );
  }

  requirementChecks
    .filter((item) => item.status === "unknown" || item.status === "manual")
    .forEach((item) => gaps.push(item.note));

  if (aggregate > 36) {
    return out(
      "Not Eligible",
      0,
      "The supplied aggregate is above the general WASSCE degree-entry maximum used by this comparison. Check the institution's own route and qualification rules.",
      "Academic eligibility check",
      "Aggregate outside general degree-entry range",
      "moderate",
      { academic: aggregateScore, subject: subjectScore, institution: institutionProfile?.score ?? null },
    );
  }

  // Official published programme cut-offs remain the strongest admission benchmark.
  if (reference.basis === "official" && official != null) {
    const margin = official - aggregate;
    let category: MatchCategory;
    let confidence: number;
    let why: string;

    if (margin >= 3) {
      category = "Strong Match";
      confidence = Math.min(90, 80 + margin);
      why = `Your aggregate of ${aggregate} is ${margin} points better than the published cut-off of ${official}.`;
    } else if (margin >= 1) {
      category = "Good Match";
      confidence = 66 + margin * 4;
      why = `Your aggregate of ${aggregate} is inside the published cut-off of ${official}.`;
    } else if (margin >= -1) {
      category = "Possible";
      confidence = 50 + margin * 6;
      why = `Your aggregate of ${aggregate} sits on the published cut-off of ${official}, and cut-offs can change each year.`;
    } else if (margin >= -4) {
      category = "Reach";
      confidence = 34 + margin * 4;
      why = `Your aggregate of ${aggregate} is ${Math.abs(margin)} points outside the published cut-off of ${official}.`;
    } else if (margin >= -8) {
      category = "Low Match";
      confidence = Math.max(5, 18 + margin);
      why = `Your aggregate of ${aggregate} is well outside the published cut-off of ${official}.`;
    } else {
      return out(
        "Not Eligible",
        0,
        `The published cut-off is ${official}; an aggregate of ${aggregate} is far outside it.`,
        "Officially published",
        `Official cut-off: ${official}`,
        "strong",
        { academic: aggregateScore, subject: subjectScore, institution: institutionProfile?.score ?? null },
      );
    }

    if (official <= 10 && confidence > 78) confidence -= 6;
    if (reference.applicant_category === "Full-Fee Paying") gaps.push("This is the full-fee-paying cut-off; compare the total cost before applying.");

    return out(
      category,
      confidence,
      why,
      "Officially published",
      `Official cut-off: ${official}`,
      "strong",
      { academic: aggregateScore, subject: subjectScore, institution: institutionProfile?.score ?? null },
    );
  }

  // Existing programme estimate, if present, is next in priority.
  if (reference.basis === "estimated" && low != null && high != null) {
    const mid = (low + high) / 2;
    let category: MatchCategory;
    let confidence: number;
    let why: string;

    if (aggregate <= low - 2) {
      category = "Strong Match";
      confidence = Math.min(78, 68 + (low - aggregate));
      why = `Your aggregate of ${aggregate} is better than the whole recorded estimate range of ${low}–${high}.`;
    } else if (aggregate <= mid) {
      category = "Good Match";
      confidence = 64;
      why = `Your aggregate of ${aggregate} falls inside the recorded estimate range of ${low}–${high}.`;
    } else if (aggregate <= high) {
      category = "Possible";
      confidence = 50;
      why = `Your aggregate of ${aggregate} is at the weaker end of the recorded estimate range of ${low}–${high}.`;
    } else if (aggregate <= high + 3) {
      category = "Reach";
      confidence = 30;
      why = `Your aggregate of ${aggregate} is just outside the recorded estimate range of ${low}–${high}.`;
    } else if (aggregate <= high + 8) {
      category = "Low Match";
      confidence = 14;
      why = `Your aggregate of ${aggregate} is outside the recorded estimate range of ${low}–${high}.`;
    } else {
      category = "Not Eligible";
      confidence = 0;
      why = `The recorded estimate range is ${low}–${high}; your aggregate of ${aggregate} is well outside it.`;
    }

    confidence *= reference.estimate_confidence === "low" ? 0.85 : 0.95;
    gaps.push("The recorded range is an estimate, not an official cut-off. Confirm with the institution.");
    return out(
      category,
      confidence,
      why,
      "Recorded programme estimate",
      `Estimated range: ${low}–${high}`,
      "moderate",
      { academic: aggregateScore, subject: subjectScore, institution: institutionProfile?.score ?? null },
    );
  }

  // If the university has a stored admission aggregate, use it as a weaker
  // institutional-level reference. It is never presented as a programme cut-off.
  if (historicalAggregate != null) {
    const margin = historicalAggregate - aggregate;
    const historicalFit = clampScore(50 + margin * 5);
    const academic = subjectScore == null
      ? aggregateScore
      : clampScore(aggregateScore * 0.7 + subjectScore * 0.3);
    const fit = clampScore(academic * 0.8 + historicalFit * 0.2);
    gaps.push("This uses an institution-level admission aggregate, not a programme-specific cut-off.");
    if (!institutionProfile) gaps.push("Institution heritage and programme-achievement fields are not populated in the current record.");
    const category: MatchCategory = fit >= 80 ? "Strong Match" : fit >= 65 ? "Good Match" : fit >= 50 ? "Possible" : fit >= 35 ? "Reach" : "Low Match";
    return out(
      category,
      fit,
      `Your academic profile scores ${academic}% on the available WASSCE evidence. The institution record contains an aggregate reference of ${historicalAggregate}; this is a broad institutional signal, not a confirmed programme cut-off.`,
      "Institution-recorded historical aggregate",
      `Institution reference: ${historicalAggregate}`,
      "moderate",
      { academic, subject: subjectScore, institution: historicalFit },
    );
  }

  // No programme cut-off or estimate: calculate an academic-fit score from
  // the student's WASSCE aggregate and programme-specific subject achievement.
  let academic = aggregateScore;
  if (subjectScore != null) academic = clampScore(aggregateScore * 0.68 + subjectScore * 0.32);

  // Use institutional legacy/achievement only where the university record
  // actually contains it. Missing fields are omitted and called out, never guessed.
  const institutionScore = institutionProfile?.score ?? null;
  let fit = academic;
  if (institutionScore != null) fit = clampScore(academic * 0.9 + institutionScore * 0.1);

  const evidenceLevel: ReferenceMatch["evidenceLevel"] =
    subjectScore != null && institutionScore != null ? "moderate" :
    subjectScore != null || institutionScore != null ? "moderate" : "limited";

  const reasons = [
    `WASSCE aggregate ${aggregate} gives an academic baseline of ${aggregateScore}% on GhanaPathFinder's comparison scale.`,
  ];
  if (subjectScore != null) {
    if (reference.relevant_subjects?.length) {
      reasons.push("Your grades in the programme's recorded relevant subjects give a subject-achievement score of " + subjectScore + "%.");
    } else {
      reasons.push("Your recorded WASSCE subject grades give a general achievement score of " + subjectScore + "%; this is not yet programme-specific because subject mappings are missing from the catalogue.");
    }
  } else {
    gaps.push("No subject-grade details were supplied, so the subject-achievement component could not be scored.");
  }
  if (historicalAggregate == null) gaps.push("No stored institutional admission aggregate or historical programme cut-off is available for this record.");
  if (institutionProfile != null) {
    reasons.push(`Available institutional legacy/accreditation signals give a context score of ${institutionScore}%.`);
  } else {
    gaps.push("The institution's founding-year and programme-achievement fields are not populated, so those legacy signals were not included.");
  }
  if (!reference.subject_requirements && !(reference.relevant_subjects?.length)) {
    gaps.push("No programme-specific WASSCE subject requirements are recorded.");
  }

  const category: MatchCategory =
    fit >= 85 ? "Excellent Match" :
    fit >= 75 ? "Strong Match" :
    fit >= 65 ? "Good Match" :
    fit >= 50 ? "Possible" :
    fit >= 38 ? "Reach" :
    "Low Match";

  return out(
    category,
    fit,
    `${reasons.join(" ")} This is an estimated academic/institutional fit score, not a probability of admission.`,
    "Estimated academic fit (not admission probability)",
    `Estimated fit: ${fit}%`,
    evidenceLevel,
    { academic, subject: subjectScore, institution: institutionScore },
  );
}

/** Keep the shortlist broad: at most `perUniversity` programmes from any one institution. */
export function diversify<T extends { reference: AdmissionReference }>(
  matches: T[],
  perUniversity = 2,
  limit = 12,
): T[] {
  const seen = new Map<string, number>();
  const out: T[] = [];
  for (const m of matches) {
    const n = seen.get(m.reference.university_id) ?? 0;
    if (n >= perUniversity) continue;
    seen.set(m.reference.university_id, n + 1);
    out.push(m);
    if (out.length >= limit) break;
  }
  return out;
}
