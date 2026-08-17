/** Public-facing legal / transparency copy, shared by the homepage teasers and full pages. */


/** Current Terms & Conditions version recorded against a user's acceptance. */
export const TERMS_VERSION = "2026-08-17";

/** Short 4-line disclaimer shown on the Terms & Conditions page. */
export const SHORT_DISCLAIMER: string[] = [
  "GhanaPathFinder provides educational guidance and recommendations for informational purposes only.",
  "Admission requirements, cut-off points, scholarships and programme information may change.",
  "Always verify important information with the relevant university or official institution.",
  "GhanaPathFinder does not guarantee admission, scholarships, employment or any specific outcome.",
];

export const DISCLAIMER_SUMMARY =
  "GhanaPathFinder is an independent education and career guidance platform for students exploring Ghana universities, tertiary institutions, programmes, scholarships and career paths. University recommendations and WASSCE match confidence are estimates, not guarantees of admission. Cut-off points, admission requirements, programmes, scholarships, fees and deadlines may change. Always verify important information with the relevant official institution or regulatory body before applying. Estimated information is clearly labelled and should not be treated as official.";

export const DISCLAIMER_PARAGRAPHS: string[] = [
  "GhanaPathFinder is an independent education and career guidance platform designed to help students explore universities, programmes, scholarships, career paths, and educational opportunities in Ghana.",
  "The information provided on GhanaPathFinder is for general informational and guidance purposes only. While we make reasonable efforts to provide accurate and up-to-date information, admission requirements, WASSCE cut-off points, programmes, scholarship availability, application deadlines, fees, and other institutional information may change without notice.",
  "Match confidence and recommendations are estimates, not guarantees of admission. A recommendation does not mean that a student will be accepted into a university or programme. Admission decisions are made solely by the relevant institution according to its current admission policies and requirements.",
  "Where official cut-off points or other information are unavailable, GhanaPathFinder may provide estimated information based on available data. Such estimates should not be treated as official institutional requirements.",
  "Students should always verify important information, including admission requirements, deadlines, fees, programme availability, and application procedures, directly with the relevant university, institution, scholarship provider, or official government source before making decisions or submitting applications.",
  "GhanaPathFinder is not affiliated with, endorsed by, or officially representing any university, government institution, scholarship provider, or other organization unless explicitly stated.",
  "By using GhanaPathFinder, you acknowledge that you are responsible for independently verifying information before relying on it for educational or financial decisions.",
];

export const ABOUT_PARAGRAPHS: string[] = [
  "GhanaPathFinder is an education and career technology platform helping Ghanaian students discover universities, tertiary institutions, programmes, scholarships and career paths.",
  "Students can explore their options, compare programmes, understand admission requirements, use WASSCE-based recommendations, save opportunities and plan their next steps.",
  "Our mission is to connect students with reliable information and opportunities that help them make better education and career decisions.",
];

export const ABOUT_GOAL =
  "Connect students with reliable information and opportunities that help them make better education and career decisions.";

export const ABOUT_CLOSING =
  "GhanaPathFinder is continuously developing its database and improving its recommendations, user experience, and information sources.";

export const REFERENCES_PARAGRAPHS: string[] = [
  "GhanaPathFinder acknowledges the official universities, tertiary institutions, regulatory bodies, professional councils, scholarship providers and public information sources used to research and verify information presented on the platform.",
  "Information is sourced from official websites and authoritative sources wherever available. Each university, programme, admission requirement, scholarship and regulatory record should have its relevant source attached.",
  "Source information may change, so students should verify current requirements with the original source before applying.",
];

/** Public grouping of Ghanaian / foreign tertiary institutions used across the site. */
export const INSTITUTION_GROUPS = [
  "Traditional Universities",
  "Technical Universities",
  "Private Universities",
  "Other Accredited Institutions",
  "Foreign Universities",
  "Professional & Specialised Institutions",
] as const;

export type InstitutionGroup = (typeof INSTITUTION_GROUPS)[number];

const FOREIGN_CATEGORIES = ["Registered Foreign Institution", "Regional (West Africa) Institution"];
const PRIVATE_UNI_CATEGORIES = ["University", "University College", "Chartered Private Institution"];

/** Category/type combinations that make up each public group (used for DB filtering). */
export const groupFilter = (
  group: InstitutionGroup,
): { categories: string[]; type?: "Public" | "Private" } => {
  switch (group) {
    case "Traditional Universities":
      return { categories: ["University"], type: "Public" };
    case "Technical Universities":
      return { categories: ["Technical University", "Private Polytechnic"] };
    case "Private Universities":
      return { categories: PRIVATE_UNI_CATEGORIES, type: "Private" };
    case "Foreign Universities":
      return { categories: FOREIGN_CATEGORIES };
    case "Professional & Specialised Institutions":
      return { categories: ["Professional Institution"] };
    default:
      return {
        categories: [
          "College of Education",
          "Private College of Education",
          "College of Agriculture",
          "Nursing and Midwifery Training College",
          "Private Nurses Training College",
          "Health Training Institution",
          "Private Tertiary Institution",
          "Tutorial College",
          "Distance Learning Institution",
        ],
      };
  }
};

/** Which public group an institution row belongs to. */
export const institutionGroup = (
  category?: string | null,
  type?: string | null,
): InstitutionGroup => {
  const c = category ?? "";
  if (FOREIGN_CATEGORIES.includes(c)) return "Foreign Universities";
  if (c === "Technical University" || c === "Private Polytechnic") return "Technical Universities";
  if (c === "Professional Institution") return "Professional & Specialised Institutions";
  if (PRIVATE_UNI_CATEGORIES.includes(c)) {
    return type === "Private" ? "Private Universities" : "Traditional Universities";
  }
  return "Other Accredited Institutions";
};

/** Reference-page categories for the source directory. */
export const REFERENCE_GROUPS = [
  "Ghana Tertiary Education & Accreditation",
  "Universities & Tertiary Institutions",
  "Admissions & Requirements",
  "Programme Information",
  "Professional & Regulatory Bodies",
  "Scholarship & Funding Sources",
  "Other Verified Sources",
] as const;

export type ReferenceGroup = (typeof REFERENCE_GROUPS)[number];

export const referenceGroupFor = (sourceType?: string | null, usedFor?: string[]): ReferenceGroup => {
  const t = sourceType ?? "";
  if (t === "regulator" || t === "regulatory") return "Professional & Regulatory Bodies";
  if (t === "government") return "Ghana Tertiary Education & Accreditation";
  if (t === "scholarship_provider") return "Scholarship & Funding Sources";
  if (t === "admissions_portal") return "Admissions & Requirements";
  if (usedFor?.includes("Programme details")) return "Programme Information";
  if (t === "official_university" || t === "official_institution" || t === "institution")
    return "Universities & Tertiary Institutions";
  return "Other Verified Sources";
};

export const UNVERIFIED_NOTE = "Official information unavailable.";

/** Human labels for the raw source_type values stored in the database. */
export const SOURCE_TYPE_LABELS: Record<string, string> = {
  regulator: "Regulatory Body",
  regulatory: "Regulatory Body",
  institution: "Official University",
  institution_or_regulator: "Official Institution or Regulator",
  official_university: "Official University",
  official_institution: "Official Tertiary Institution",
  government: "Government Agency",
  scholarship_provider: "Scholarship Provider",
  admissions_portal: "Official Admissions Portal",
  public_database: "Public Database",
  other: "Other Verified Source",
};

export const sourceTypeLabel = (raw?: string | null) =>
  (raw && (SOURCE_TYPE_LABELS[raw] ?? raw.replace(/_/g, " "))) || "Other Verified Source";

export const formatVerified = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

/** Short, tappable label for an external URL (never a long raw URL). */
export const prettyHost = (url?: string | null) => {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};
