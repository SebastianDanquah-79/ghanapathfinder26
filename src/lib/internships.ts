/**
 * Helpers for the internship & employer directory.
 *
 * Qualification and application guidance below is written by GhanaPathFinder
 * from publicly documented Ghanaian recruitment practice (industrial
 * attachment, national service, graduate trainee schemes). Always confirm the
 * exact requirements on the employer's own page , see /credits.
 */
import { EMPLOYERS, type Employer, type OpportunityType } from "@/data/employers";

export const employerById = (id: string): Employer | undefined =>
  EMPLOYERS.find((e) => e.id === id);

/** Generic, honest qualification guidance per opportunity type. */
const QUALIFICATIONS: Record<OpportunityType, string[]> = {
  Internship: [
    "Currently enrolled in a tertiary programme (usually from year 2 onward)",
    "An introductory or attachment letter from your department",
    "A one-page CV and a short cover letter stating your availability dates",
    "Basic digital skills , email, spreadsheets and document writing",
  ],
  Attachment: [
    "Formal industrial attachment letter from your institution",
    "Proof of student status (student ID or admission letter)",
    "Availability for the full attachment period, usually 6-12 weeks",
    "Insurance or indemnity forms where the employer requires them",
  ],
  "Graduate programme": [
    "A completed first degree, often with a minimum Second Class Lower or better",
    "Completed or ongoing national service (many schemes require it)",
    "Aptitude test and interview performance",
    "Evidence of leadership, projects or extracurricular impact",
  ],
  "National service": [
    "NSS registration and an official posting or acceptance letter",
    "Completed degree or diploma from an accredited Ghanaian institution",
    "Valid Ghana Card and NSS number",
    "Department clearance for the posting period",
  ],
  Volunteer: [
    "Genuine interest in the organisation's mission",
    "Flexible weekly availability agreed in advance",
    "A short statement of motivation",
    "References from school, church or a previous placement help",
  ],
  "Entry-level roles": [
    "Degree, HND or diploma in a related field",
    "0-2 years of experience, including internships and projects",
    "A tailored CV showing measurable results",
    "Ghana Card and other standard right-to-work documents",
  ],
};

export const qualificationsFor = (employer: Employer): string[] => {
  const seen = new Set<string>();
  for (const type of employer.opportunities) {
    for (const q of QUALIFICATIONS[type] ?? []) seen.add(q);
  }
  return Array.from(seen);
};

export const applyStepsFor = (employer: Employer): string[] => [
  `Open ${employer.name}'s official careers page and read the current openings , nothing on GhanaPathFinder is an application.`,
  "Prepare a one-page CV tailored to the role, plus a short cover letter naming the team or department.",
  employer.opportunities.includes("Attachment") || employer.opportunities.includes("Internship")
    ? "Collect your introductory / attachment letter from your department and scan it as a PDF."
    : "Collect your degree or NSS documents and scan them as PDFs.",
  "Apply through the employer's own portal or the email address published on that page.",
  "Follow up politely after two weeks, and keep a record of the date you applied.",
];

export interface ChecklistItem {
  id: string;
  label: string;
}

export const checklistFor = (employer: Employer): ChecklistItem[] => [
  { id: "research", label: `Read about ${employer.name} and what its teams actually do` },
  { id: "cv", label: "Update my CV to one page, tailored to this employer" },
  { id: "letter", label: "Write a short, specific cover letter" },
  { id: "docs", label: "Scan my school / NSS / ID documents as PDFs" },
  { id: "referee", label: "Ask a lecturer or supervisor to be a referee" },
  { id: "apply", label: "Submit the application on the official page" },
  { id: "calendar", label: "Add a reminder for the deadline or follow-up date" },
  { id: "followup", label: "Follow up after two weeks" },
];

const pad = (n: number) => String(n).padStart(2, "0");
const stamp = (d: Date) =>
  `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
    d.getUTCMinutes(),
  )}00Z`;

/** Builds a calendar (.ics) reminder for an employer application. */
export const buildReminderIcs = (employer: Employer, date: Date): string => {
  const end = new Date(date.getTime() + 30 * 60 * 1000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GhanaPathFinder//Internships//EN",
    "BEGIN:VEVENT",
    `UID:${employer.id}-${date.getTime()}@ghanapathfinder.com`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(date)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:Apply to ${employer.name} (${employer.opportunities[0] ?? "opportunity"})`,
    `DESCRIPTION:Official page: ${employer.url}\\nChecklist: https://ghanapathfinder.com/internships/${employer.id}`,
    `URL:${employer.url}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Application reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
};

export const downloadIcs = (employer: Employer, date: Date) => {
  const blob = new Blob([buildReminderIcs(employer, date)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${employer.id}-reminder.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

export interface FitResult {
  employer: Employer;
  score: number;
  reasons: string[];
}

/**
 * Ranks employers for a career path using the student's own signals.
 * Explanatory only , it never promises a placement.
 */
export const rankEmployers = (
  major: string,
  opts: {
    aggregate?: number | null;
    subjects?: string[];
    region?: string | null;
    programme?: string | null;
    interests?: string[];
  } = {},
): FitResult[] => {
  const { aggregate, subjects = [], region, programme, interests = [] } = opts;
  const lower = (s: string) => s.toLowerCase();

  return EMPLOYERS.map((employer) => {
    const reasons: string[] = [];
    let score = 0;

    if (employer.majors.includes(major)) {
      score += 5;
      reasons.push(`Hires students from ${major}`);
    }

    const hay = lower([employer.name, employer.about, employer.sector, ...employer.majors].join(" "));

    if (programme && hay.includes(lower(programme).split(" ")[0] ?? "")) {
      score += 3;
      reasons.push(`Linked to your programme (${programme})`);
    }
    for (const i of interests) {
      if (i && hay.includes(lower(i))) {
        score += 1;
        reasons.push(`Matches your interest in ${i}`);
        break;
      }
    }
    if (region && employer.locations.some((l) => lower(l).includes(lower(region)))) {
      score += 2;
      reasons.push(`Has openings in ${region}`);
    }
    const subjectHit = subjects.find((s) => hay.includes(lower(s).split(" ")[0] ?? ""));
    if (subjectHit) {
      score += 1;
      reasons.push(`Uses skills from your ${subjectHit} background`);
    }
    if (employer.opportunities.includes("Internship") || employer.opportunities.includes("Attachment")) {
      score += 1;
      if (typeof aggregate === "number" && aggregate <= 12) {
        score += 1;
        reasons.push(`Competitive schemes suit your aggregate of ${aggregate}`);
      } else if (typeof aggregate === "number") {
        reasons.push("Open to attachment students regardless of aggregate");
      }
    }

    return { employer, score, reasons: Array.from(new Set(reasons)).slice(0, 3) };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
};
