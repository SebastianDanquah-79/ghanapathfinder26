/** Public-facing legal / transparency copy, shared by the homepage teasers and full pages. */

export const DISCLAIMER_SUMMARY =
  "GhanaPathFinder is an independent guidance platform. Information, match confidence and estimated cut-off points are guidance only — not guarantees of admission. Always verify requirements, deadlines and fees directly with the institution or provider.";

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
  "GhanaPathFinder is an education and career technology platform designed to help students in Ghana make more informed decisions about their future.",
  "GhanaPathFinder brings university discovery, programme exploration, career paths, scholarships, funding opportunities, WASSCE-based recommendations, and application planning into one platform.",
  "Students can explore universities and programmes, understand potential career opportunities, discover scholarships, save opportunities, and receive personalized recommendations based on their academic information.",
];

export const ABOUT_GOAL =
  "Connect students to the information and opportunities they need to make clearer decisions about education and their future careers.";

export const ABOUT_CLOSING =
  "GhanaPathFinder is continuously developing its database and improving its recommendations, user experience, and information sources.";

export const REFERENCES_PARAGRAPHS: string[] = [
  "GhanaPathFinder acknowledges the universities, tertiary institutions, government agencies, regulators, scholarship providers, official websites, public databases, and other information sources that provide information used to develop and maintain the platform.",
  "Where appropriate, GhanaPathFinder uses official institutional and regulatory sources to verify information about institutions, programmes, admissions, accreditation, scholarships, and other educational opportunities.",
  "Important information should always be verified with the original source because requirements and information can change.",
];

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
