/**
 * GhanaPathFinder employer & internship directory.
 *
 * Every organisation listed here operates in Ghana and publishes its own
 * careers, internship or national-service information. Links point to the
 * organisation's official page (or its official careers portal) so students
 * always apply through the source. Descriptions are written in
 * GhanaPathFinder's own words , see /credits for the acknowledgement list.
 *
 * Programmes and deadlines change every year: always confirm on the official
 * page before applying.
 */

export type Sector =
  | "Technology"
  | "Banking & Finance"
  | "Telecom"
  | "Energy & Mining"
  | "Health"
  | "Agriculture & Agribusiness"
  | "Manufacturing & FMCG"
  | "Consulting & Audit"
  | "Media & Creative"
  | "Public sector"
  | "Development & NGO"
  | "Legal";

export type OpportunityType =
  | "Internship"
  | "Graduate programme"
  | "National service"
  | "Attachment"
  | "Volunteer"
  | "Entry-level roles";

export interface Employer {
  id: string;
  name: string;
  sector: Sector;
  locations: string[];
  about: string;
  /** What students can realistically apply for. */
  opportunities: OpportunityType[];
  /** When applications usually open , confirm on the official page. */
  timing: string;
  /** Official careers or internship page. */
  url: string;
  /** Career majors this employer is most relevant to. */
  majors: string[];
}

export const EMPLOYERS: Employer[] = [
  {
    id: "mtn-ghana",
    name: "MTN Ghana",
    sector: "Telecom",
    locations: ["Greater Accra", "Ashanti", "Nationwide"],
    about:
      "Ghana's largest mobile network, with work spanning network engineering, mobile money, data analytics, marketing and customer experience.",
    opportunities: ["Internship", "Graduate programme", "National service"],
    timing: "Internships usually advertised around the long vacation; graduate roles posted on the careers portal.",
    url: "https://www.mtn.com.gh/careers/",
    majors: ["Computer Science", "Engineering", "Marketing", "Business", "Data Science & Statistics", "Banking & Finance", "Human Resource Management"],
  },
  {
    id: "vodafone-telecel",
    name: "Telecel Ghana",
    sector: "Telecom",
    locations: ["Greater Accra"],
    about:
      "Telecom operator (formerly Vodafone Ghana) with roles in networks, digital products, retail operations and corporate functions.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Posted on the careers page through the year.",
    url: "https://www.telecel.com.gh/careers",
    majors: ["Computer Science", "Engineering", "Marketing", "Business", "Human Resource Management"],
  },
  {
    id: "ecobank",
    name: "Ecobank Ghana",
    sector: "Banking & Finance",
    locations: ["Greater Accra", "Nationwide"],
    about:
      "Pan-African bank with branch banking, treasury, risk, technology and corporate banking functions in Ghana.",
    opportunities: ["Internship", "Graduate programme", "National service"],
    timing: "Graduate intake typically advertised once a year.",
    url: "https://ecobank.com/gh/personal-banking",
    majors: ["Banking & Finance", "Accounting", "Economics", "Business", "Computer Science"],
  },
  {
    id: "gcb-bank",
    name: "GCB Bank PLC",
    sector: "Banking & Finance",
    locations: ["Nationwide"],
    about: "Ghana's largest indigenous bank, with the widest branch network in the country.",
    opportunities: ["Internship", "National service", "Entry-level roles"],
    timing: "Attachment and service placements requested through the bank's HR portal.",
    url: "https://www.gcbbank.com.gh/careers",
    majors: ["Banking & Finance", "Accounting", "Economics", "Business", "Human Resource Management"],
  },
  {
    id: "stanbic",
    name: "Stanbic Bank Ghana",
    sector: "Banking & Finance",
    locations: ["Greater Accra", "Ashanti"],
    about: "Corporate and personal bank, part of Standard Bank Group, with a structured graduate trainee track.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Graduate trainee applications usually open early in the year.",
    url: "https://www.stanbicbank.com.gh/ghana/careers",
    majors: ["Banking & Finance", "Accounting", "Economics", "Business", "Data Science & Statistics"],
  },
  {
    id: "absa",
    name: "Absa Bank Ghana",
    sector: "Banking & Finance",
    locations: ["Greater Accra"],
    about: "Retail and corporate bank with graduate and internship pipelines across banking, risk and technology.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Advertised on the group careers site.",
    url: "https://www.absa.com.gh/about-us/careers/",
    majors: ["Banking & Finance", "Accounting", "Economics", "Business", "Computer Science"],
  },
  {
    id: "bank-of-ghana",
    name: "Bank of Ghana",
    sector: "Public sector",
    locations: ["Greater Accra"],
    about: "The central bank , research, monetary policy, banking supervision, currency and payment systems.",
    opportunities: ["Internship", "National service"],
    timing: "Student attachment requests are made in writing to the Bank.",
    url: "https://www.bog.gov.gh/careers/",
    majors: ["Economics", "Banking & Finance", "Accounting", "Data Science & Statistics", "Law"],
  },
  {
    id: "deloitte-gh",
    name: "Deloitte Ghana",
    sector: "Consulting & Audit",
    locations: ["Greater Accra"],
    about: "Audit, tax, risk and consulting practice serving Ghanaian and multinational clients.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Graduate recruitment usually runs in the first half of the year.",
    url: "https://www.deloitte.com/gh/en/careers.html",
    majors: ["Accounting", "Banking & Finance", "Economics", "Business", "Computer Science", "Law"],
  },
  {
    id: "pwc-gh",
    name: "PwC Ghana",
    sector: "Consulting & Audit",
    locations: ["Greater Accra", "Western"],
    about: "Assurance, tax and advisory firm with a formal student internship and graduate scheme.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Watch the Ghana careers page for the annual intake.",
    url: "https://www.pwc.com/gh/en/careers.html",
    majors: ["Accounting", "Banking & Finance", "Economics", "Business", "Data Science & Statistics"],
  },
  {
    id: "kpmg-gh",
    name: "KPMG Ghana",
    sector: "Consulting & Audit",
    locations: ["Greater Accra"],
    about: "Audit, tax and advisory firm; strong route into professional accounting qualification.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Annual graduate recruitment advertised on the careers page.",
    url: "https://kpmg.com/gh/en/careers.html",
    majors: ["Accounting", "Banking & Finance", "Business", "Economics"],
  },
  {
    id: "ey-gh",
    name: "EY Ghana",
    sector: "Consulting & Audit",
    locations: ["Greater Accra"],
    about: "Professional services firm covering assurance, consulting, strategy, tax and transactions.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Student programmes listed on the global EY careers portal.",
    url: "https://www.ey.com/en_gh/careers",
    majors: ["Accounting", "Banking & Finance", "Business", "Economics", "Computer Science"],
  },
  {
    id: "hubtel",
    name: "Hubtel",
    sector: "Technology",
    locations: ["Greater Accra"],
    about: "Ghanaian software company building payments, commerce and messaging platforms used by major local businesses.",
    opportunities: ["Internship", "Entry-level roles", "National service"],
    timing: "Engineering intakes announced on the company's careers page and social channels.",
    url: "https://hubtel.com/careers/",
    majors: ["Computer Science", "Data Science & Statistics", "Engineering", "Marketing"],
  },
  {
    id: "expresspay",
    name: "expressPay",
    sector: "Technology",
    locations: ["Greater Accra"],
    about: "Digital payments company powering bill payments, transfers and merchant checkout in Ghana.",
    opportunities: ["Internship", "Entry-level roles"],
    timing: "Roles posted as teams grow.",
    url: "https://expresspaygh.com/",
    majors: ["Computer Science", "Banking & Finance", "Marketing", "Business"],
  },
  {
    id: "mest",
    name: "MEST Africa",
    sector: "Technology",
    locations: ["Greater Accra"],
    about:
      "Training programme and incubator for African software entrepreneurs; a fully-funded year of software, business and communication training.",
    opportunities: ["Graduate programme"],
    timing: "Applications for the training programme open annually.",
    url: "https://meltwater.org/",
    majors: ["Computer Science", "Business", "Marketing", "Data Science & Statistics"],
  },
  {
    id: "turntabl",
    name: "Turntabl",
    sector: "Technology",
    locations: ["Greater Accra"],
    about: "Accra-based software engineering firm placing Ghanaian developers on international client teams.",
    opportunities: ["Internship", "Graduate programme", "Entry-level roles"],
    timing: "Trainee developer cohorts advertised through the year.",
    url: "https://turntabl.io/",
    majors: ["Computer Science", "Data Science & Statistics", "Engineering"],
  },
  {
    id: "amalitech",
    name: "AmaliTech Ghana",
    sector: "Technology",
    locations: ["Greater Accra", "Western"],
    about: "Social enterprise offering free tech training and then employment on international software and data projects.",
    opportunities: ["Graduate programme", "Internship"],
    timing: "Training academy cohorts open several times a year.",
    url: "https://amalitech.org/",
    majors: ["Computer Science", "Data Science & Statistics", "Engineering"],
  },
  {
    id: "korle-bu",
    name: "Korle Bu Teaching Hospital",
    sector: "Health",
    locations: ["Greater Accra"],
    about: "Ghana's largest teaching hospital and the main clinical training site for many health programmes.",
    opportunities: ["Attachment", "National service", "Internship"],
    timing: "Clinical placements are arranged through your school; internships follow national health service timelines.",
    url: "https://kbth.gov.gh/",
    majors: ["Medicine", "Nursing", "Pharmacy", "Public Health", "Psychology"],
  },
  {
    id: "komfo-anokye",
    name: "Komfo Anokye Teaching Hospital",
    sector: "Health",
    locations: ["Ashanti"],
    about: "Major teaching hospital in Kumasi, training ground for KNUST and regional health students.",
    opportunities: ["Attachment", "National service", "Internship"],
    timing: "Placement letters routed through your institution.",
    url: "https://kathhsp.org/",
    majors: ["Medicine", "Nursing", "Pharmacy", "Public Health"],
  },
  {
    id: "ghs",
    name: "Ghana Health Service",
    sector: "Health",
    locations: ["Nationwide"],
    about: "Runs district hospitals, health centres and public health programmes across every region.",
    opportunities: ["Attachment", "National service", "Entry-level roles"],
    timing: "Postings and recruitment announced through the Service.",
    url: "https://ghs.gov.gh/",
    majors: ["Nursing", "Public Health", "Medicine", "Pharmacy", "Environmental Science"],
  },
  {
    id: "noguchi",
    name: "Noguchi Memorial Institute for Medical Research",
    sector: "Health",
    locations: ["Greater Accra"],
    about: "University of Ghana biomedical research institute working on infectious disease, diagnostics and public health.",
    opportunities: ["Internship", "Attachment", "National service"],
    timing: "Research attachments arranged with individual departments.",
    url: "https://www.noguchimedres.org/",
    majors: ["Public Health", "Medicine", "Pharmacy", "Environmental Science", "Data Science & Statistics"],
  },
  {
    id: "tullow",
    name: "Tullow Ghana",
    sector: "Energy & Mining",
    locations: ["Western", "Greater Accra"],
    about: "Offshore oil producer with engineering, geoscience, HSE and commercial functions in Ghana.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Graduate and internship intakes announced on the careers site.",
    url: "https://www.tullowoil.com/careers/",
    majors: ["Engineering", "Environmental Science", "Economics", "Accounting", "Business"],
  },
  {
    id: "gnpc",
    name: "Ghana National Petroleum Corporation (GNPC)",
    sector: "Energy & Mining",
    locations: ["Greater Accra", "Western"],
    about: "State petroleum corporation covering exploration, production and local content development.",
    opportunities: ["Internship", "National service"],
    timing: "Student attachments requested ahead of the long vacation.",
    url: "https://gnpcghana.com/",
    majors: ["Engineering", "Economics", "Environmental Science", "Law", "Accounting"],
  },
  {
    id: "goldfields",
    name: "Gold Fields Ghana",
    sector: "Energy & Mining",
    locations: ["Western", "Ashanti"],
    about: "Large-scale gold mining operations with engineering, geology, environment and community relations teams.",
    opportunities: ["Internship", "Graduate programme", "Attachment"],
    timing: "Vacation attachment applications typically close months before the vacation.",
    url: "https://www.goldfields.com/careers.php",
    majors: ["Engineering", "Environmental Science", "Accounting", "Human Resource Management"],
  },
  {
    id: "newmont",
    name: "Newmont Africa (Ghana)",
    sector: "Energy & Mining",
    locations: ["Ahafo", "Eastern", "Greater Accra"],
    about: "Gold mining company running structured graduate development and vacation attachment programmes.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Graduate programme advertised annually.",
    url: "https://www.newmont.com/careers/default.aspx",
    majors: ["Engineering", "Environmental Science", "Accounting", "Business", "Human Resource Management"],
  },
  {
    id: "ecg",
    name: "Electricity Company of Ghana",
    sector: "Energy & Mining",
    locations: ["Nationwide"],
    about: "Distributes electricity across southern Ghana; work in power engineering, metering, IT and commercial operations.",
    opportunities: ["Attachment", "National service", "Entry-level roles"],
    timing: "Attachments arranged through district and regional offices.",
    url: "https://www.ecg.com.gh/",
    majors: ["Engineering", "Computer Science", "Accounting", "Business"],
  },
  {
    id: "vra",
    name: "Volta River Authority",
    sector: "Energy & Mining",
    locations: ["Greater Accra", "Volta", "Eastern"],
    about: "Generates power from Akosombo, Kpong and thermal plants; strong engineering and environmental teams.",
    opportunities: ["Internship", "Attachment", "National service"],
    timing: "Industrial attachment applications open before the long vacation.",
    url: "https://www.vra.com/careers/index.php",
    majors: ["Engineering", "Environmental Science", "Economics", "Accounting"],
  },
  {
    id: "unilever-gh",
    name: "Unilever Ghana",
    sector: "Manufacturing & FMCG",
    locations: ["Greater Accra", "Central"],
    about: "Consumer goods manufacturer with supply chain, marketing, finance and engineering functions.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Unilever Future Leaders Programme opens annually.",
    url: "https://careers.unilever.com/",
    majors: ["Marketing", "Business", "Engineering", "Accounting", "Human Resource Management"],
  },
  {
    id: "nestle-gh",
    name: "Nestlé Ghana",
    sector: "Manufacturing & FMCG",
    locations: ["Greater Accra", "Ashanti"],
    about: "Food and beverage manufacturer with factory operations, quality, supply chain and sales roles.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Nesternship and graduate roles advertised on the careers portal.",
    url: "https://www.nestle-cwa.com/en/jobs",
    majors: ["Engineering", "Marketing", "Business", "Agriculture", "Accounting"],
  },
  {
    id: "guinness-gh",
    name: "Guinness Ghana Breweries",
    sector: "Manufacturing & FMCG",
    locations: ["Ashanti", "Greater Accra"],
    about: "Diageo's Ghanaian brewer, with production engineering, supply chain, marketing and finance teams.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Diageo Early Careers intake advertised yearly.",
    url: "https://www.diageo.com/en/careers",
    majors: ["Engineering", "Marketing", "Business", "Accounting", "Agriculture"],
  },
  {
    id: "kosmos-innovation",
    name: "Kosmos Innovation Center",
    sector: "Agriculture & Agribusiness",
    locations: ["Greater Accra", "Nationwide"],
    about: "Runs agritech challenges and business incubation for young Ghanaians building agriculture ventures.",
    opportunities: ["Graduate programme", "Volunteer"],
    timing: "AgriTech Challenge cohorts open annually.",
    url: "https://kicghana.org/",
    majors: ["Agriculture", "Business", "Computer Science", "Environmental Science", "Marketing"],
  },
  {
    id: "csir",
    name: "CSIR Ghana",
    sector: "Agriculture & Agribusiness",
    locations: ["Greater Accra", "Ashanti", "Nationwide"],
    about: "Council for Scientific and Industrial Research: crops, soil, food, water and industrial research institutes.",
    opportunities: ["Internship", "Attachment", "National service"],
    timing: "Attachments arranged directly with individual institutes.",
    url: "https://csir.org.gh/",
    majors: ["Agriculture", "Environmental Science", "Engineering", "Data Science & Statistics", "Public Health"],
  },
  {
    id: "cocobod",
    name: "Ghana Cocoa Board (COCOBOD)",
    sector: "Agriculture & Agribusiness",
    locations: ["Greater Accra", "Nationwide"],
    about: "Regulates and supports Ghana's cocoa sector, from research and extension to marketing and quality control.",
    opportunities: ["Internship", "National service", "Attachment"],
    timing: "Attachment requests submitted through the Board's HR division.",
    url: "https://cocobod.gh/",
    majors: ["Agriculture", "Economics", "Business", "Accounting", "Environmental Science"],
  },
  {
    id: "joy-news",
    name: "Multimedia Group (Joy News, Joy FM)",
    sector: "Media & Creative",
    locations: ["Greater Accra", "Ashanti"],
    about: "One of Ghana's largest media houses: broadcast, digital newsrooms, production and advertising sales.",
    opportunities: ["Internship", "Attachment", "National service"],
    timing: "Newsroom attachments arranged with the HR department.",
    url: "https://www.myjoyonline.com/",
    majors: ["Journalism & Media", "Marketing", "Fashion & Creative Arts", "Psychology"],
  },
  {
    id: "citi-fm",
    name: "Citi FM / Citi TV",
    sector: "Media & Creative",
    locations: ["Greater Accra"],
    about: "News-driven radio and television network with reporting, production and digital media teams.",
    opportunities: ["Internship", "Attachment"],
    timing: "Internships announced periodically on air and online.",
    url: "https://citinewsroom.com/",
    majors: ["Journalism & Media", "Marketing", "Fashion & Creative Arts"],
  },
  {
    id: "gra",
    name: "Ghana Revenue Authority",
    sector: "Public sector",
    locations: ["Nationwide"],
    about: "Collects tax and customs revenue; work in audit, tax policy, customs operations and IT.",
    opportunities: ["Internship", "National service", "Attachment"],
    timing: "Attachment requests submitted to regional offices.",
    url: "https://gra.gov.gh/",
    majors: ["Accounting", "Economics", "Law", "Business", "Computer Science"],
  },
  {
    id: "ghana-statistical",
    name: "Ghana Statistical Service",
    sector: "Public sector",
    locations: ["Greater Accra", "Nationwide"],
    about: "Runs the census and national surveys; the main home of official data work in Ghana.",
    opportunities: ["Internship", "National service", "Volunteer"],
    timing: "Field enumerator recruitment during census and survey rounds.",
    url: "https://statsghana.gov.gh/",
    majors: ["Data Science & Statistics", "Economics", "Public Health", "Psychology", "Environmental Science"],
  },
  {
    id: "epa-gh",
    name: "Environmental Protection Agency, Ghana",
    sector: "Public sector",
    locations: ["Nationwide"],
    about: "Regulates environmental impact assessment, pollution control and permitting.",
    opportunities: ["Internship", "National service", "Attachment"],
    timing: "Student attachments via regional EPA offices.",
    url: "https://epa.gov.gh/",
    majors: ["Environmental Science", "Engineering", "Law", "Public Health", "Agriculture"],
  },
  {
    id: "bentsi-enchill",
    name: "Bentsi-Enchill, Letsa & Ankomah",
    sector: "Legal",
    locations: ["Greater Accra"],
    about: "Leading Ghanaian corporate law firm working on energy, finance, and commercial transactions.",
    opportunities: ["Internship", "Attachment"],
    timing: "Vacation attachments for law students, usually applied for in writing.",
    url: "https://belonline.org/",
    majors: ["Law", "Business", "Banking & Finance"],
  },
  {
    id: "aelex",
    name: "AELEX Ghana",
    sector: "Legal",
    locations: ["Greater Accra"],
    about: "Regional commercial law firm covering dispute resolution, energy and corporate advisory.",
    opportunities: ["Internship", "Attachment"],
    timing: "Internship requests handled by the firm's recruitment contact.",
    url: "https://aelex.com/careers/",
    majors: ["Law", "Business", "Economics"],
  },
  {
    id: "legal-aid",
    name: "Legal Aid Commission, Ghana",
    sector: "Legal",
    locations: ["Nationwide"],
    about: "Provides legal representation for people who cannot afford it , strong exposure for law students.",
    opportunities: ["Internship", "Volunteer", "National service"],
    timing: "Placements arranged with regional offices.",
    url: "https://legalaid.gov.gh/",
    majors: ["Law", "Psychology", "Public Health"],
  },
  {
    id: "unicef-gh",
    name: "UNICEF Ghana",
    sector: "Development & NGO",
    locations: ["Greater Accra", "Northern"],
    about: "UN agency working on child health, education, nutrition and protection programmes across Ghana.",
    opportunities: ["Internship", "Volunteer"],
    timing: "Internships posted on the UNICEF global careers portal.",
    url: "https://www.unicef.org/careers/",
    majors: ["Public Health", "Education", "Psychology", "Economics", "Journalism & Media"],
  },
  {
    id: "undp-gh",
    name: "UNDP Ghana",
    sector: "Development & NGO",
    locations: ["Greater Accra"],
    about: "Development programmes in governance, climate, jobs and inclusive growth.",
    opportunities: ["Internship", "Volunteer"],
    timing: "Internships and UN Volunteer assignments listed online.",
    url: "https://jobs.undp.org/",
    majors: ["Economics", "Environmental Science", "Public Health", "Education", "Business"],
  },
  {
    id: "ashesi-career",
    name: "Ashesi Career Services (Ghana employer network)",
    sector: "Development & NGO",
    locations: ["Eastern", "Greater Accra"],
    about:
      "Publishes internship and graduate opportunities from partner employers across Ghana; useful even as a scouting list of who hires students.",
    opportunities: ["Internship", "Graduate programme"],
    timing: "Updated through the academic year.",
    url: "https://www.ashesi.edu.gh/",
    majors: ["Business", "Computer Science", "Engineering", "Economics", "Marketing"],
  },
  {
    id: "nss",
    name: "National Service Scheme",
    sector: "Public sector",
    locations: ["Nationwide"],
    about:
      "Mandatory one-year national service after tertiary education; postings cover ministries, schools, hospitals and private firms.",
    opportunities: ["National service"],
    timing: "Registration opens for each service year, usually mid-year.",
    url: "https://nss.gov.gh/",
    majors: [
      "Education",
      "Nursing",
      "Business",
      "Computer Science",
      "Accounting",
      "Agriculture",
      "Public Health",
      "Engineering",
    ],
  },
];

export const SECTORS: Sector[] = Array.from(new Set(EMPLOYERS.map((e) => e.sector))).sort() as Sector[];

export const OPPORTUNITY_TYPES: OpportunityType[] = [
  "Internship",
  "Graduate programme",
  "National service",
  "Attachment",
  "Volunteer",
  "Entry-level roles",
];

export const REGIONS: string[] = Array.from(
  new Set(EMPLOYERS.flatMap((e) => e.locations)),
).sort();

export const employersForMajor = (major: string) =>
  EMPLOYERS.filter((e) => e.majors.includes(major));
