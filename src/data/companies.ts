/**
 * Ghanaian employers, internships and national service placements.
 *
 * Every entry is written from the organisation's own public pages (careers /
 * about) or from the public site of the Ghanaian regulator that runs the
 * scheme. Where an organisation does not publish fixed internship dates we say
 * "no fixed window published" rather than inventing one.
 */

export type CompanySector =
  | "Technology"
  | "Banking & Finance"
  | "Telecom"
  | "Energy & Mining"
  | "Health"
  | "Agriculture & Food"
  | "Consulting & Audit"
  | "Media & Creative"
  | "Public Sector"
  | "Development & NGO"
  | "Manufacturing"
  | "Hospitality & Tourism";

export const SECTOR_ORDER: CompanySector[] = [
  "Technology",
  "Banking & Finance",
  "Telecom",
  "Energy & Mining",
  "Health",
  "Agriculture & Food",
  "Consulting & Audit",
  "Media & Creative",
  "Public Sector",
  "Development & NGO",
  "Manufacturing",
  "Hospitality & Tourism",
];

export interface Company {
  id: string;
  name: string;
  sector: CompanySector;
  /** Private, Public (state), Multinational, NGO */
  type: "Private" | "Public" | "Multinational" | "NGO";
  locations: string[];
  about: string;
  /** Majors from careerPaths.ts that this employer typically recruits. */
  majors: string[];
  roles: string[];
  internship: {
    /** Named scheme, or the general description of how students get in. */
    name: string;
    detail: string;
    /** When applications usually open, or an honest "not published". */
    timing: string;
    howToApply: string;
  };
  /** Official careers or about page. Used for credits and verification. */
  link: string;
}

export const companies: Company[] = [
  {
    id: "mtn-ghana",
    name: "MTN Ghana",
    sector: "Telecom",
    type: "Multinational",
    locations: ["Accra", "Kumasi", "Takoradi"],
    about:
      "Ghana's largest mobile network operator, running MTN MoMo, enterprise connectivity and a large technology and customer-experience workforce.",
    majors: ["Computer Science", "Data Science & Statistics", "Business", "Marketing", "Engineering", "Banking & Finance", "Human Resource Management"],
    roles: ["Network engineering intern", "Data analyst intern", "Digital marketing intern", "MoMo operations intern"],
    internship: {
      name: "MTN Ghana internships & graduate programme",
      detail:
        "Student attachments and a graduate trainee intake advertised on the MTN careers portal; roles span network, IT, fintech, finance and marketing.",
      timing: "Openings are posted on the careers portal through the year; graduate intake is usually announced once a year.",
      howToApply: "Create a profile on the MTN careers portal and apply to the specific opening; attach your transcript and a one-page CV.",
    },
    link: "https://www.mtn.com.gh/careers/",
  },
  {
    id: "vodafone-telecel-ghana",
    name: "Telecel Ghana",
    sector: "Telecom",
    type: "Multinational",
    locations: ["Accra", "Kumasi"],
    about:
      "The operator formerly trading as Vodafone Ghana, providing mobile, fixed broadband and enterprise services nationwide.",
    majors: ["Computer Science", "Engineering", "Marketing", "Business", "Data Science & Statistics"],
    roles: ["Technology intern", "Customer experience intern", "Commercial intern"],
    internship: {
      name: "Telecel Ghana student attachment",
      detail: "Vacation attachments and graduate roles listed on the company careers page.",
      timing: "No fixed window published; check the careers page each semester.",
      howToApply: "Apply through the listed vacancy; unsolicited attachment letters go through the HR contact on the site.",
    },
    link: "https://telecel.com.gh/careers/",
  },
  {
    id: "hubtel",
    name: "Hubtel",
    sector: "Technology",
    type: "Private",
    locations: ["Accra"],
    about:
      "A Ghanaian software and payments company building commerce, messaging and payment infrastructure used by banks, retailers and government agencies.",
    majors: ["Computer Science", "Data Science & Statistics", "Business", "Marketing"],
    roles: ["Software engineering intern", "Product intern", "Data intern", "Sales operations intern"],
    internship: {
      name: "Hubtel engineering internship",
      detail:
        "Hubtel recruits student engineers who can already write code and ship small features; strong interns are frequently converted to full-time.",
      timing: "Rolling; long vacation intakes are the most common.",
      howToApply: "Apply on the Hubtel careers page with a GitHub link or a project you actually built.",
    },
    link: "https://hubtel.com/careers/",
  },
  {
    id: "expresspay",
    name: "ExpressPay",
    sector: "Technology",
    type: "Private",
    locations: ["Accra"],
    about: "Ghanaian digital payments platform for bills, merchant collections and money transfers.",
    majors: ["Computer Science", "Banking & Finance", "Business", "Marketing"],
    roles: ["Backend intern", "QA intern", "Merchant support intern"],
    internship: {
      name: "ExpressPay internships",
      detail: "Small team, so intern places are limited and usually engineering or merchant operations.",
      timing: "Not published; enquire before the long vacation.",
      howToApply: "Send a CV through the contact address on the company website.",
    },
    link: "https://expresspaygh.com/",
  },
  {
    id: "mest-africa",
    name: "MEST Africa",
    sector: "Technology",
    type: "NGO",
    locations: ["Accra"],
    about:
      "A pan-African training programme and seed fund for software entrepreneurs, with a campus and incubator in Accra.",
    majors: ["Computer Science", "Business", "Marketing", "Data Science & Statistics"],
    roles: ["Entrepreneur-in-training", "Incubator portfolio support"],
    internship: {
      name: "MEST Entrepreneur-in-Training fellowship",
      detail:
        "A fully-sponsored, year-long programme in software development, business and communications for recent graduates, followed by seed funding for selected teams.",
      timing: "One application cycle per year, usually announced months before the intake.",
      howToApply: "Apply through the MEST admissions page during the open cycle; expect coding and business assessments.",
    },
    link: "https://meltwater.org/",
  },
  {
    id: "ecobank-ghana",
    name: "Ecobank Ghana",
    sector: "Banking & Finance",
    type: "Multinational",
    locations: ["Accra", "Kumasi", "Takoradi", "Tamale"],
    about: "One of Ghana's largest banks and part of the pan-African Ecobank group.",
    majors: ["Banking & Finance", "Accounting", "Economics", "Business", "Data Science & Statistics", "Marketing"],
    roles: ["Branch operations intern", "Credit analysis intern", "Digital banking intern"],
    internship: {
      name: "Ecobank student attachment & graduate programme",
      detail:
        "Attachments for students on accredited programmes, plus a competitive pan-African graduate scheme.",
      timing: "Attachments cluster around the long vacation; graduate programme is advertised separately.",
      howToApply: "Submit an introductory letter from your department plus a CV via the careers portal.",
    },
    link: "https://ecobank.com/gh/personal-banking",
  },
  {
    id: "gcb-bank",
    name: "GCB Bank PLC",
    sector: "Banking & Finance",
    type: "Public",
    locations: ["Nationwide"],
    about: "Ghana's largest indigenous bank by branch network, majority state-owned and listed on the GSE.",
    majors: ["Banking & Finance", "Accounting", "Economics", "Business", "Computer Science"],
    roles: ["Banking operations intern", "Finance intern", "IT support intern"],
    internship: {
      name: "GCB student attachment",
      detail: "Branch and head-office attachments for students with a formal introduction letter from their institution.",
      timing: "Mainly the long vacation; apply early because places fill fast.",
      howToApply: "Deliver or email an attachment request letter addressed to Human Resource, GCB Bank.",
    },
    link: "https://www.gcbbank.com.gh/careers",
  },
  {
    id: "bank-of-ghana",
    name: "Bank of Ghana",
    sector: "Public Sector",
    type: "Public",
    locations: ["Accra"],
    about: "Ghana's central bank: monetary policy, currency issue, and supervision of banks and payment systems.",
    majors: ["Economics", "Banking & Finance", "Accounting", "Data Science & Statistics", "Law"],
    roles: ["Research attachment", "Statistics attachment", "Banking supervision attachment"],
    internship: {
      name: "Bank of Ghana attachment / national service",
      detail:
        "Research and statistics departments take a small number of attached students and national service personnel each year.",
      timing: "Attachment requests are usually considered for the long vacation; national service postings follow the NSS calendar.",
      howToApply: "Formal application letter from your department to the Secretary's Department, Bank of Ghana.",
    },
    link: "https://www.bog.gov.gh/",
  },
  {
    id: "databank",
    name: "Databank Group",
    sector: "Banking & Finance",
    type: "Private",
    locations: ["Accra", "Kumasi", "Takoradi"],
    about: "Ghanaian investment banking and asset management firm running some of the country's best-known mutual funds.",
    majors: ["Banking & Finance", "Economics", "Accounting", "Data Science & Statistics", "Marketing"],
    roles: ["Research intern", "Client services intern", "Fund operations intern"],
    internship: {
      name: "Databank internships",
      detail: "Research and client-services attachments; strong Excel and writing skills matter more than your year group.",
      timing: "Not published; enquire a semester ahead.",
      howToApply: "CV and cover letter to the HR contact listed on the Databank site.",
    },
    link: "https://databankgroup.com/",
  },
  {
    id: "kpmg-ghana",
    name: "KPMG Ghana",
    sector: "Consulting & Audit",
    type: "Multinational",
    locations: ["Accra", "Takoradi"],
    about: "One of the Big Four professional services firms, offering audit, tax and advisory work in Ghana.",
    majors: ["Accounting", "Banking & Finance", "Economics", "Business", "Data Science & Statistics", "Law"],
    roles: ["Audit intern", "Tax intern", "Advisory intern"],
    internship: {
      name: "KPMG vacation and graduate scheme",
      detail:
        "Structured vacation placements plus an annual graduate intake feeding the audit and advisory lines; ICAG/ACCA study support is part of the offer.",
      timing: "Graduate recruitment usually runs once a year; vacation places are advertised separately.",
      howToApply: "Apply on the KPMG Ghana careers page; expect aptitude tests and a case interview.",
    },
    link: "https://kpmg.com/gh/en/home/careers.html",
  },
  {
    id: "pwc-ghana",
    name: "PwC Ghana",
    sector: "Consulting & Audit",
    type: "Multinational",
    locations: ["Accra", "Takoradi"],
    about: "Big Four firm delivering assurance, tax and consulting services to Ghanaian and multinational clients.",
    majors: ["Accounting", "Banking & Finance", "Economics", "Business", "Law", "Computer Science"],
    roles: ["Assurance intern", "Tax associate intern", "Technology consulting intern"],
    internship: {
      name: "PwC Ghana student and graduate programmes",
      detail: "Internships and an associate intake with professional-qualification sponsorship.",
      timing: "Graduate applications typically open once a year and close quickly.",
      howToApply: "Apply through the PwC global careers site filtered to Ghana.",
    },
    link: "https://www.pwc.com/gh/en/careers.html",
  },
  {
    id: "deloitte-ghana",
    name: "Deloitte Ghana",
    sector: "Consulting & Audit",
    type: "Multinational",
    locations: ["Accra"],
    about: "Audit, risk advisory, tax and consulting firm serving banks, energy companies and public institutions.",
    majors: ["Accounting", "Banking & Finance", "Business", "Economics", "Computer Science", "Data Science & Statistics"],
    roles: ["Audit intern", "Risk advisory intern", "Consulting analyst intern"],
    internship: {
      name: "Deloitte internship & graduate recruitment",
      detail: "National service placements and internships often act as the pipeline to graduate roles.",
      timing: "Posted on the careers site; graduate intake is annual.",
      howToApply: "Apply online; shortlisted candidates take numerical and verbal reasoning tests.",
    },
    link: "https://www.deloitte.com/gh/en/careers.html",
  },
  {
    id: "gra",
    name: "Ghana Revenue Authority",
    sector: "Public Sector",
    type: "Public",
    locations: ["Nationwide"],
    about: "The authority that administers Ghana's tax laws and customs, from VAT and PAYE to import duty.",
    majors: ["Accounting", "Economics", "Law", "Business", "Data Science & Statistics"],
    roles: ["Tax administration attachment", "Customs attachment", "Audit attachment"],
    internship: {
      name: "GRA student attachment & national service",
      detail: "Domestic tax and customs divisions take students on attachment and NSS personnel across the regions.",
      timing: "Attachments follow the academic long vacation; NSS follows the national posting calendar.",
      howToApply: "Introduction letter from your institution to the GRA regional or head office HR unit.",
    },
    link: "https://gra.gov.gh/",
  },
  {
    id: "gnpc",
    name: "Ghana National Petroleum Corporation (GNPC)",
    sector: "Energy & Mining",
    type: "Public",
    locations: ["Accra", "Takoradi"],
    about: "Ghana's national oil company, holding the state's interests in the country's oil and gas fields.",
    majors: ["Engineering", "Economics", "Accounting", "Law", "Environmental Science", "Data Science & Statistics"],
    roles: ["Petroleum engineering attachment", "Geoscience attachment", "Finance attachment"],
    internship: {
      name: "GNPC internship & scholarship pipeline",
      detail:
        "GNPC runs a well-known scholarship scheme and takes attached students in technical and corporate divisions.",
      timing: "Scholarship advertising is annual; attachments are considered around the long vacation.",
      howToApply: "Watch the GNPC site for the scholarship advert; attachments need an institutional letter.",
    },
    link: "https://gnpcghana.com/",
  },
  {
    id: "tullow-ghana",
    name: "Tullow Ghana",
    sector: "Energy & Mining",
    type: "Multinational",
    locations: ["Accra", "Takoradi"],
    about: "Operator of the Jubilee and TEN offshore oil fields, with a long-running Ghanaian education and skills programme.",
    majors: ["Engineering", "Environmental Science", "Economics", "Accounting", "Public Health"],
    roles: ["Subsurface intern", "HSE intern", "Supply chain intern"],
    internship: {
      name: "Tullow internships and scholarships",
      detail: "Technical internships alongside the Tullow Group Scholarship Scheme for postgraduate study.",
      timing: "Scholarship applications open annually; internships are advertised as needed.",
      howToApply: "Apply through Tullow's Ghana careers and scholarship pages.",
    },
    link: "https://www.tullowoil.com/ghana/",
  },
  {
    id: "goldfields-ghana",
    name: "Gold Fields Ghana",
    sector: "Energy & Mining",
    type: "Multinational",
    locations: ["Tarkwa", "Damang", "Accra"],
    about: "Operator of the Tarkwa and Damang gold mines, one of the country's biggest private employers in mining.",
    majors: ["Engineering", "Environmental Science", "Accounting", "Public Health", "Human Resource Management"],
    roles: ["Mining engineering attachment", "Metallurgy attachment", "Environmental monitoring attachment"],
    internship: {
      name: "Gold Fields student attachment",
      detail:
        "Mine-site attachments for engineering, geology, environmental and business students, often with accommodation on site.",
      timing: "Applications are usually invited months before the long vacation.",
      howToApply: "Apply through the Gold Fields Ghana careers page or your department's industrial attachment office.",
    },
    link: "https://www.goldfields.com/ghana.php",
  },
  {
    id: "newmont-africa",
    name: "Newmont Africa (Ahafo & Akyem)",
    sector: "Energy & Mining",
    type: "Multinational",
    locations: ["Ahafo", "Akyem", "Accra"],
    about: "Operates the Ahafo and Akyem gold mines with large community development and apprenticeship programmes.",
    majors: ["Engineering", "Environmental Science", "Public Health", "Accounting", "Agriculture"],
    roles: ["Process plant attachment", "Community relations attachment", "Environment attachment"],
    internship: {
      name: "Newmont apprenticeship and attachment",
      detail: "Technical apprenticeships for TVET graduates plus attachments for university students.",
      timing: "Advertised locally and on the careers portal.",
      howToApply: "Apply on the Newmont careers portal; community candidates have dedicated intake notices.",
    },
    link: "https://www.newmont.com/operations-and-projects/global-presence/africa/default.aspx",
  },
  {
    id: "ecg",
    name: "Electricity Company of Ghana (ECG)",
    sector: "Energy & Mining",
    type: "Public",
    locations: ["Nationwide"],
    about: "The state distributor of electricity across southern Ghana.",
    majors: ["Engineering", "Accounting", "Computer Science", "Business"],
    roles: ["Electrical engineering attachment", "Metering attachment", "IT attachment"],
    internship: {
      name: "ECG industrial attachment",
      detail: "District and regional offices host engineering and commercial attachments each year.",
      timing: "Long vacation, with letters typically submitted a term ahead.",
      howToApply: "Institutional attachment letter to the regional HR office.",
    },
    link: "https://www.ecg.com.gh/",
  },
  {
    id: "korle-bu",
    name: "Korle Bu Teaching Hospital",
    sector: "Health",
    type: "Public",
    locations: ["Accra"],
    about: "Ghana's premier teaching hospital and the main clinical training site for the University of Ghana Medical School.",
    majors: ["Medicine", "Nursing", "Pharmacy", "Public Health", "Psychology", "Data Science & Statistics"],
    roles: ["Clinical rotation", "Nursing placement", "Pharmacy internship", "Health records attachment"],
    internship: {
      name: "Clinical rotations, housemanship and internships",
      detail:
        "Clinical placements are coordinated through your school; housemanship and pharmacy internships follow the regulator's posting cycle.",
      timing: "Set by the Ghana Medical & Dental Council, Nursing & Midwifery Council and Pharmacy Council calendars.",
      howToApply: "Through your training institution and the relevant professional council, not by direct walk-in.",
    },
    link: "https://kbth.gov.gh/",
  },
  {
    id: "komfo-anokye",
    name: "Komfo Anokye Teaching Hospital",
    sector: "Health",
    type: "Public",
    locations: ["Kumasi"],
    about: "The main referral and teaching hospital for the middle belt, partnered with KNUST's health schools.",
    majors: ["Medicine", "Nursing", "Pharmacy", "Public Health", "Psychology"],
    roles: ["Clinical rotation", "Midwifery placement", "Laboratory attachment"],
    internship: {
      name: "Clinical placements and housemanship",
      detail: "Placements are allocated through KNUST and the professional councils.",
      timing: "Follows the academic and council posting calendars.",
      howToApply: "Through your faculty placement office.",
    },
    link: "https://kath.gov.gh/",
  },
  {
    id: "ghana-health-service",
    name: "Ghana Health Service",
    sector: "Health",
    type: "Public",
    locations: ["Nationwide"],
    about: "The service that runs district hospitals, health centres and public health programmes across all 16 regions.",
    majors: ["Public Health", "Nursing", "Medicine", "Pharmacy", "Data Science & Statistics", "Psychology"],
    roles: ["District health attachment", "Disease surveillance attachment", "Health information attachment"],
    internship: {
      name: "GHS attachment and national service",
      detail: "District health directorates take students for field attachments and NSS personnel for a year of service.",
      timing: "Attachments in the long vacation; NSS via the national posting.",
      howToApply: "Letter to the District or Regional Health Directorate through your school.",
    },
    link: "https://ghs.gov.gh/",
  },
  {
    id: "noguchi",
    name: "Noguchi Memorial Institute for Medical Research",
    sector: "Health",
    type: "Public",
    locations: ["Legon, Accra"],
    about: "The University of Ghana's biomedical research institute, central to Ghana's outbreak testing and vaccine research.",
    majors: ["Medicine", "Public Health", "Data Science & Statistics", "Environmental Science", "Pharmacy"],
    roles: ["Laboratory attachment", "Research assistant", "Data management intern"],
    internship: {
      name: "Noguchi laboratory attachment",
      detail: "Laboratory and research attachments for biological science, biomedical and public health students.",
      timing: "Depends on active projects; enquire directly.",
      howToApply: "Application letter to the institute's administration naming the department you want.",
    },
    link: "https://noguchi.ug.edu.gh/",
  },
  {
    id: "kosmos-innovation-center",
    name: "Kosmos Innovation Center",
    sector: "Agriculture & Food",
    type: "NGO",
    locations: ["Accra"],
    about: "Runs an agritech business competition and incubator for young Ghanaians building agriculture ventures.",
    majors: ["Agriculture", "Business", "Computer Science", "Marketing", "Environmental Science"],
    roles: ["AgriTech Challenge participant", "Incubator team member"],
    internship: {
      name: "AgriTech Challenge",
      detail: "A multi-stage bootcamp and competition with training, mentorship and seed grants for winning teams.",
      timing: "One annual cycle, usually announced early in the year.",
      howToApply: "Apply as a team through the Kosmos Innovation Center site when the cycle opens.",
    },
    link: "https://kosmosinnovationcenter.com/",
  },
  {
    id: "wienco",
    name: "Wienco Ghana",
    sector: "Agriculture & Food",
    type: "Private",
    locations: ["Accra", "Tema", "Northern Ghana"],
    about: "Agricultural inputs and outgrower-finance company working with cocoa, maize and cotton farmers.",
    majors: ["Agriculture", "Business", "Accounting", "Marketing", "Environmental Science"],
    roles: ["Agronomy field intern", "Supply chain intern", "Agribusiness intern"],
    internship: {
      name: "Wienco field attachment",
      detail: "Field-based agronomy attachments in farming districts plus commercial roles in Accra and Tema.",
      timing: "Aligned with the cropping season rather than the academic calendar.",
      howToApply: "CV and attachment letter to the Wienco HR contact.",
    },
    link: "https://www.wienco.com/",
  },
  {
    id: "cocobod",
    name: "Ghana Cocoa Board (COCOBOD)",
    sector: "Agriculture & Food",
    type: "Public",
    locations: ["Accra", "Cocoa-growing districts"],
    about: "The state body regulating cocoa production, quality control, research and farmer support.",
    majors: ["Agriculture", "Economics", "Accounting", "Environmental Science", "Business"],
    roles: ["Quality control attachment", "Extension services attachment", "Research attachment"],
    internship: {
      name: "COCOBOD attachment and scholarship",
      detail: "Attachments across quality control, CRIG research and district offices; COCOBOD also runs a scholarship scheme.",
      timing: "Attachments in the long vacation; scholarship adverts are annual.",
      howToApply: "Institutional letter to COCOBOD HR; scholarships via the published advert.",
    },
    link: "https://cocobod.gh/",
  },
  {
    id: "unilever-ghana",
    name: "Unilever Ghana",
    sector: "Manufacturing",
    type: "Multinational",
    locations: ["Tema", "Accra"],
    about: "Consumer goods manufacturer producing household and personal care brands from its Tema factory.",
    majors: ["Engineering", "Business", "Marketing", "Accounting", "Human Resource Management", "Data Science & Statistics"],
    roles: ["Supply chain intern", "Manufacturing engineering intern", "Brand management intern"],
    internship: {
      name: "Unilever Future Leaders and internships",
      detail: "A global graduate programme with Ghana placements, plus shorter internships that feed into it.",
      timing: "The graduate programme opens on a fixed annual cycle.",
      howToApply: "Apply on Unilever's careers site; the process includes digital assessments and a discovery centre.",
    },
    link: "https://careers.unilever.com/",
  },
  {
    id: "nestle-ghana",
    name: "Nestlé Ghana",
    sector: "Manufacturing",
    type: "Multinational",
    locations: ["Tema", "Accra"],
    about: "Food and beverage manufacturer with a Tema factory and a nationwide distribution network.",
    majors: ["Engineering", "Agriculture", "Business", "Marketing", "Accounting", "Public Health"],
    roles: ["Quality assurance intern", "Production intern", "Sales intern"],
    internship: {
      name: "Nestlé Needs YOUth internships",
      detail: "Youth employability programme offering internships and apprenticeships across the business.",
      timing: "Advertised through the year on the Nestlé careers portal.",
      howToApply: "Apply online to a specific opening in Ghana.",
    },
    link: "https://www.nestle-cwa.com/en/jobs",
  },
  {
    id: "kasapreko",
    name: "Kasapreko Company Limited",
    sector: "Manufacturing",
    type: "Private",
    locations: ["Accra", "Tema"],
    about: "Indigenous Ghanaian beverage manufacturer exporting across West Africa and beyond.",
    majors: ["Engineering", "Business", "Marketing", "Accounting", "Agriculture"],
    roles: ["Production intern", "Quality lab intern", "Distribution intern"],
    internship: {
      name: "Kasapreko attachment",
      detail: "Factory attachments in production, quality and maintenance plus commercial roles.",
      timing: "Not published; enquire with HR.",
      howToApply: "Attachment letter and CV to the HR department.",
    },
    link: "https://kasaprekogroup.com/",
  },
  {
    id: "joy-news",
    name: "Multimedia Group (Joy News, Joy FM)",
    sector: "Media & Creative",
    type: "Private",
    locations: ["Accra", "Kumasi"],
    about: "One of Ghana's biggest private media houses, running radio, television and digital newsrooms.",
    majors: ["Journalism & Media", "Marketing", "Business", "Computer Science", "Fashion & Creative Arts"],
    roles: ["Newsroom intern", "Digital content intern", "Production intern"],
    internship: {
      name: "Multimedia newsroom attachment",
      detail: "Newsroom and production attachments; students are expected to file real stories under supervision.",
      timing: "Rolling, with most places in the long vacation.",
      howToApply: "Attachment letter from your department addressed to the HR department.",
    },
    link: "https://www.myjoyonline.com/",
  },
  {
    id: "citi-fm",
    name: "Citi FM / Channel One",
    sector: "Media & Creative",
    type: "Private",
    locations: ["Accra"],
    about: "Accra broadcaster known for news, current affairs and its civic campaigns.",
    majors: ["Journalism & Media", "Marketing", "Business", "Psychology"],
    roles: ["Reporting intern", "Social media intern", "Events intern"],
    internship: {
      name: "Citi newsroom internship",
      detail: "Short newsroom internships and events support roles.",
      timing: "Not published; enquire each semester.",
      howToApply: "Letter and CV to the newsroom's HR contact.",
    },
    link: "https://citinewsroom.com/",
  },
  {
    id: "ghana-statistical-service",
    name: "Ghana Statistical Service",
    sector: "Public Sector",
    type: "Public",
    locations: ["Accra", "Regional offices"],
    about: "The national statistics office producing the census, GDP, inflation and living-standards surveys.",
    majors: ["Data Science & Statistics", "Economics", "Public Health", "Computer Science", "Environmental Science"],
    roles: ["Survey field officer", "Data processing attachment", "Statistical analysis attachment"],
    internship: {
      name: "GSS attachment, field work and national service",
      detail:
        "Large surveys and the census hire temporary field officers, and the service hosts attachments and NSS personnel in its analysis units.",
      timing: "Field recruitment is announced when a survey round starts.",
      howToApply: "Watch the GSS site for recruitment notices; attachments need an institutional letter.",
    },
    link: "https://statsghana.gov.gh/",
  },
  {
    id: "nia",
    name: "National Information Technology Agency (NITA)",
    sector: "Public Sector",
    type: "Public",
    locations: ["Accra"],
    about: "The agency responsible for government ICT infrastructure, data centres and digital services standards.",
    majors: ["Computer Science", "Data Science & Statistics", "Engineering"],
    roles: ["Network operations attachment", "Cybersecurity attachment", "Systems support attachment"],
    internship: {
      name: "NITA attachment and national service",
      detail: "Technical attachments in networks, data centre operations and information security.",
      timing: "Long vacation and the NSS year.",
      howToApply: "Institutional attachment letter to NITA HR.",
    },
    link: "https://nita.gov.gh/",
  },
  {
    id: "nss",
    name: "Ghana National Service Authority",
    sector: "Public Sector",
    type: "Public",
    locations: ["Nationwide"],
    about:
      "Runs the mandatory one-year national service for Ghanaian tertiary graduates, posting personnel to schools, hospitals, ministries and private firms.",
    majors: [
      "Computer Science",
      "Medicine",
      "Engineering",
      "Business",
      "Law",
      "Nursing",
      "Accounting",
      "Agriculture",
      "Education",
      "Economics",
      "Marketing",
      "Psychology",
      "Journalism & Media",
      "Public Health",
      "Data Science & Statistics",
      "Human Resource Management",
      "Environmental Science",
    ],
    roles: ["National service personnel"],
    internship: {
      name: "National Service",
      detail:
        "Every Ghanaian graduate of an accredited tertiary institution serves for one year; many employers convert strong service personnel to permanent staff.",
      timing: "Registration and posting run on the annual national service calendar.",
      howToApply: "Register on the official national service portal during the registration window, then print and submit your posting letter.",
    },
    link: "https://nss.gov.gh/",
  },
  {
    id: "yea",
    name: "Youth Employment Agency (YEA)",
    sector: "Public Sector",
    type: "Public",
    locations: ["Nationwide"],
    about: "Government agency placing young people into modules such as ICT, health assistance, teaching support and agriculture.",
    majors: ["Education", "Public Health", "Agriculture", "Computer Science", "Business", "Nursing"],
    roles: ["Module beneficiary placements"],
    internship: {
      name: "YEA modules",
      detail: "Time-limited paid placements across several employment modules for young Ghanaians.",
      timing: "Recruitment windows are announced per module.",
      howToApply: "Register on the YEA portal during an open module recruitment.",
    },
    link: "https://yea.gov.gh/",
  },
  {
    id: "world-vision-ghana",
    name: "World Vision Ghana",
    sector: "Development & NGO",
    type: "NGO",
    locations: ["Accra", "Northern Ghana", "Field offices"],
    about: "International development organisation working on child wellbeing, water, education and livelihoods.",
    majors: ["Public Health", "Education", "Agriculture", "Economics", "Psychology", "Environmental Science"],
    roles: ["Programme intern", "Monitoring & evaluation intern", "Community mobilisation intern"],
    internship: {
      name: "World Vision internships",
      detail: "Field and office internships, often in monitoring and evaluation or programme support.",
      timing: "Advertised on the careers portal when funded.",
      howToApply: "Apply to the specific opening on the World Vision careers site.",
    },
    link: "https://www.wvi.org/ghana",
  },
  {
    id: "unicef-ghana",
    name: "UNICEF Ghana",
    sector: "Development & NGO",
    type: "NGO",
    locations: ["Accra", "Tamale"],
    about: "UN agency working with government on child health, nutrition, education and protection.",
    majors: ["Public Health", "Education", "Psychology", "Economics", "Data Science & Statistics"],
    roles: ["Programme intern", "Communication intern", "Data & evidence intern"],
    internship: {
      name: "UNICEF internship programme",
      detail: "Structured internships for students and recent graduates, applied for through the UN careers system.",
      timing: "Posted per vacancy on the UNICEF careers portal.",
      howToApply: "Create a UNICEF careers profile and apply to a Ghana-based internship posting.",
    },
    link: "https://www.unicef.org/ghana/",
  },
  {
    id: "kempinski-gold-coast",
    name: "Kempinski Hotel Gold Coast City",
    sector: "Hospitality & Tourism",
    type: "Multinational",
    locations: ["Accra"],
    about: "Five-star hotel in Accra with structured food-and-beverage, front office and events operations.",
    majors: ["Hospitality & Tourism", "Business", "Marketing", "Human Resource Management"],
    roles: ["Front office trainee", "F&B trainee", "Events intern"],
    internship: {
      name: "Kempinski hotel traineeship",
      detail: "Departmental traineeships for hospitality students, rotating through service areas.",
      timing: "Aligned with hospitality school placement terms.",
      howToApply: "Through your hospitality school's placement office or the hotel HR contact.",
    },
    link: "https://www.kempinski.com/en/hotel-gold-coast-city",
  },
  {
    id: "ghana-tourism-authority",
    name: "Ghana Tourism Authority",
    sector: "Hospitality & Tourism",
    type: "Public",
    locations: ["Accra", "Regional offices"],
    about: "Regulates and promotes Ghana's tourism industry, from site licensing to campaigns like December in GH.",
    majors: ["Hospitality & Tourism", "Marketing", "Business", "Journalism & Media", "Environmental Science"],
    roles: ["Tourism research attachment", "Marketing attachment", "Site inspection attachment"],
    internship: {
      name: "GTA attachment and national service",
      detail: "Attachments in research, marketing and regional site licensing.",
      timing: "Long vacation and the NSS year.",
      howToApply: "Institutional letter to the GTA regional office.",
    },
    link: "https://visitghana.com/",
  },
  {
    id: "ashesi-career-services",
    name: "Ashesi Career Services network",
    sector: "Technology",
    type: "Private",
    locations: ["Berekuso", "Accra"],
    about:
      "Ashesi's career services team places students with Ghanaian and multinational employers each year and publishes the internship expectations employers hold.",
    majors: ["Computer Science", "Business", "Engineering", "Economics", "Data Science & Statistics"],
    roles: ["Partner-company internships"],
    internship: {
      name: "Ashesi internship placement",
      detail:
        "A useful public reference for what Ghanaian employers expect from interns, even if you study elsewhere.",
      timing: "Placements run in the long vacation.",
      howToApply: "Ashesi students apply through career services; others should read the guidance and apply to employers directly.",
    },
    link: "https://www.ashesi.edu.gh/",
  },
  {
    id: "stanbic-ghana",
    name: "Stanbic Bank Ghana",
    sector: "Banking & Finance",
    type: "Multinational",
    locations: ["Accra", "Kumasi", "Takoradi"],
    about: "Part of Standard Bank Group, focused on corporate, investment and personal banking.",
    majors: ["Banking & Finance", "Accounting", "Economics", "Business", "Computer Science", "Data Science & Statistics"],
    roles: ["Graduate trainee", "Operations intern", "Risk intern"],
    internship: {
      name: "Stanbic graduate trainee programme",
      detail: "A structured rotation through banking functions for recent graduates, plus shorter internships.",
      timing: "Graduate intake is advertised annually.",
      howToApply: "Apply on the Stanbic Ghana careers page; expect online assessments.",
    },
    link: "https://www.stanbicbank.com.gh/ghana/personal",
  },
];

export const companyById = (id: string) => companies.find((c) => c.id === id);

export const companiesForMajor = (major: string) =>
  companies.filter((c) => c.majors.includes(major));

export const majorsWithEmployers = () =>
  Array.from(new Set(companies.flatMap((c) => c.majors))).sort();

export const REGIONS = Array.from(new Set(companies.flatMap((c) => c.locations))).sort();
