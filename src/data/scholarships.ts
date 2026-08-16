export interface Scholarship {
  name: string;
  provider: string;
  type: "Government" | "University" | "Private" | "International";
  coverage: string;
  level: string;
  eligibility: string;
  deadline: string;
  howToApply: string;
  link?: string;
}

export const scholarships: Scholarship[] = [
  {
    name: "Ghana Scholarships Secretariat Award",
    provider: "Government of Ghana",
    type: "Government",
    coverage: "Full or partial tuition + academic user fees",
    level: "Undergraduate (local)",
    eligibility:
      "Ghanaian students with admission to an accredited public university. Priority to needy-but-brilliant applicants and underserved districts.",
    deadline: "Usually announced August – October each year",
    howToApply:
      "Register on the Scholarships Secretariat online portal, upload admission letter, WASSCE results, Ghana Card and a district endorsement letter.",
    link: "https://www.scholarshipgh.gov.gh",
  },
  {
    name: "GETFund Scholarship",
    provider: "Ghana Education Trust Fund",
    type: "Government",
    coverage: "Tuition and part of accommodation",
    level: "Undergraduate & Postgraduate",
    eligibility:
      "Ghanaian students in accredited institutions, strong academic record and demonstrated financial need.",
    deadline: "Rolling — advertised in national dailies",
    howToApply:
      "Apply through your institution's scholarship/financial aid office with admission letter and proof of need.",
  },
  {
    name: "Ashesi Full Scholarship",
    provider: "Ashesi University Foundation",
    type: "University",
    coverage: "Up to 100% tuition, housing and stipend",
    level: "Undergraduate",
    eligibility:
      "Outstanding WASSCE results (typically aggregate 6–12), demonstrated leadership and verified financial need.",
    deadline: "Early round November; regular round February",
    howToApply:
      "Apply for admission to Ashesi and tick the financial aid option — submit the family financial statement with supporting documents.",
    link: "https://www.ashesi.edu.gh/admissions/financial-aid",
  },
  {
    name: "MasterCard Foundation Scholars Program",
    provider: "MasterCard Foundation (KNUST & Ashesi)",
    type: "International",
    coverage: "Full tuition, accommodation, books, laptop, stipend",
    level: "Undergraduate",
    eligibility:
      "Academically talented young Africans from economically disadvantaged backgrounds with a record of giving back.",
    deadline: "Typically January – March",
    howToApply:
      "Apply through the partner university's Scholars Program portal (KNUST or Ashesi) alongside your admission application.",
    link: "https://mastercardfdn.org/en/what-we-do/our-programs/mastercard-foundation-scholars-program/",
  },
  {
    name: "KNUST Vice-Chancellor's Scholarship",
    provider: "KNUST",
    type: "University",
    coverage: "Tuition waiver, sometimes hall accommodation",
    level: "Undergraduate",
    eligibility:
      "Continuing KNUST students with excellent CWA or first-year students with exceptional WASSCE aggregates.",
    deadline: "Start of each academic year",
    howToApply:
      "Submit an application to the KNUST Students' Financial Services Office with transcripts and a financial-need statement.",
  },
  {
    name: "University of Ghana Financial Aid",
    provider: "University of Ghana, Legon",
    type: "University",
    coverage: "Partial tuition, work-study placements, book allowance",
    level: "Undergraduate",
    eligibility:
      "Admitted or continuing UG students with verified financial need and satisfactory academic standing.",
    deadline: "Within the first weeks of each semester",
    howToApply:
      "Complete the UG Students Financial Aid Office (SFAO) form and attach income evidence and a guarantor letter.",
    link: "https://www.ug.edu.gh",
  },
  {
    name: "Student Loan Trust Fund (SLTF)",
    provider: "SLTF Ghana",
    type: "Government",
    coverage: "No-guarantor loan disbursed each semester",
    level: "Tertiary (all accredited institutions)",
    eligibility:
      "Ghanaian students with a valid Ghana Card, SSNIT-linked details and admission to an accredited tertiary institution.",
    deadline: "Opens shortly after admissions each academic year",
    howToApply:
      "Apply on the SLTF no-guarantor portal using your Ghana Card and student ID; repayment starts after national service.",
    link: "https://www.sltf.gov.gh",
  },
  {
    name: "MTN Ghana Foundation Bright Scholarship",
    provider: "MTN Ghana Foundation",
    type: "Private",
    coverage: "Tuition, books and a monthly upkeep allowance",
    level: "Undergraduate (Levels 100–200)",
    eligibility:
      "Brilliant but needy students in public universities, especially STEM and ICT-related programmes.",
    deadline: "Usually advertised around March – May",
    howToApply:
      "Apply online through the MTN Ghana Foundation scholarship portal with transcripts and proof of need.",
  },
  {
    name: "Tullow Group Scholarship Scheme",
    provider: "Tullow Oil",
    type: "Private",
    coverage: "Full postgraduate tuition abroad + travel + living costs",
    level: "Master's degree",
    eligibility:
      "Ghanaian graduates with work experience in engineering, geosciences, law, finance or related fields.",
    deadline: "Applications typically close in October",
    howToApply:
      "Apply on the Tullow Group Scholarship Scheme website with degree certificates, references and a study proposal.",
  },
  {
    name: "Chevening Scholarship",
    provider: "UK Government (FCDO)",
    type: "International",
    coverage: "Full master's tuition in the UK, flights and living stipend",
    level: "Master's degree",
    eligibility:
      "Ghanaian graduates with 2+ years work experience, leadership potential and UK university offers.",
    deadline: "August – early November each year",
    howToApply:
      "Apply on the Chevening portal, submit four essays, two references and unconditional UK offer by the deadline.",
    link: "https://www.chevening.org",
  },
  {
    name: "DAAD Scholarships for Africa",
    provider: "German Academic Exchange Service",
    type: "International",
    coverage: "Monthly stipend, tuition, travel and health insurance",
    level: "Master's & PhD",
    eligibility:
      "Graduates with strong academic records seeking development-related study in Germany or partner African institutions.",
    deadline: "Varies by programme, mostly July – October",
    howToApply:
      "Apply through the DAAD portal for a listed development-related course with CV, transcripts and motivation letter.",
    link: "https://www.daad.de",
  },
  {
    name: "Mandela Rhodes Scholarship",
    provider: "Mandela Rhodes Foundation",
    type: "International",
    coverage: "Full postgraduate study in South Africa + leadership programme",
    level: "Postgraduate",
    eligibility:
      "African citizens under 30 with excellent academic results and a demonstrated commitment to leadership and reconciliation.",
    deadline: "Applications close mid-year (around April)",
    howToApply:
      "Complete the online application with academic transcripts, references and essays on leadership and entrepreneurship.",
    link: "https://www.mandelarhodes.org",
  },
];

export const scholarshipTips = [
  "Start a folder now with your Ghana Card, WASSCE results slip, admission letter and passport photos — most applications ask for the same documents.",
  "Apply to at least five scholarships. Even full-tuition awards get fewer applicants than you'd expect because students assume they won't win.",
  "Write one strong personal statement about your goals and adapt it per application instead of starting from scratch each time.",
  "Ask a teacher for a reference letter early — a rushed reference is the most common reason strong applications get weakened.",
  "Never pay a 'processing fee' to anyone promising a scholarship. Legitimate schemes in Ghana are free to apply for.",
];

export const scholarshipSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const scholarshipBySlug = (slug: string) =>
  scholarships.find((s) => scholarshipSlug(s.name) === slug);
