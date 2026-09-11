/**
 * Professional councils and authoritative education regulators referenced by GhanaPathFinder.
 * Verification date: 11 September 2026.
 * These links are reference points; users should still confirm programme-specific rules with the regulator.
 */
export interface ProfessionalBody {
  name: string;
  website: string | null;
  regulates: string[];
  lastVerified: string;
}

export const PROFESSIONAL_BODIES: ProfessionalBody[] = [
  {
    name: "Ghana Tertiary Education Commission (GTEC)",
    website: "https://gtec.edu.gh/",
    regulates: ["Tertiary institution accreditation", "Programme accreditation"],
    lastVerified: "11 September 2026",
  },
  {
    name: "Nursing and Midwifery Council of Ghana",
    website: "https://www.nmc.gov.gh/",
    regulates: ["Nursing", "Midwifery", "Nurse assistant training"],
    lastVerified: "11 September 2026",
  },
  {
    name: "Medical and Dental Council, Ghana",
    website: "https://www.mdcghana.org/",
    regulates: ["Medicine", "Dentistry", "Physician assistantship"],
    lastVerified: "11 September 2026",
  },
  {
    name: "Allied Health Professions Council, Ghana",
    website: "https://ahpcghana.org/",
    regulates: ["Medical laboratory science", "Physiotherapy", "Radiography", "Other allied health"],
    lastVerified: "11 September 2026",
  },
  {
    name: "National Teaching Council (NTC)",
    website: "https://ntc.gov.gh/",
    regulates: ["Teaching", "Teacher licensing", "Professional teacher development"],
    lastVerified: "11 September 2026",
  },
  {
    name: "Pharmacy Council of Ghana",
    website: "https://pcghana.org/",
    regulates: ["Pharmacy", "Pharmacy technician training", "Pharmacy facilities"],
    lastVerified: "11 September 2026",
  },
  {
    name: "General Legal Council of Ghana",
    website: "https://www.glc.gov.gh/",
    regulates: ["Professional legal education", "Legal profession"],
    lastVerified: "11 September 2026",
  },
];

export const FUNDING_SOURCES = [
  {
    name: "Ghana Scholarships Authority",
    website: "https://scholarships.gov.gh/",
    note: "Official government scholarship announcements and application guidance",
    lastVerified: "11 September 2026",
  },
  {
    name: "Students Loan Trust Fund (SLTF)",
    website: "https://www.sltf.gov.gh/",
    note: "Official student financing information and loan application guidance",
    lastVerified: "11 September 2026",
  },
];

export const ACCREDITATION_SOURCES = [
  {
    name: "Ghana Tertiary Education Commission (GTEC)",
    website: "https://gtec.edu.gh/",
    note: "National tertiary education regulator and accreditation reference",
    lastVerified: "11 September 2026",
  },
  {
    name: "GTEC: Explore accredited institutions",
    website: "https://gtec.edu.gh/explore-institutions/",
    note: "Current institution categories and accreditation reference",
    lastVerified: "11 September 2026",
  },
  {
    name: "GTEC: Unrecognised institutions notice",
    website: "https://gtec.edu.gh/unrecognized-institutions-by-gtec/",
    note: "Public warning list; check before relying on an institution or qualification",
    lastVerified: "11 September 2026",
  },
];
