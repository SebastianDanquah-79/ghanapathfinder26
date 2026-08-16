/**
 * Professional councils and regulators used as reference sources by GhanaPathFinder.
 * Only bodies whose official website was checked and reachable are listed here —
 * nothing on this list is invented. Where a body's official site could not be
 * reached at verification time, `website` is null and the UI shows
 * "Official information unavailable." instead of a fabricated link.
 */
export interface ProfessionalBody {
  name: string;
  /** Official website, or null when it could not be verified. */
  website: string | null;
  /** Areas of study / careers this body regulates in Ghana. */
  regulates: string[];
  /** Month/year the link was last checked. */
  lastVerified: string;
}

export const PROFESSIONAL_BODIES: ProfessionalBody[] = [
  {
    name: "Ghana Tertiary Education Commission (GTEC)",
    website: "https://gtec.edu.gh/",
    regulates: ["Tertiary institution accreditation", "Programme accreditation"],
    lastVerified: "August 2026",
  },
  {
    name: "Nursing and Midwifery Council of Ghana",
    website: "https://www.nmc.gov.gh/",
    regulates: ["Nursing", "Midwifery", "Nurse assistant training"],
    lastVerified: "August 2026",
  },
  {
    name: "Medical and Dental Council, Ghana",
    website: "https://www.mdcghana.org/",
    regulates: ["Medicine", "Dentistry", "Physician assistantship"],
    lastVerified: "August 2026",
  },
  {
    name: "Allied Health Professions Council, Ghana",
    website: "https://ahpcghana.org/",
    regulates: ["Medical laboratory science", "Physiotherapy", "Radiography", "Other allied health"],
    lastVerified: "August 2026",
  },
  {
    name: "National Teaching Council (NTC)",
    website: "https://ntc.gov.gh/",
    regulates: ["Teaching", "Colleges of Education programmes"],
    lastVerified: "August 2026",
  },
  {
    name: "Pharmacy Council of Ghana",
    website: null,
    regulates: ["Pharmacy", "Pharmacy technician training"],
    lastVerified: "August 2026",
  },
  {
    name: "General Legal Council of Ghana",
    website: null,
    regulates: ["Professional law training"],
    lastVerified: "August 2026",
  },
];

/** Official funding / scholarship reference sources that were checked directly. */
export const FUNDING_SOURCES = [
  {
    name: "Ghana Scholarships Secretariat",
    website: "https://www.scholarships.gov.gh/",
    note: "Government-funded scholarships for Ghanaian students",
    lastVerified: "August 2026",
  },
];

/** Accreditation reference links. */
export const ACCREDITATION_SOURCES = [
  {
    name: "Ghana Tertiary Education Commission (GTEC)",
    website: "https://gtec.edu.gh/",
    note: "Regulator of tertiary education in Ghana",
    lastVerified: "August 2026",
  },
  {
    name: "GTEC — Explore accredited institutions",
    website: "https://gtec.edu.gh/explore-institutions/",
    note: "Institution and accreditation verification",
    lastVerified: "August 2026",
  },
];
