export interface Scholarship {
  name: string;
  provider: string;
  type: "Government" | "University" | "Private" | "International";
  coverage: string;
  level: string;
  eligibility: string;
  deadline: string;
  status: "Open" | "Closed" | "Recurring" | "Check current notice";
  howToApply: string;
  link?: string;
  lastVerified: string;
}

/**
 * Scholarship data reviewed against official provider pages on 11 September 2026.
 * Closed opportunities are retained so students can plan for the next cycle.
 */
export const scholarships: Scholarship[] = [
  {
    name: "Joint Algeria/Ghana Government Scholarship Awards 2026/2027",
    provider: "Ghana Scholarships Authority",
    type: "Government",
    coverage: "Government scholarship support; award terms depend on the official notice",
    level: "Undergraduate, vocational/technical and religious studies",
    eligibility: "Interested and qualified Ghanaian applicants meeting the published Algeria/Ghana award requirements.",
    deadline: "15 September 2026",
    status: "Open",
    howToApply: "Read the official Ghana Scholarships Authority notice and use the application route specified there. Do not rely on third-party application pages.",
    link: "https://scholarships.gov.gh/opportunities",
    lastVerified: "11 September 2026",
  },
  {
    name: "Presidential West African Scholarship Initiative (PWASI) 2026",
    provider: "Ghana Scholarships Authority",
    type: "Government",
    coverage: "See the official opportunity notice for the current award package",
    level: "West African scholarship opportunity",
    eligibility: "Applicants must meet the eligibility and documentation requirements in the published notice.",
    deadline: "See official notice",
    status: "Check current notice",
    howToApply: "Use the Ghana Scholarships Authority opportunities page and follow the current notice exactly.",
    link: "https://scholarships.gov.gh/opportunities",
    lastVerified: "11 September 2026",
  },
  {
    name: "Australian Awards Scholarship 2027",
    provider: "Australian Government / Ghana Scholarships Authority",
    type: "International",
    coverage: "See the current Australia Awards award package and Ghana-specific guidance",
    level: "Postgraduate",
    eligibility: "Ghanaian applicants meeting the current Australia Awards Ghana eligibility criteria.",
    deadline: "See current official call",
    status: "Check current notice",
    howToApply: "Start from the Ghana Scholarships Authority notice and the official Australia Awards application instructions.",
    link: "https://scholarships.gov.gh/opportunities",
    lastVerified: "11 September 2026",
  },
  {
    name: "2027 Learn Africa Programme",
    provider: "Learn Africa / Ghana Scholarships Authority",
    type: "International",
    coverage: "Programme-specific scholarship support",
    level: "African women; level varies by call",
    eligibility: "African women meeting the current programme requirements.",
    deadline: "See current official call",
    status: "Check current notice",
    howToApply: "Follow the current opportunity notice and the official Learn Africa application instructions.",
    link: "https://scholarships.gov.gh/opportunities",
    lastVerified: "11 September 2026",
  },
  {
    name: "MTN Ghana Foundation Bright Scholarship 2026",
    provider: "MTN Ghana Foundation",
    type: "Private",
    coverage: "Tuition, accommodation, stipend for books and a device for beneficiaries",
    level: "First-year or continuing undergraduate students at public tertiary institutions; vocational and technical training",
    eligibility: "Ghanaian, brilliant but needy applicants in good standing. Priority includes ICT, Computer Science, Engineering, Artificial Intelligence and Data Analytics; women and persons with disabilities are especially encouraged.",
    deadline: "31 May 2026",
    status: "Closed",
    howToApply: "Applications were submitted through the official MTN Ghana Foundation scholarship portal. The next cycle should be checked on the official portal rather than assumed to have the same dates.",
    link: "https://scholarship.mtn.com.gh/",
    lastVerified: "11 September 2026",
  },
  {
    name: "Chevening Scholarships 2027/2028",
    provider: "UK Government / Chevening",
    type: "International",
    coverage: "Fully funded one-year master's study in the UK, subject to the Chevening award terms",
    level: "Master's degree",
    eligibility: "Ghanaian applicants who meet Chevening's current eligibility and work-experience requirements.",
    deadline: "6 October 2026 at 11:00 UTC",
    status: "Open",
    howToApply: "Apply through the official Chevening Ghana page and complete the online application during the current window.",
    link: "https://www.chevening.org/scholarship/ghana/",
    lastVerified: "11 September 2026",
  },
  {
    name: "Mastercard Foundation Scholars Program at KNUST",
    provider: "KNUST / Mastercard Foundation",
    type: "International",
    coverage: "Scholar support package is programme-specific; see the KNUST Scholars Program for current terms",
    level: "Undergraduate and programme-specific opportunities",
    eligibility: "Academically talented but economically disadvantaged young people who meet the current KNUST programme criteria, with stated priority for females, displaced persons and persons with disabilities.",
    deadline: "Check current KNUST Scholars Program notice",
    status: "Check current notice",
    howToApply: "Use the official KNUST Mastercard Foundation Scholars Program website for the current application route and opening dates.",
    link: "https://mcf.knust.edu.gh/",
    lastVerified: "11 September 2026",
  },
  {
    name: "University of Ghana 2026/2027 UG Sponsorship / SRC Yi Bi Boa",
    provider: "University of Ghana Students Financial Aid Office",
    type: "University",
    coverage: "Financial support for eligible undergraduate students with demonstrated financial need; award terms vary by scheme",
    level: "Undergraduate at University of Ghana",
    eligibility: "Current UG students who meet the relevant financial-need, academic and scheme-specific requirements.",
    deadline: "2026/2027 call closed; see the SFAO for future or additional calls",
    status: "Closed",
    howToApply: "Use the University of Ghana Students Financial Aid Office and its official application route for each announced call.",
    link: "https://www.ug.edu.gh/financialaid/",
    lastVerified: "11 September 2026",
  },
  {
    name: "Student Loan Trust Fund (SLTF)",
    provider: "Students Loan Trust Fund",
    type: "Government",
    coverage: "Student financing; loan amount and disbursement depend on the current SLTF scheme",
    level: "Eligible tertiary students in Ghana",
    eligibility: "Ghanaian students admitted to an accredited tertiary programme and meeting the current SLTF requirements, including identity and student documentation.",
    deadline: "Application window varies by academic year; the official portal currently shows the application as closed",
    status: "Closed",
    howToApply: "Use the official SLTF application system when the next application window opens. Confirm current requirements before applying.",
    link: "https://application.sltf.gov.gh/",
    lastVerified: "11 September 2026",
  },
  {
    name: "Ashesi Financial Aid",
    provider: "Ashesi University",
    type: "University",
    coverage: "Financial aid package determined through Ashesi's current financial-aid process",
    level: "Undergraduate",
    eligibility: "Applicants and students who meet Ashesi's current admission and financial-aid criteria.",
    deadline: "Check the current Ashesi admissions and financial-aid cycle",
    status: "Check current notice",
    howToApply: "Apply for admission and follow Ashesi's current financial-aid instructions on the official university website.",
    link: "https://www.ashesi.edu.gh/admissions/financial-aid",
    lastVerified: "11 September 2026",
  },
];

export const scholarshipTips = [
  "Keep one verified application folder with your WASSCE results, admission documents and other commonly requested records.",
  "Check the official provider page immediately before applying. Deadlines and eligibility can change between cycles.",
  "Never assume a scholarship is open because it appeared on an old list. GhanaPathFinder labels closed and recurring opportunities separately.",
  "Write a strong core personal statement, then adapt it to each scholarship's actual questions and eligibility criteria.",
  "Never pay an unofficial person to 'secure' a scholarship. Use the provider's official application route and published contacts.",
];

export const scholarshipSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const scholarshipBySlug = (slug: string) =>
  scholarships.find((s) => scholarshipSlug(s.name) === slug);
