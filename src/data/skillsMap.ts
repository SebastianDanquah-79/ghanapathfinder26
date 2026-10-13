/**
 * GhanaPathFinder skills ecosystem.
 *
 * Every skill carries free/low-cost learning resources with the provider named,
 * so students can start building the skill today. All links point to the
 * official page of the organisation that owns the material — see /credits for
 * the full acknowledgement list. Nothing here is scraped or copied: summaries
 * are written in GhanaPathFinder's own words.
 */

export type ResourceType =
  | "YouTube"
  | "Free course"
  | "Certification"
  | "Docs"
  | "Practice"
  | "Reading";

import { EXPANDED_SKILLS } from "./expandedSkills";

export interface LearningResource {
  title: string;
  provider: string;
  url: string;
  type: ResourceType;
  cost: "Free" | "Free to learn, paid certificate" | "Paid";
}

export interface Skill {
  id: string;
  name: string;
  summary: string;
  why: string;
  resources: LearningResource[];
  category?: SkillCategory;
}

export type SkillCategory =
  | "foundation"
  | "technical"
  | "soft"
  | "tools"
  | "industry"
  | "advanced";

export const CATEGORY_LABELS: Record<SkillCategory, string> = {
  foundation: "Foundation skills",
  technical: "Technical skills",
  soft: "Soft skills",
  tools: "Tools & technologies",
  industry: "Industry knowledge",
  advanced: "Advanced skills",
};

export const CATEGORY_HINTS: Record<SkillCategory, string> = {
  foundation: "Start here — these make everything else easier.",
  technical: "The core know-how employers test you on.",
  soft: "How you work with people. Often decides who gets hired.",
  tools: "The software and equipment used on the job.",
  industry: "Rules, regulators and context specific to Ghana and the sector.",
  advanced: "Build these after the basics to specialise and stand out.",
};

const yt = (title: string, provider: string, url: string): LearningResource => ({
  title,
  provider,
  url,
  type: "YouTube",
  cost: "Free",
});

const free = (title: string, provider: string, url: string): LearningResource => ({
  title,
  provider,
  url,
  type: "Free course",
  cost: "Free",
});

const cert = (
  title: string,
  provider: string,
  url: string,
  cost: LearningResource["cost"] = "Free to learn, paid certificate",
): LearningResource => ({ title, provider, url, type: "Certification", cost });

const skill = (
  id: string,
  name: string,
  summary: string,
  why: string,
  resources: LearningResource[],
): Skill => ({ id, name, summary, why, resources });

/* ------------------------------------------------------------------ */
/* Shared soft skills                                                  */
/* ------------------------------------------------------------------ */

const SOFT: Skill[] = [
  skill(
    "communication",
    "Communication",
    "Explaining ideas clearly in writing and speech, and listening properly before responding.",
    "Ghanaian employers repeatedly rank clear communication above technical brilliance for entry-level hires.",
    [
      free("Business Writing", "University of Colorado Boulder (Coursera, audit free)", "https://www.coursera.org/learn/business-writing"),
      yt("Public speaking playlist", "TED", "https://www.youtube.com/playlist?list=PLOGi5-fAu8bFWy1DPUJc00XdSJTFArWWt"),
    ],
  ),
  skill(
    "teamwork",
    "Teamwork & collaboration",
    "Working productively with people who have different skills, backgrounds and opinions.",
    "Almost all internships and attachments are graded partly on how well you fit into a team.",
    [free("Teamwork Skills: Communicating Effectively in Groups", "University of Colorado Boulder (Coursera, audit free)", "https://www.coursera.org/learn/teamwork-skills-effective-communication")],
  ),
  skill(
    "critical-thinking",
    "Critical thinking & problem solving",
    "Breaking a messy problem into parts, testing assumptions and choosing a defensible solution.",
    "It is the skill that separates someone who follows instructions from someone who gets promoted.",
    [
      free("Introduction to Logic and Critical Thinking", "Duke University (Coursera, audit free)", "https://www.coursera.org/specializations/logic-critical-thinking-duke"),
      yt("Critical thinking crash course", "CrashCourse", "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNgK6MZucdYldNkMybYIHKR"),
    ],
  ),
  skill(
    "time-management",
    "Time management & organisation",
    "Planning work, meeting deadlines and keeping records of what you promised.",
    "University plus applications plus skill-building only works with a real system.",
    [free("Work Smarter, Not Harder: Time Management", "UC Irvine (Coursera, audit free)", "https://www.coursera.org/learn/work-smarter-not-harder")],
  ),
  skill(
    "presentation",
    "Presentation skills",
    "Designing and delivering a short, clear talk with slides or visuals that support you.",
    "Project defence, client pitches and job interviews are all presentations.",
    [yt("How to make better presentations", "TED-Ed", "https://www.youtube.com/@TEDEd")],
  ),
  skill(
    "research",
    "Research & information literacy",
    "Finding reliable sources, judging their quality and citing them properly.",
    "Protects you from misinformation and is required for every long essay or dissertation.",
    [free("Information Literacy", "University of North Carolina (Coursera, audit free)", "https://www.coursera.org/learn/information-literacy")],
  ),
  skill(
    "professional-ethics",
    "Professional ethics & integrity",
    "Understanding confidentiality, conflicts of interest and the code of conduct of your profession.",
    "In regulated Ghanaian professions, an ethics breach can end a career before it starts.",
    [{ title: "Codes of conduct published by Ghanaian professional councils", provider: "GhanaPathFinder professional councils directory", url: "/professional-councils", type: "Reading", cost: "Free" }],
  ),
  skill(
    "adaptability",
    "Adaptability & learning how to learn",
    "Picking up new tools and methods quickly as your field changes.",
    "Most tools you will use in 5 years do not exist in your current syllabus.",
    [free("Learning How to Learn", "McMaster University & UC San Diego (Coursera, audit free)", "https://www.coursera.org/learn/learning-how-to-learn")],
  ),
  skill(
    "leadership",
    "Leadership & initiative",
    "Taking responsibility for an outcome, coordinating others and making decisions under pressure.",
    "Scholarship panels and graduate schemes screen heavily for demonstrated leadership.",
    [free("Inspiring and Motivating Individuals", "University of Michigan (Coursera, audit free)", "https://www.coursera.org/learn/motivate-people-teams")],
  ),
  skill(
    "customer-service",
    "Client & customer handling",
    "Listening to what a client actually needs and managing expectations politely and firmly.",
    "Service quality is the main differentiator in Ghana's banking, hospitality and health sectors.",
    [free("Customer Service Fundamentals", "Knowledge Accelerators (Coursera, audit free)", "https://www.coursera.org/learn/customer-service-fundamentals")],
  ),
  skill(
    "empathy",
    "Empathy & patient/person-centred care",
    "Recognising another person's situation and responding with respect, especially under stress.",
    "Central to health, education, law and social-work practice.",
    [free("Psychological First Aid", "Johns Hopkins University (Coursera, audit free)", "https://www.coursera.org/learn/psychological-first-aid")],
  ),
  skill(
    "negotiation",
    "Negotiation & persuasion",
    "Reaching agreements where both sides can commit, and arguing a position with evidence.",
    "Needed in law, business, procurement, HR and any client-facing role.",
    [free("Successful Negotiation: Essential Strategies and Skills", "University of Michigan (Coursera, audit free)", "https://www.coursera.org/learn/negotiation-skills")],
  ),
];

/* ------------------------------------------------------------------ */
/* Domain skills                                                       */
/* ------------------------------------------------------------------ */

const DOMAIN: Skill[] = [
  /* --- numeracy / science foundations --- */
  skill(
    "mathematics",
    "Mathematics",
    "Algebra, functions, calculus and the reasoning behind them.",
    "Underpins engineering, computing, economics, finance and all the sciences.",
    [
      free("Math courses (Algebra → Calculus)", "Khan Academy", "https://www.khanacademy.org/math"),
      yt("Essence of calculus / linear algebra", "3Blue1Brown", "https://www.youtube.com/@3blue1brown"),
    ],
  ),
  skill(
    "statistics",
    "Statistics & probability",
    "Describing data, quantifying uncertainty and testing whether a result is real.",
    "Every evidence-based decision — clinical, financial or policy — rests on it.",
    [
      free("Statistics and probability", "Khan Academy", "https://www.khanacademy.org/math/statistics-probability"),
      yt("Statistics fundamentals", "StatQuest with Josh Starmer", "https://www.youtube.com/@statquest"),
    ],
  ),
  skill(
    "scientific-method",
    "Scientific method & lab discipline",
    "Designing controlled experiments, recording observations honestly and handling equipment safely.",
    "Marks in practical papers and the credibility of your research depend on it.",
    [free("Science courses", "Khan Academy", "https://www.khanacademy.org/science")],
  ),
  skill(
    "technical-writing",
    "Technical & report writing",
    "Structuring reports, referencing sources and writing so a busy reader understands quickly.",
    "Attachment reports, lab reports, case notes and proposals all use the same craft.",
    [free("English grammar and writing", "Khan Academy", "https://www.khanacademy.org/humanities/grammar")],
  ),
  skill(
    "digital-literacy",
    "Digital literacy",
    "Confident use of a computer, cloud documents, email and online safety.",
    "Assumed by every employer and every online application portal.",
    [free("Digital Skills", "Google Digital Garage (Grow with Google)", "https://grow.google/certificates/")],
  ),

  /* --- computing --- */
  skill(
    "programming-fundamentals",
    "Programming fundamentals",
    "Variables, loops, functions, files and debugging in one language.",
    "The base every software, data or AI role is built on.",
    [
      free("CS50x: Introduction to Computer Science", "Harvard University (edX/OpenCourseWare)", "https://cs50.harvard.edu/x/"),
      yt("Python for beginners (full course)", "freeCodeCamp.org", "https://www.youtube.com/@freecodecamp"),
    ],
  ),
  skill(
    "python",
    "Python",
    "The default language for data work, automation, scripting and machine learning.",
    "Most Ghanaian data/AI job adverts name Python first.",
    [
      free("Python for Everybody", "University of Michigan / py4e.com", "https://www.py4e.com/"),
      { title: "Official Python tutorial", provider: "Python Software Foundation", url: "https://docs.python.org/3/tutorial/", type: "Docs", cost: "Free" },
    ],
  ),
  skill(
    "web-development",
    "Web development (HTML, CSS, JavaScript)",
    "Building websites and web apps that work on phones as well as laptops.",
    "The fastest route from learning to paid freelance work in Ghana.",
    [
      free("Responsive Web Design certification", "freeCodeCamp", "https://www.freecodecamp.org/learn/2022/responsive-web-design/"),
      { title: "MDN Web Docs", provider: "Mozilla", url: "https://developer.mozilla.org/en-US/docs/Learn", type: "Docs", cost: "Free" },
    ],
  ),
  skill(
    "databases-sql",
    "Databases & SQL",
    "Designing tables and querying data with SQL.",
    "Banks, telcos and every reporting job in Ghana run on SQL.",
    [
      free("SQL tutorial", "SQLBolt", "https://sqlbolt.com/"),
      free("Databases: Relational Databases and SQL", "Stanford Online", "https://online.stanford.edu/courses/soe-ydatabases0005-databases-relational-databases-and-sql"),
    ],
  ),
  skill(
    "data-structures-algorithms",
    "Data structures & algorithms",
    "Choosing the right structure and analysing how fast your solution runs.",
    "The core of technical interviews at Andela, Turntabl, Amalitech and similar employers.",
    [
      free("Algorithms, Part I", "Princeton University (Coursera, audit free)", "https://www.coursera.org/learn/algorithms-part1"),
      { title: "Practice problems", provider: "LeetCode", url: "https://leetcode.com/problemset/", type: "Practice", cost: "Free" },
    ],
  ),
  skill(
    "machine-learning",
    "Machine learning",
    "Training models that learn patterns from data, and evaluating them honestly.",
    "Powers credit scoring, fraud detection and forecasting roles now hiring in Accra.",
    [
      free("Machine Learning Specialisation", "DeepLearning.AI & Stanford (Coursera, audit free)", "https://www.coursera.org/specializations/machine-learning-introduction"),
      free("Intro to Machine Learning", "Kaggle Learn", "https://www.kaggle.com/learn/intro-to-machine-learning"),
    ],
  ),
  skill(
    "deep-learning",
    "Deep learning",
    "Neural networks for images, text and audio.",
    "The foundation under modern AI products.",
    [
      free("Practical Deep Learning for Coders", "fast.ai", "https://course.fast.ai/"),
      free("Deep Learning Specialisation", "DeepLearning.AI (Coursera, audit free)", "https://www.coursera.org/specializations/deep-learning"),
    ],
  ),
  skill(
    "generative-ai",
    "Generative AI & LLMs",
    "Using and building on large language models, including prompting, retrieval and evaluation.",
    "Fast-growing demand across Ghanaian startups and consulting firms.",
    [free("Short courses on building with LLMs", "DeepLearning.AI", "https://www.deeplearning.ai/short-courses/")],
  ),
  skill(
    "computer-vision",
    "Computer vision",
    "Getting machines to interpret images and video.",
    "Used in agri-tech crop monitoring, security and medical imaging projects.",
    [free("OpenCV tutorials", "OpenCV.org", "https://docs.opencv.org/4.x/d9/df8/tutorial_root.html")],
  ),
  skill(
    "nlp",
    "Natural language processing",
    "Working with human language: classification, extraction, translation.",
    "Relevant to Ghanaian-language technology and customer-service automation.",
    [free("NLP Course", "Hugging Face", "https://huggingface.co/learn/nlp-course")],
  ),
  skill(
    "cybersecurity",
    "Cybersecurity fundamentals",
    "Protecting systems and data: access control, encryption basics, incident response.",
    "Bank of Ghana cyber directives have made this a hiring priority in finance.",
    [
      free("Cyber Aces / security fundamentals", "SANS Institute", "https://www.sans.org/cyberaces/"),
      cert("Google Cybersecurity Certificate", "Google (Coursera)", "https://www.coursera.org/professional-certificates/google-cybersecurity"),
    ],
  ),
  skill(
    "cloud-computing",
    "Cloud computing",
    "Deploying and running software on AWS, Azure or Google Cloud.",
    "Almost all new systems in Ghana are cloud-hosted.",
    [
      free("AWS Cloud Practitioner Essentials", "Amazon Web Services", "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/"),
      cert("Microsoft Azure Fundamentals (AZ-900)", "Microsoft Learn", "https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/"),
    ],
  ),
  skill(
    "version-control-git",
    "Version control with Git",
    "Tracking changes, branching and collaborating through GitHub or GitLab.",
    "No professional software team works without it — and your GitHub is your portfolio.",
    [
      { title: "Git & GitHub docs and Skills courses", provider: "GitHub", url: "https://skills.github.com/", type: "Docs", cost: "Free" },
      yt("Git and GitHub for beginners", "freeCodeCamp.org", "https://www.youtube.com/@freecodecamp"),
    ],
  ),
  skill(
    "data-analysis",
    "Data analysis & visualisation",
    "Cleaning data, finding the story in it and presenting it clearly.",
    "The most transferable technical skill across finance, health, agriculture and NGOs.",
    [
      free("Pandas & data cleaning", "Kaggle Learn", "https://www.kaggle.com/learn"),
      cert("Google Data Analytics Certificate", "Google (Coursera)", "https://www.coursera.org/professional-certificates/google-data-analytics"),
    ],
  ),
  skill(
    "spreadsheets",
    "Spreadsheets (Excel / Google Sheets)",
    "Formulas, pivot tables, lookups and clean model layout.",
    "Still the single most requested tool in Ghanaian job adverts across sectors.",
    [
      free("Excel training", "Microsoft Support", "https://support.microsoft.com/en-us/excel"),
      yt("Excel tutorials", "ExcelIsFun", "https://www.youtube.com/@excelisfun"),
    ],
  ),

  /* --- engineering / built environment --- */
  skill(
    "engineering-mechanics",
    "Engineering mechanics",
    "Forces, motion, stress and strain applied to real structures and machines.",
    "The gate subject for civil, mechanical and mining engineering.",
    [free("MIT OpenCourseWare — engineering mechanics", "Massachusetts Institute of Technology", "https://ocw.mit.edu/search/?q=engineering%20mechanics")],
  ),
  skill(
    "cad",
    "CAD & technical drawing",
    "Producing accurate 2D drawings and 3D models to standards.",
    "Every engineering and architecture attachment expects at least AutoCAD basics.",
    [
      free("AutoCAD tutorials", "Autodesk", "https://www.autodesk.com/support/technical/product/autocad"),
      free("Fusion 360 for beginners", "Autodesk", "https://www.autodesk.com/learn"),
    ],
  ),
  skill(
    "bim-revit",
    "BIM (Revit / ArchiCAD)",
    "Building information modelling for coordinated design documentation.",
    "Increasingly required on large Ghanaian construction and consultancy projects.",
    [free("Revit learning paths", "Autodesk", "https://www.autodesk.com/learn/ondemand/software/revit")],
  ),
  skill(
    "gis",
    "GIS & spatial analysis",
    "Mapping and analysing location data.",
    "Used in planning, environment, agriculture, mining and public health surveillance.",
    [free("QGIS Training Manual", "QGIS Project", "https://docs.qgis.org/latest/en/docs/training_manual/")],
  ),
  skill(
    "electronics",
    "Electronics & circuits",
    "Reading circuit diagrams, measuring safely and building working circuits.",
    "Foundational for electrical, telecom, biomedical and automation work.",
    [free("Electrical engineering", "Khan Academy", "https://www.khanacademy.org/science/electrical-engineering")],
  ),
  skill(
    "control-automation",
    "Control systems & automation (PLC)",
    "Automating industrial processes with sensors, controllers and logic.",
    "Growing need in Ghanaian manufacturing, mining and food processing.",
    [free("Automation & PLC learning", "Siemens SITRAIN / Siemens Xcelerator Academy", "https://www.siemens.com/global/en/products/services/digital-enterprise-services/training.html")],
  ),
  skill(
    "project-management",
    "Project management",
    "Scope, schedule, cost, risk and stakeholder management.",
    "Required on construction, IT and donor-funded programmes.",
    [
      cert("Google Project Management Certificate", "Google (Coursera)", "https://www.coursera.org/professional-certificates/google-project-management"),
      { title: "PMP and CAPM credentials", provider: "Project Management Institute", url: "https://www.pmi.org/certifications", type: "Certification", cost: "Paid" },
    ],
  ),
  skill(
    "hse",
    "Health, safety & environment (HSE)",
    "Hazard identification, risk assessment and safe working practice.",
    "Mandatory on mines, oil and gas sites and large construction projects in Ghana.",
    [free("Occupational safety and health resources", "International Labour Organization", "https://www.ilo.org/topics/labour-administration-and-inspection/occupational-safety-and-health")],
  ),

  /* --- health --- */
  skill(
    "anatomy-physiology",
    "Anatomy & physiology",
    "How the human body is structured and how it works.",
    "The base of medicine, nursing, pharmacy and allied health training.",
    [
      free("Health and medicine", "Khan Academy", "https://www.khanacademy.org/science/health-and-medicine"),
      yt("Anatomy & physiology playlists", "Osmosis", "https://www.youtube.com/@osmosis"),
    ],
  ),
  skill(
    "clinical-skills",
    "Clinical skills & patient assessment",
    "History taking, examination, vital signs and safe procedures.",
    "Assessed continuously in clinical rotations and licensing exams.",
    [free("Clinical skills open resources", "Geeky Medics", "https://geekymedics.com/")],
  ),
  skill(
    "pharmacology",
    "Pharmacology",
    "How medicines act, interact and are dosed safely.",
    "Core to pharmacy, medicine and nursing practice and licensure.",
    [free("Pharmacology open resources", "Osmosis / Khan Academy medicine", "https://www.khanacademy.org/science/health-and-medicine")],
  ),
  skill(
    "infection-control",
    "Infection prevention & control",
    "Hand hygiene, sterilisation, PPE and outbreak precautions.",
    "A standing requirement across Ghana Health Service facilities.",
    [free("Infection prevention and control courses", "World Health Organization (OpenWHO)", "https://openwho.org/")],
  ),
  skill(
    "epidemiology",
    "Epidemiology & biostatistics",
    "Measuring disease in populations and interpreting studies.",
    "Central to public health, surveillance and research roles.",
    [free("Epidemiology: The Basic Science of Public Health", "University of North Carolina (Coursera, audit free)", "https://www.coursera.org/learn/epidemiology")],
  ),
  skill(
    "health-informatics",
    "Health data & informatics (DHIMS)",
    "Recording, extracting and using routine health data.",
    "Ghana Health Service runs on DHIMS2 (DHIS2) reporting.",
    [free("DHIS2 online academy and documentation", "DHIS2 / University of Oslo", "https://academy.dhis2.org/")],
  ),

  /* --- business, finance, law --- */
  skill(
    "financial-accounting",
    "Financial accounting",
    "Double entry, trial balance and preparing financial statements.",
    "The language of every business role and the base of ICAG/ACCA study.",
    [
      free("Accounting resources and study support", "ACCA Global", "https://www.accaglobal.com/gb/en/student.html"),
      yt("Accounting basics", "Accounting Stuff", "https://www.youtube.com/@AccountingStuff"),
    ],
  ),
  skill(
    "financial-modelling",
    "Financial modelling & valuation",
    "Building forecast models and valuing a business or project.",
    "Required for investment banking, corporate finance and development finance roles.",
    [free("Finance and capital markets", "Khan Academy", "https://www.khanacademy.org/economics-finance-domain/core-finance")],
  ),
  skill(
    "economics-analysis",
    "Economic analysis",
    "Applying micro and macro reasoning to real policy and market questions.",
    "Used by Bank of Ghana, ministries, think tanks and banks' research desks.",
    [free("Economics", "Marginal Revolution University", "https://mru.org/")],
  ),
  skill(
    "taxation-ghana",
    "Ghanaian taxation & compliance",
    "Income tax, VAT, withholding tax and filing obligations under GRA rules.",
    "Practical and immediately employable knowledge for accounting roles.",
    [{ title: "Tax types, rates and filing guidance", provider: "Ghana Revenue Authority", url: "https://gra.gov.gh/", type: "Reading", cost: "Free" }],
  ),
  skill(
    "digital-marketing",
    "Digital marketing",
    "Search, social, content and paid campaigns, measured properly.",
    "One of the quickest skills to monetise while still a student.",
    [
      cert("Fundamentals of Digital Marketing", "Google Digital Garage", "https://learndigital.withgoogle.com/digitalgarage"),
      free("Meta Blueprint free courses", "Meta", "https://www.facebook.com/business/learn"),
    ],
  ),
  skill(
    "market-research",
    "Market & consumer research",
    "Designing surveys and interviews, then turning responses into decisions.",
    "Marketing, product and NGO programme roles all need it.",
    [free("Survey design and analysis basics", "Kaggle Learn / Coursera audit", "https://www.kaggle.com/learn")],
  ),
  skill(
    "entrepreneurship",
    "Entrepreneurship & business modelling",
    "Testing an idea cheaply, pricing it and building a route to revenue.",
    "Many graduates in Ghana create their own role rather than find one.",
    [free("How to Start a Startup / Startup School", "Y Combinator", "https://www.startupschool.org/")],
  ),
  skill(
    "legal-research",
    "Legal research & case analysis",
    "Finding statutes and case law, then applying them to a set of facts.",
    "The daily work of a Ghanaian lawyer and the basis of law school assessment.",
    [{ title: "Constitution, Acts and legal resources of Ghana", provider: "Parliament of Ghana / Judicial Service of Ghana", url: "https://www.parliament.gh/", type: "Reading", cost: "Free" }],
  ),
  skill(
    "drafting",
    "Legal drafting",
    "Writing contracts, pleadings and opinions precisely.",
    "Precision here is what clients actually pay for.",
    [free("Contract law basics", "Harvard Online / edX audit", "https://online-learning.harvard.edu/subject/law")],
  ),
  skill(
    "hr-practice",
    "HR practice & labour law",
    "Recruitment, performance management and the Labour Act, 2003 (Act 651).",
    "Compliance failures are the most common HR risk in Ghanaian firms.",
    [{ title: "Labour Act and employment guidance", provider: "Ministry of Employment and Labour Relations, Ghana", url: "https://melr.gov.gh/", type: "Reading", cost: "Free" }],
  ),

  /* --- education, media, creative, hospitality, agriculture, environment --- */
  skill(
    "pedagogy",
    "Pedagogy & lesson planning",
    "Planning lessons, differentiating for ability and assessing learning.",
    "The core competency assessed by the National Teaching Council licensure exam.",
    [free("Teaching resources and courses", "British Council TeachingEnglish", "https://www.teachingenglish.org.uk/")],
  ),
  skill(
    "classroom-management",
    "Classroom management",
    "Keeping a large class engaged, safe and on task.",
    "Ghanaian class sizes make this decisive for a new teacher's survival.",
    [free("Teacher professional development resources", "UNESCO / British Council", "https://www.teachingenglish.org.uk/professional-development")],
  ),
  skill(
    "journalism-reporting",
    "Reporting & interviewing",
    "Sourcing, verifying and structuring a story under deadline.",
    "Verification is the reputation of a Ghanaian newsroom.",
    [free("Journalism courses", "Reuters Institute / Knight Center for Journalism in the Americas", "https://journalismcourses.org/")],
  ),
  skill(
    "media-production",
    "Media production (audio, video, editing)",
    "Recording, editing and publishing clean audio and video.",
    "Radio, TV and social content are the biggest media employers in Ghana.",
    [free("Video editing tutorials", "Blackmagic Design (DaVinci Resolve training)", "https://www.blackmagicdesign.com/products/davinciresolve/training")],
  ),
  skill(
    "graphic-design",
    "Graphic & visual design",
    "Layout, type and colour applied to a clear message.",
    "Immediately freelanceable and useful in every communications job.",
    [free("Design school tutorials", "Canva Design School", "https://www.canva.com/designschool/")],
  ),
  skill(
    "fashion-pattern",
    "Pattern making & garment construction",
    "Drafting patterns, cutting and finishing to a professional standard.",
    "The technical base under Ghana's fashion and textiles industry.",
    [yt("Pattern drafting and sewing tutorials", "Professor Pincushion", "https://www.youtube.com/@ProfessorPincushion")],
  ),
  skill(
    "hospitality-operations",
    "Hospitality operations",
    "Front office, housekeeping, food and beverage service standards.",
    "Tourism is a major foreign-exchange earner and hires continuously.",
    [free("Hospitality and tourism learning resources", "UN Tourism Academy", "https://www.unwto.org/academy")],
  ),
  skill(
    "food-safety",
    "Food safety & HACCP",
    "Hazard analysis and safe handling through the food chain.",
    "Required by the Food and Drugs Authority for food businesses.",
    [{ title: "Food safety guidelines", provider: "Food and Drugs Authority, Ghana", url: "https://fdaghana.gov.gh/", type: "Reading", cost: "Free" }],
  ),
  skill(
    "agronomy",
    "Agronomy & crop production",
    "Soils, seed, spacing, nutrition and pest management for real yields.",
    "Agriculture remains one of Ghana's largest employers.",
    [free("Agriculture e-learning", "FAO elearning Academy", "https://elearning.fao.org/")],
  ),
  skill(
    "agribusiness",
    "Agribusiness & value chains",
    "Costing, aggregation, storage, processing and getting produce to market.",
    "Where most of the margin in Ghanaian agriculture actually sits.",
    [free("Agribusiness and value chain courses", "FAO elearning Academy", "https://elearning.fao.org/")],
  ),
  skill(
    "environmental-assessment",
    "Environmental impact assessment",
    "Screening, scoping and reporting the environmental effect of a project.",
    "EPA Ghana permitting requires it for mining, energy and construction projects.",
    [{ title: "EIA procedures and permitting", provider: "Environmental Protection Agency, Ghana", url: "https://epa.gov.gh/", type: "Reading", cost: "Free" }],
  ),
  skill(
    "psych-assessment",
    "Psychological assessment & counselling skills",
    "Structured interviewing, standardised tools and ethical reporting.",
    "Regulated practice under the Ghana Psychology Council.",
    [free("Introduction to Psychology", "Yale University (Coursera, audit free)", "https://www.coursera.org/learn/introduction-psychology")],
  ),

  /* --- Ghana-specific industry knowledge --- */
  skill(
    "gh-regulators",
    "Ghanaian regulators & licensure",
    "Which body licenses your profession, and what it requires after graduation.",
    "A degree alone rarely lets you practise — the council licence does.",
    [
      { title: "Accredited institutions and programmes", provider: "Ghana Tertiary Education Commission (GTEC)", url: "https://gtec.edu.gh/", type: "Reading", cost: "Free" },
      { title: "Professional councils directory", provider: "GhanaPathFinder", url: "/professional-councils", type: "Reading", cost: "Free" },
    ],
  ),
  skill(
    "gh-financial-sector",
    "Ghana's financial sector rules",
    "Bank of Ghana directives, SEC rules and how local institutions are supervised.",
    "Interviewers in banking expect you to know who regulates what.",
    [{ title: "Notices, directives and sector reports", provider: "Bank of Ghana", url: "https://www.bog.gov.gh/", type: "Reading", cost: "Free" }],
  ),
  skill(
    "gh-health-system",
    "Ghana's health system",
    "How GHS facilities, NHIS and referral levels fit together.",
    "Context you are expected to have from day one of clinical placement.",
    [{ title: "Service structure and reports", provider: "Ghana Health Service", url: "https://ghs.gov.gh/", type: "Reading", cost: "Free" }],
  ),
  skill(
    "gh-education-system",
    "Ghana's education system & curriculum",
    "The standards-based curriculum, GES structure and NTC licensing.",
    "Directly examined in teacher licensure.",
    [{ title: "Curriculum and service information", provider: "Ghana Education Service / NaCCA", url: "https://ges.gov.gh/", type: "Reading", cost: "Free" }],
  ),
  skill(
    "gh-construction-standards",
    "Ghanaian building & procurement standards",
    "Building regulations, permitting and public procurement practice.",
    "Determines whether a design can actually be built and paid for.",
    [{ title: "Public procurement rules", provider: "Public Procurement Authority, Ghana", url: "https://ppa.gov.gh/", type: "Reading", cost: "Free" }],
  ),
  skill(
    "gh-mining-energy",
    "Ghana's mining & energy sector",
    "Licensing, local content rules and the main operators.",
    "Shapes the internships and graduate schemes available.",
    [{ title: "Local content and petroleum regulation", provider: "Petroleum Commission Ghana / Minerals Commission", url: "https://www.petrocom.gov.gh/", type: "Reading", cost: "Free" }],
  ),
];


/* Additional cross-industry skills with direct learning references. */
const EXTRA_SKILLS: Skill[] = [
  { id: "typescript", name: "TypeScript", category: "technical", summary: "Practical knowledge and repeatable methods for typescript.", why: "Useful for learners building career-ready capability in typescript.", resources: [{ title: "TypeScript learning reference", provider: "TypeScript", url: "https://www.typescriptlang.org/docs/", type: "Docs", cost: "Free" }] },
  { id: "react-components", name: "React component design", category: "technical", summary: "Practical knowledge and repeatable methods for react component design.", why: "Useful for learners building career-ready capability in react component design.", resources: [{ title: "React component design learning reference", provider: "React", url: "https://react.dev/learn", type: "Docs", cost: "Free" }] },
  { id: "react-state-management", name: "React state management", category: "technical", summary: "Practical knowledge and repeatable methods for react state management.", why: "Useful for learners building career-ready capability in react state management.", resources: [{ title: "React state management learning reference", provider: "React", url: "https://react.dev/learn/managing-state", type: "Docs", cost: "Free" }] },
  { id: "web-accessibility", name: "Web accessibility", category: "technical", summary: "Practical knowledge and repeatable methods for web accessibility.", why: "Useful for learners building career-ready capability in web accessibility.", resources: [{ title: "Web accessibility learning reference", provider: "W3C WAI", url: "https://www.w3.org/WAI/fundamentals/accessibility-intro/", type: "Docs", cost: "Free" }] },
  { id: "html-semantics", name: "Semantic HTML", category: "technical", summary: "Practical knowledge and repeatable methods for semantic html.", why: "Useful for learners building career-ready capability in semantic html.", resources: [{ title: "Semantic HTML learning reference", provider: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html", type: "Docs", cost: "Free" }] },
  { id: "css-layout", name: "CSS layout", category: "technical", summary: "Practical knowledge and repeatable methods for css layout.", why: "Useful for learners building career-ready capability in css layout.", resources: [{ title: "CSS layout learning reference", provider: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout", type: "Docs", cost: "Free" }] },
  { id: "web-performance", name: "Web performance optimisation", category: "technical", summary: "Practical knowledge and repeatable methods for web performance optimisation.", why: "Useful for learners building career-ready capability in web performance optimisation.", resources: [{ title: "Web performance optimisation learning reference", provider: "web.dev", url: "https://web.dev/learn/performance/", type: "Docs", cost: "Free" }] },
  { id: "http-fundamentals", name: "HTTP fundamentals", category: "foundation", summary: "Practical knowledge and repeatable methods for http fundamentals.", why: "Useful for learners building career-ready capability in http fundamentals.", resources: [{ title: "HTTP fundamentals learning reference", provider: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview", type: "Docs", cost: "Free" }] },
  { id: "rest-api-design", name: "REST API design", category: "technical", summary: "Practical knowledge and repeatable methods for rest api design.", why: "Useful for learners building career-ready capability in rest api design.", resources: [{ title: "REST API design learning reference", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design", type: "Docs", cost: "Free" }] },
  { id: "api-authentication", name: "API authentication", category: "technical", summary: "Practical knowledge and repeatable methods for api authentication.", why: "Useful for learners building career-ready capability in api authentication.", resources: [{ title: "API authentication learning reference", provider: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication", type: "Docs", cost: "Free" }] },
  { id: "postgresql-query-planning", name: "PostgreSQL query planning", category: "technical", summary: "Practical knowledge and repeatable methods for postgresql query planning.", why: "Useful for learners building career-ready capability in postgresql query planning.", resources: [{ title: "PostgreSQL query planning learning reference", provider: "PostgreSQL", url: "https://www.postgresql.org/docs/current/using-explain.html", type: "Docs", cost: "Free" }] },
  { id: "postgresql-indexing", name: "PostgreSQL indexing", category: "technical", summary: "Practical knowledge and repeatable methods for postgresql indexing.", why: "Useful for learners building career-ready capability in postgresql indexing.", resources: [{ title: "PostgreSQL indexing learning reference", provider: "PostgreSQL", url: "https://www.postgresql.org/docs/current/indexes.html", type: "Docs", cost: "Free" }] },
  { id: "database-normalisation", name: "Database normalisation", category: "technical", summary: "Practical knowledge and repeatable methods for database normalisation.", why: "Useful for learners building career-ready capability in database normalisation.", resources: [{ title: "Database normalisation learning reference", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/office/troubleshoot/access/database-normalization-description", type: "Docs", cost: "Free" }] },
  { id: "database-migrations", name: "Database schema migrations", category: "technical", summary: "Practical knowledge and repeatable methods for database schema migrations.", why: "Useful for learners building career-ready capability in database schema migrations.", resources: [{ title: "Database schema migrations learning reference", provider: "Supabase", url: "https://supabase.com/docs/guides/deployment/database-migrations", type: "Docs", cost: "Free" }] },
  { id: "row-level-security", name: "Row-level security", category: "industry", summary: "Practical knowledge and repeatable methods for row-level security.", why: "Useful for learners building career-ready capability in row-level security.", resources: [{ title: "Row-level security learning reference", provider: "Supabase", url: "https://supabase.com/docs/guides/database/postgres/row-level-security", type: "Docs", cost: "Free" }] },
  { id: "git-branching", name: "Git branching and merging", category: "tools", summary: "Practical knowledge and repeatable methods for git branching and merging.", why: "Useful for learners building career-ready capability in git branching and merging.", resources: [{ title: "Git branching and merging learning reference", provider: "Git", url: "https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell", type: "Docs", cost: "Free" }] },
  { id: "code-review", name: "Code review", category: "soft", summary: "Practical knowledge and repeatable methods for code review.", why: "Useful for learners building career-ready capability in code review.", resources: [{ title: "Code review learning reference", provider: "Google Engineering Practices", url: "https://google.github.io/eng-practices/review/", type: "Docs", cost: "Free" }] },
  { id: "unit-testing", name: "Unit testing", category: "technical", summary: "Practical knowledge and repeatable methods for unit testing.", why: "Useful for learners building career-ready capability in unit testing.", resources: [{ title: "Unit testing learning reference", provider: "Vitest", url: "https://vitest.dev/guide/", type: "Docs", cost: "Free" }] },
  { id: "end-to-end-testing", name: "End-to-end testing", category: "technical", summary: "Practical knowledge and repeatable methods for end-to-end testing.", why: "Useful for learners building career-ready capability in end-to-end testing.", resources: [{ title: "End-to-end testing learning reference", provider: "Playwright", url: "https://playwright.dev/docs/intro", type: "Docs", cost: "Free" }] },
  { id: "continuous-integration", name: "Continuous integration", category: "tools", summary: "Practical knowledge and repeatable methods for continuous integration.", why: "Useful for learners building career-ready capability in continuous integration.", resources: [{ title: "Continuous integration learning reference", provider: "GitHub", url: "https://docs.github.com/en/actions/about-github-actions", type: "Docs", cost: "Free" }] },
  { id: "containerisation", name: "Containerisation with Docker", category: "tools", summary: "Practical knowledge and repeatable methods for containerisation with docker.", why: "Useful for learners building career-ready capability in containerisation with docker.", resources: [{ title: "Containerisation with Docker learning reference", provider: "Docker", url: "https://docs.docker.com/get-started/", type: "Docs", cost: "Free" }] },
  { id: "kubernetes-basics", name: "Kubernetes fundamentals", category: "tools", summary: "Practical knowledge and repeatable methods for kubernetes fundamentals.", why: "Useful for learners building career-ready capability in kubernetes fundamentals.", resources: [{ title: "Kubernetes fundamentals learning reference", provider: "Kubernetes", url: "https://kubernetes.io/docs/tutorials/kubernetes-basics/", type: "Docs", cost: "Free" }] },
  { id: "linux-command-line", name: "Linux command line", category: "tools", summary: "Practical knowledge and repeatable methods for linux command line.", why: "Useful for learners building career-ready capability in linux command line.", resources: [{ title: "Linux command line learning reference", provider: "Ubuntu", url: "https://ubuntu.com/tutorials/command-line-for-beginners", type: "Docs", cost: "Free" }] },
  { id: "bash-scripting", name: "Bash scripting", category: "technical", summary: "Practical knowledge and repeatable methods for bash scripting.", why: "Useful for learners building career-ready capability in bash scripting.", resources: [{ title: "Bash scripting learning reference", provider: "GNU Bash", url: "https://www.gnu.org/software/bash/manual/", type: "Docs", cost: "Free" }] },
  { id: "python-testing", name: "Python testing", category: "technical", summary: "Practical knowledge and repeatable methods for python testing.", why: "Useful for learners building career-ready capability in python testing.", resources: [{ title: "Python testing learning reference", provider: "pytest", url: "https://docs.pytest.org/en/stable/", type: "Docs", cost: "Free" }] },
  { id: "python-type-hints", name: "Python type hints", category: "technical", summary: "Practical knowledge and repeatable methods for python type hints.", why: "Useful for learners building career-ready capability in python type hints.", resources: [{ title: "Python type hints learning reference", provider: "Python", url: "https://docs.python.org/3/library/typing.html", type: "Docs", cost: "Free" }] },
  { id: "sql-joins", name: "SQL joins", category: "technical", summary: "Practical knowledge and repeatable methods for sql joins.", why: "Useful for learners building career-ready capability in sql joins.", resources: [{ title: "SQL joins learning reference", provider: "PostgreSQL", url: "https://www.postgresql.org/docs/current/queries-table-expressions.html", type: "Docs", cost: "Free" }] },
  { id: "data-cleaning", name: "Data cleaning", category: "technical", summary: "Practical knowledge and repeatable methods for data cleaning.", why: "Useful for learners building career-ready capability in data cleaning.", resources: [{ title: "Data cleaning learning reference", provider: "pandas", url: "https://pandas.pydata.org/docs/user_guide/missing_data.html", type: "Docs", cost: "Free" }] },
  { id: "exploratory-data-analysis", name: "Exploratory data analysis", category: "technical", summary: "Practical knowledge and repeatable methods for exploratory data analysis.", why: "Useful for learners building career-ready capability in exploratory data analysis.", resources: [{ title: "Exploratory data analysis learning reference", provider: "pandas", url: "https://pandas.pydata.org/docs/getting_started/intro_tutorials/", type: "Docs", cost: "Free" }] },
  { id: "data-visualisation", name: "Data visualisation", category: "technical", summary: "Practical knowledge and repeatable methods for data visualisation.", why: "Useful for learners building career-ready capability in data visualisation.", resources: [{ title: "Data visualisation learning reference", provider: "Matplotlib", url: "https://matplotlib.org/stable/tutorials/", type: "Docs", cost: "Free" }] },
  { id: "statistical-inference", name: "Statistical inference", category: "foundation", summary: "Practical knowledge and repeatable methods for statistical inference.", why: "Useful for learners building career-ready capability in statistical inference.", resources: [{ title: "Statistical inference learning reference", provider: "OpenIntro", url: "https://www.openintro.org/book/os/", type: "Docs", cost: "Free" }] },
  { id: "probability-modelling", name: "Probability modelling", category: "foundation", summary: "Practical knowledge and repeatable methods for probability modelling.", why: "Useful for learners building career-ready capability in probability modelling.", resources: [{ title: "Probability modelling learning reference", provider: "Brown University", url: "https://seeing-theory.brown.edu/", type: "Docs", cost: "Free" }] },
  { id: "linear-regression", name: "Linear regression", category: "technical", summary: "Practical knowledge and repeatable methods for linear regression.", why: "Useful for learners building career-ready capability in linear regression.", resources: [{ title: "Linear regression learning reference", provider: "scikit-learn", url: "https://scikit-learn.org/stable/modules/linear_model.html", type: "Docs", cost: "Free" }] },
  { id: "classification-models", name: "Classification models", category: "technical", summary: "Practical knowledge and repeatable methods for classification models.", why: "Useful for learners building career-ready capability in classification models.", resources: [{ title: "Classification models learning reference", provider: "scikit-learn", url: "https://scikit-learn.org/stable/supervised_learning.html", type: "Docs", cost: "Free" }] },
  { id: "model-validation", name: "Machine learning model validation", category: "advanced", summary: "Practical knowledge and repeatable methods for machine learning model validation.", why: "Useful for learners building career-ready capability in machine learning model validation.", resources: [{ title: "Machine learning model validation learning reference", provider: "scikit-learn", url: "https://scikit-learn.org/stable/modules/cross_validation.html", type: "Docs", cost: "Free" }] },
  { id: "feature-engineering", name: "Feature engineering", category: "advanced", summary: "Practical knowledge and repeatable methods for feature engineering.", why: "Useful for learners building career-ready capability in feature engineering.", resources: [{ title: "Feature engineering learning reference", provider: "scikit-learn", url: "https://scikit-learn.org/stable/modules/preprocessing.html", type: "Docs", cost: "Free" }] },
  { id: "neural-network-training", name: "Neural network training", category: "advanced", summary: "Practical knowledge and repeatable methods for neural network training.", why: "Useful for learners building career-ready capability in neural network training.", resources: [{ title: "Neural network training learning reference", provider: "PyTorch", url: "https://pytorch.org/tutorials/beginner/basics/intro.html", type: "Docs", cost: "Free" }] },
  { id: "deep-learning-optimisation", name: "Deep learning optimisation", category: "advanced", summary: "Practical knowledge and repeatable methods for deep learning optimisation.", why: "Useful for learners building career-ready capability in deep learning optimisation.", resources: [{ title: "Deep learning optimisation learning reference", provider: "TensorFlow", url: "https://www.tensorflow.org/guide/keras/working_with_rnns", type: "Docs", cost: "Free" }] },
  { id: "computer-vision-image-classification", name: "Image classification", category: "advanced", summary: "Practical knowledge and repeatable methods for image classification.", why: "Useful for learners building career-ready capability in image classification.", resources: [{ title: "Image classification learning reference", provider: "PyTorch", url: "https://pytorch.org/tutorials/beginner/blitz/cifar10_tutorial.html", type: "Docs", cost: "Free" }] },
  { id: "natural-language-processing", name: "Natural language processing", category: "advanced", summary: "Practical knowledge and repeatable methods for natural language processing.", why: "Useful for learners building career-ready capability in natural language processing.", resources: [{ title: "Natural language processing learning reference", provider: "Hugging Face", url: "https://huggingface.co/learn/nlp-course/chapter1/1", type: "Docs", cost: "Free" }] },
  { id: "llm-evaluation", name: "Large language model evaluation", category: "advanced", summary: "Practical knowledge and repeatable methods for large language model evaluation.", why: "Useful for learners building career-ready capability in large language model evaluation.", resources: [{ title: "Large language model evaluation learning reference", provider: "Hugging Face", url: "https://huggingface.co/docs/evaluate/index", type: "Docs", cost: "Free" }] },
  { id: "retrieval-augmented-generation", name: "Retrieval-augmented generation", category: "advanced", summary: "Practical knowledge and repeatable methods for retrieval-augmented generation.", why: "Useful for learners building career-ready capability in retrieval-augmented generation.", resources: [{ title: "Retrieval-augmented generation learning reference", provider: "LangChain", url: "https://python.langchain.com/docs/tutorials/rag/", type: "Docs", cost: "Free" }] },
  { id: "data-privacy-basics", name: "Data privacy fundamentals", category: "industry", summary: "Practical knowledge and repeatable methods for data privacy fundamentals.", why: "Useful for learners building career-ready capability in data privacy fundamentals.", resources: [{ title: "Data privacy fundamentals learning reference", provider: "European Data Protection Board", url: "https://www.edpb.europa.eu/sme-data-protection-guide_en", type: "Docs", cost: "Free" }] },
  { id: "threat-modelling", name: "Threat modelling", category: "advanced", summary: "Practical knowledge and repeatable methods for threat modelling.", why: "Useful for learners building career-ready capability in threat modelling.", resources: [{ title: "Threat modelling learning reference", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool", type: "Docs", cost: "Free" }] },
  { id: "secure-coding", name: "Secure coding practices", category: "industry", summary: "Practical knowledge and repeatable methods for secure coding practices.", why: "Useful for learners building career-ready capability in secure coding practices.", resources: [{ title: "Secure coding practices learning reference", provider: "OWASP", url: "https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/", type: "Docs", cost: "Free" }] },
  { id: "web-application-security", name: "Web application security", category: "technical", summary: "Practical knowledge and repeatable methods for web application security.", why: "Useful for learners building career-ready capability in web application security.", resources: [{ title: "Web application security learning reference", provider: "OWASP", url: "https://owasp.org/www-project-top-ten/", type: "Docs", cost: "Free" }] },
  { id: "incident-response", name: "Security incident response", category: "industry", summary: "Practical knowledge and repeatable methods for security incident response.", why: "Useful for learners building career-ready capability in security incident response.", resources: [{ title: "Security incident response learning reference", provider: "CISA", url: "https://www.cisa.gov/topics/cyber-threats-and-advisories/incident-response", type: "Docs", cost: "Free" }] },
  { id: "network-protocol-analysis", name: "Network protocol analysis", category: "technical", summary: "Practical knowledge and repeatable methods for network protocol analysis.", why: "Useful for learners building career-ready capability in network protocol analysis.", resources: [{ title: "Network protocol analysis learning reference", provider: "Wireshark", url: "https://www.wireshark.org/docs/", type: "Docs", cost: "Free" }] },
  { id: "cloud-iam", name: "Cloud identity and access management", category: "industry", summary: "Practical knowledge and repeatable methods for cloud identity and access management.", why: "Useful for learners building career-ready capability in cloud identity and access management.", resources: [{ title: "Cloud identity and access management learning reference", provider: "AWS", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html", type: "Docs", cost: "Free" }] },
  { id: "cloud-cost-management", name: "Cloud cost management", category: "tools", summary: "Practical knowledge and repeatable methods for cloud cost management.", why: "Useful for learners building career-ready capability in cloud cost management.", resources: [{ title: "Cloud cost management learning reference", provider: "Microsoft Learn", url: "https://learn.microsoft.com/en-us/azure/cost-management-billing/", type: "Docs", cost: "Free" }] },
  { id: "infrastructure-as-code", name: "Infrastructure as code", category: "tools", summary: "Practical knowledge and repeatable methods for infrastructure as code.", why: "Useful for learners building career-ready capability in infrastructure as code.", resources: [{ title: "Infrastructure as code learning reference", provider: "HashiCorp", url: "https://developer.hashicorp.com/terraform/tutorials", type: "Docs", cost: "Free" }] },
  { id: "observability", name: "Application observability", category: "technical", summary: "Practical knowledge and repeatable methods for application observability.", why: "Useful for learners building career-ready capability in application observability.", resources: [{ title: "Application observability learning reference", provider: "OpenTelemetry", url: "https://opentelemetry.io/docs/", type: "Docs", cost: "Free" }] },
  { id: "distributed-systems", name: "Distributed systems fundamentals", category: "advanced", summary: "Practical knowledge and repeatable methods for distributed systems fundamentals.", why: "Useful for learners building career-ready capability in distributed systems fundamentals.", resources: [{ title: "Distributed systems fundamentals learning reference", provider: "Martin Kleppmann", url: "https://martin.kleppmann.com/", type: "Docs", cost: "Free" }] },
  { id: "system-design", name: "System design", category: "advanced", summary: "Practical knowledge and repeatable methods for system design.", why: "Useful for learners building career-ready capability in system design.", resources: [{ title: "System design learning reference", provider: "System Design Primer", url: "https://github.com/donnemartin/system-design-primer", type: "Docs", cost: "Free" }] },
  { id: "requirements-engineering", name: "Requirements engineering", category: "technical", summary: "Practical knowledge and repeatable methods for requirements engineering.", why: "Useful for learners building career-ready capability in requirements engineering.", resources: [{ title: "Requirements engineering learning reference", provider: "SEBoK", url: "https://www.sebokwiki.org/wiki/Requirements_Engineering", type: "Docs", cost: "Free" }] },
  { id: "product-analytics", name: "Product analytics", category: "technical", summary: "Practical knowledge and repeatable methods for product analytics.", why: "Useful for learners building career-ready capability in product analytics.", resources: [{ title: "Product analytics learning reference", provider: "Amplitude", url: "https://amplitude.com/docs", type: "Docs", cost: "Free" }] },
  { id: "ab-testing", name: "A/B testing", category: "advanced", summary: "Practical knowledge and repeatable methods for a/b testing.", why: "Useful for learners building career-ready capability in a/b testing.", resources: [{ title: "A/B testing learning reference", provider: "Optimizely", url: "https://www.optimizely.com/optimization-glossary/ab-testing/", type: "Docs", cost: "Free" }] },
  { id: "user-interviewing", name: "User interviewing", category: "soft", summary: "Practical knowledge and repeatable methods for user interviewing.", why: "Useful for learners building career-ready capability in user interviewing.", resources: [{ title: "User interviewing learning reference", provider: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/user-interviews/", type: "Docs", cost: "Free" }] },
  { id: "usability-testing", name: "Usability testing", category: "technical", summary: "Practical knowledge and repeatable methods for usability testing.", why: "Useful for learners building career-ready capability in usability testing.", resources: [{ title: "Usability testing learning reference", provider: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/usability-testing-101/", type: "Docs", cost: "Free" }] },
  { id: "service-blueprinting", name: "Service blueprinting", category: "technical", summary: "Practical knowledge and repeatable methods for service blueprinting.", why: "Useful for learners building career-ready capability in service blueprinting.", resources: [{ title: "Service blueprinting learning reference", provider: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/service-blueprints-definition/", type: "Docs", cost: "Free" }] },
  { id: "data-storytelling", name: "Data storytelling", category: "soft", summary: "Practical knowledge and repeatable methods for data storytelling.", why: "Useful for learners building career-ready capability in data storytelling.", resources: [{ title: "Data storytelling learning reference", provider: "Storytelling with Data", url: "https://www.storytellingwithdata.com/", type: "Docs", cost: "Free" }] },
  { id: "project-risk-management", name: "Project risk management", category: "industry", summary: "Practical knowledge and repeatable methods for project risk management.", why: "Useful for learners building career-ready capability in project risk management.", resources: [{ title: "Project risk management learning reference", provider: "Project Management Institute", url: "https://www.pmi.org/learning/library/risk-management-projects-7070", type: "Docs", cost: "Free" }] },
  { id: "cash-flow-forecasting", name: "Cash-flow forecasting", category: "technical", summary: "Practical knowledge and repeatable methods for cash-flow forecasting.", why: "Useful for learners building career-ready capability in cash-flow forecasting.", resources: [{ title: "Cash-flow forecasting learning reference", provider: "U.S. Small Business Administration", url: "https://www.sba.gov/business-guide/manage-your-business/manage-your-finances", type: "Docs", cost: "Free" }] },
  { id: "market-sizing", name: "Market sizing", category: "technical", summary: "Practical knowledge and repeatable methods for market sizing.", why: "Useful for learners building career-ready capability in market sizing.", resources: [{ title: "Market sizing learning reference", provider: "Y Combinator", url: "https://www.ycombinator.com/library", type: "Docs", cost: "Free" }] },
  { id: "customer-discovery", name: "Customer discovery", category: "soft", summary: "Practical knowledge and repeatable methods for customer discovery.", why: "Useful for learners building career-ready capability in customer discovery.", resources: [{ title: "Customer discovery learning reference", provider: "Strategyzer", url: "https://www.strategyzer.com/library", type: "Docs", cost: "Free" }] },
  { id: "negotiation-planning", name: "Negotiation planning", category: "soft", summary: "Practical knowledge and repeatable methods for negotiation planning.", why: "Useful for learners building career-ready capability in negotiation planning.", resources: [{ title: "Negotiation planning learning reference", provider: "Harvard Program on Negotiation", url: "https://www.pon.harvard.edu/daily/negotiation-skills-daily/", type: "Docs", cost: "Free" }] },
  { id: "grant-proposal-writing", name: "Grant proposal writing", category: "soft", summary: "Practical knowledge and repeatable methods for grant proposal writing.", why: "Useful for learners building career-ready capability in grant proposal writing.", resources: [{ title: "Grant proposal writing learning reference", provider: "Grants.gov", url: "https://www.grants.gov/learn-grants/grant-writing-basics.html", type: "Docs", cost: "Free" }] },
  { id: "monitoring-and-evaluation", name: "Monitoring and evaluation", category: "industry", summary: "Practical knowledge and repeatable methods for monitoring and evaluation.", why: "Useful for learners building career-ready capability in monitoring and evaluation.", resources: [{ title: "Monitoring and evaluation learning reference", provider: "BetterEvaluation", url: "https://www.betterevaluation.org/", type: "Docs", cost: "Free" }] },
  { id: "research-ethics", name: "Research ethics", category: "industry", summary: "Practical knowledge and repeatable methods for research ethics.", why: "Useful for learners building career-ready capability in research ethics.", resources: [{ title: "Research ethics learning reference", provider: "World Health Organization", url: "https://www.who.int/teams/health-ethics-governance", type: "Docs", cost: "Free" }] },
  { id: "survey-design", name: "Survey design", category: "technical", summary: "Practical knowledge and repeatable methods for survey design.", why: "Useful for learners building career-ready capability in survey design.", resources: [{ title: "Survey design learning reference", provider: "Pew Research Center", url: "https://www.pewresearch.org/methods/", type: "Docs", cost: "Free" }] },
  { id: "qualitative-coding", name: "Qualitative data coding", category: "technical", summary: "Practical knowledge and repeatable methods for qualitative data coding.", why: "Useful for learners building career-ready capability in qualitative data coding.", resources: [{ title: "Qualitative data coding learning reference", provider: "BetterEvaluation", url: "https://www.betterevaluation.org/methods-approaches/methods/qualitative-data-analysis", type: "Docs", cost: "Free" }] },
  { id: "gis-spatial-analysis", name: "GIS spatial analysis", category: "technical", summary: "Practical knowledge and repeatable methods for gis spatial analysis.", why: "Useful for learners building career-ready capability in gis spatial analysis.", resources: [{ title: "GIS spatial analysis learning reference", provider: "QGIS", url: "https://www.qgis.org/en/docs/index.html", type: "Docs", cost: "Free" }] },
  { id: "remote-sensing", name: "Remote sensing", category: "technical", summary: "Practical knowledge and repeatable methods for remote sensing.", why: "Useful for learners building career-ready capability in remote sensing.", resources: [{ title: "Remote sensing learning reference", provider: "NASA Earthdata", url: "https://www.earthdata.nasa.gov/learn", type: "Docs", cost: "Free" }] },
  { id: "climate-risk-assessment", name: "Climate risk assessment", category: "industry", summary: "Practical knowledge and repeatable methods for climate risk assessment.", why: "Useful for learners building career-ready capability in climate risk assessment.", resources: [{ title: "Climate risk assessment learning reference", provider: "IPCC", url: "https://www.ipcc.ch/reports/", type: "Docs", cost: "Free" }] },
  { id: "environmental-impact-assessment", name: "Environmental impact assessment", category: "industry", summary: "Practical knowledge and repeatable methods for environmental impact assessment.", why: "Useful for learners building career-ready capability in environmental impact assessment.", resources: [{ title: "Environmental impact assessment learning reference", provider: "International Finance Corporation", url: "https://www.ifc.org/en/insights-reports/2012/ifc-performance-standards", type: "Docs", cost: "Free" }] },
  { id: "food-safety-management", name: "Food safety management", category: "industry", summary: "Practical knowledge and repeatable methods for food safety management.", why: "Useful for learners building career-ready capability in food safety management.", resources: [{ title: "Food safety management learning reference", provider: "FAO", url: "https://www.fao.org/food-safety/en/", type: "Docs", cost: "Free" }] },
  { id: "occupational-health-and-safety", name: "Occupational health and safety", category: "industry", summary: "Practical knowledge and repeatable methods for occupational health and safety.", why: "Useful for learners building career-ready capability in occupational health and safety.", resources: [{ title: "Occupational health and safety learning reference", provider: "International Labour Organization", url: "https://www.ilo.org/topics-and-sectors/safety-and-health-work", type: "Docs", cost: "Free" }] },
  { id: "supply-chain-forecasting", name: "Supply chain forecasting", category: "technical", summary: "Practical knowledge and repeatable methods for supply chain forecasting.", why: "Useful for learners building career-ready capability in supply chain forecasting.", resources: [{ title: "Supply chain forecasting learning reference", provider: "NC State", url: "https://scm.ncsu.edu/scm-articles/article/what-is-supply-chain-management", type: "Docs", cost: "Free" }] },
  { id: "inventory-management", name: "Inventory management", category: "industry", summary: "Practical knowledge and repeatable methods for inventory management.", why: "Useful for learners building career-ready capability in inventory management.", resources: [{ title: "Inventory management learning reference", provider: "ASCM", url: "https://www.ascm.org/learning-development/", type: "Docs", cost: "Free" }] },
  { id: "procurement-compliance", name: "Procurement compliance", category: "industry", summary: "Practical knowledge and repeatable methods for procurement compliance.", why: "Useful for learners building career-ready capability in procurement compliance.", resources: [{ title: "Procurement compliance learning reference", provider: "Public Procurement Authority Ghana", url: "https://ppa.gov.gh/", type: "Docs", cost: "Free" }] },
  { id: "digital-marketing-analytics", name: "Digital marketing analytics", category: "tools", summary: "Practical knowledge and repeatable methods for digital marketing analytics.", why: "Useful for learners building career-ready capability in digital marketing analytics.", resources: [{ title: "Digital marketing analytics learning reference", provider: "Google Analytics", url: "https://support.google.com/analytics/answer/10089681", type: "Docs", cost: "Free" }] },
  { id: "search-engine-optimisation", name: "Search engine optimisation", category: "technical", summary: "Practical knowledge and repeatable methods for search engine optimisation.", why: "Useful for learners building career-ready capability in search engine optimisation.", resources: [{ title: "Search engine optimisation learning reference", provider: "Google Search Central", url: "https://developers.google.com/search/docs/fundamentals/seo-starter-guide", type: "Docs", cost: "Free" }] },
  { id: "email-campaign-measurement", name: "Email campaign measurement", category: "technical", summary: "Practical knowledge and repeatable methods for email campaign measurement.", why: "Useful for learners building career-ready capability in email campaign measurement.", resources: [{ title: "Email campaign measurement learning reference", provider: "Mailchimp", url: "https://mailchimp.com/resources/email-marketing-field-guide/", type: "Docs", cost: "Free" }] },
  { id: "brand-positioning", name: "Brand positioning", category: "technical", summary: "Practical knowledge and repeatable methods for brand positioning.", why: "Useful for learners building career-ready capability in brand positioning.", resources: [{ title: "Brand positioning learning reference", provider: "American Marketing Association", url: "https://www.ama.org/topics/branding/", type: "Docs", cost: "Free" }] },
  { id: "content-strategy", name: "Content strategy", category: "technical", summary: "Practical knowledge and repeatable methods for content strategy.", why: "Useful for learners building career-ready capability in content strategy.", resources: [{ title: "Content strategy learning reference", provider: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/content-strategy/", type: "Docs", cost: "Free" }] },
  { id: "translation-quality-review", name: "Translation quality review", category: "technical", summary: "Practical knowledge and repeatable methods for translation quality review.", why: "Useful for learners building career-ready capability in translation quality review.", resources: [{ title: "Translation quality review learning reference", provider: "American Translators Association", url: "https://www.atanet.org/client-assistance/what-is-translation/", type: "Docs", cost: "Free" }] },
  { id: "accessibility-auditing", name: "Accessibility auditing", category: "technical", summary: "Practical knowledge and repeatable methods for accessibility auditing.", why: "Useful for learners building career-ready capability in accessibility auditing.", resources: [{ title: "Accessibility auditing learning reference", provider: "W3C WAI", url: "https://www.w3.org/WAI/test-evaluate/", type: "Docs", cost: "Free" }] },
  { id: "inclusive-design", name: "Inclusive design", category: "technical", summary: "Practical knowledge and repeatable methods for inclusive design.", why: "Useful for learners building career-ready capability in inclusive design.", resources: [{ title: "Inclusive design learning reference", provider: "Microsoft", url: "https://www.microsoft.com/design/inclusive/", type: "Docs", cost: "Free" }] },
  { id: "curriculum-mapping", name: "Curriculum mapping", category: "industry", summary: "Practical knowledge and repeatable methods for curriculum mapping.", why: "Useful for learners building career-ready capability in curriculum mapping.", resources: [{ title: "Curriculum mapping learning reference", provider: "AAC&U", url: "https://www.aacu.org/resources", type: "Docs", cost: "Free" }] },
  { id: "learning-outcome-design", name: "Learning outcome design", category: "industry", summary: "Practical knowledge and repeatable methods for learning outcome design.", why: "Useful for learners building career-ready capability in learning outcome design.", resources: [{ title: "Learning outcome design learning reference", provider: "Carnegie Mellon University", url: "https://www.cmu.edu/teaching/designteach/design/learningobjectives.html", type: "Docs", cost: "Free" }] },
  { id: "academic-source-evaluation", name: "Academic source evaluation", category: "foundation", summary: "Practical knowledge and repeatable methods for academic source evaluation.", why: "Useful for learners building career-ready capability in academic source evaluation.", resources: [{ title: "Academic source evaluation learning reference", provider: "Purdue OWL", url: "https://owl.purdue.edu/owl/research_and_citation/conducting_research/evaluating_sources_of_information/index.html", type: "Docs", cost: "Free" }] },
  { id: "citation-management", name: "Citation management", category: "tools", summary: "Practical knowledge and repeatable methods for citation management.", why: "Useful for learners building career-ready capability in citation management.", resources: [{ title: "Citation management learning reference", provider: "Zotero", url: "https://www.zotero.org/support/", type: "Docs", cost: "Free" }] },
  { id: "career-pathway-research", name: "Career pathway research", category: "industry", summary: "Practical knowledge and repeatable methods for career pathway research.", why: "Useful for learners building career-ready capability in career pathway research.", resources: [{ title: "Career pathway research learning reference", provider: "O*NET OnLine", url: "https://www.onetonline.org/", type: "Docs", cost: "Free" }] },
  { id: "scholarship-eligibility-review", name: "Scholarship eligibility review", category: "industry", summary: "Practical knowledge and repeatable methods for scholarship eligibility review.", why: "Useful for learners building career-ready capability in scholarship eligibility review.", resources: [{ title: "Scholarship eligibility review learning reference", provider: "Ghana Scholarships Authority", url: "https://scholarships.gov.gh/opportunities", type: "Docs", cost: "Free" }] },
  { id: "institution-source-verification", name: "Institution source verification", category: "industry", summary: "Practical knowledge and repeatable methods for institution source verification.", why: "Useful for learners building career-ready capability in institution source verification.", resources: [{ title: "Institution source verification learning reference", provider: "Ghana Tertiary Education Commission", url: "https://gtec.edu.gh/", type: "Docs", cost: "Free" }] },
  { id: "programme-catalogue-maintenance", name: "Programme catalogue maintenance", category: "industry", summary: "Practical knowledge and repeatable methods for programme catalogue maintenance.", why: "Useful for learners building career-ready capability in programme catalogue maintenance.", resources: [{ title: "Programme catalogue maintenance learning reference", provider: "Ghana Tertiary Education Commission", url: "https://gtec.edu.gh/", type: "Docs", cost: "Free" }] },
  { id: "image-provenance-review", name: "Image provenance review", category: "industry", summary: "Practical knowledge and repeatable methods for image provenance review.", why: "Useful for learners building career-ready capability in image provenance review.", resources: [{ title: "Image provenance review learning reference", provider: "Google Maps Platform", url: "https://developers.google.com/maps/documentation/places/web-service/place-photos", type: "Docs", cost: "Free" }] },
  { id: "mobile-first-information-architecture", name: "Mobile-first information architecture", category: "technical", summary: "Practical knowledge and repeatable methods for mobile-first information architecture.", why: "Useful for learners building career-ready capability in mobile-first information architecture.", resources: [{ title: "Mobile-first information architecture learning reference", provider: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/mobile-ia/", type: "Docs", cost: "Free" }] },
  { id: "low-bandwidth-web-design", name: "Low-bandwidth web design", category: "technical", summary: "Practical knowledge and repeatable methods for low-bandwidth web design.", why: "Useful for learners building career-ready capability in low-bandwidth web design.", resources: [{ title: "Low-bandwidth web design learning reference", provider: "web.dev", url: "https://web.dev/learn/performance/", type: "Docs", cost: "Free" }] },
  { id: "responsive-image-delivery", name: "Responsive image delivery", category: "technical", summary: "Practical knowledge and repeatable methods for responsive image delivery.", why: "Useful for learners building career-ready capability in responsive image delivery.", resources: [{ title: "Responsive image delivery learning reference", provider: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Multimedia", type: "Docs", cost: "Free" }] },
  { id: "search-relevance-testing", name: "Search relevance testing", category: "technical", summary: "Practical knowledge and repeatable methods for search relevance testing.", why: "Useful for learners building career-ready capability in search relevance testing.", resources: [{ title: "Search relevance testing learning reference", provider: "Elastic", url: "https://www.elastic.co/guide/en/elasticsearch/reference/current/search-relevance.html", type: "Docs", cost: "Free" }] },
  { id: "data-deduplication", name: "Data deduplication", category: "technical", summary: "Practical knowledge and repeatable methods for data deduplication.", why: "Useful for learners building career-ready capability in data deduplication.", resources: [{ title: "Data deduplication learning reference", provider: "PostgreSQL", url: "https://www.postgresql.org/docs/current/ddl-constraints.html", type: "Docs", cost: "Free" }] },
  { id: "data-provenance", name: "Data provenance", category: "industry", summary: "Practical knowledge and repeatable methods for data provenance.", why: "Useful for learners building career-ready capability in data provenance.", resources: [{ title: "Data provenance learning reference", provider: "W3C", url: "https://www.w3.org/TR/prov-overview/", type: "Docs", cost: "Free" }] },
  { id: "data-quality-monitoring", name: "Data quality monitoring", category: "technical", summary: "Practical knowledge and repeatable methods for data quality monitoring.", why: "Useful for learners building career-ready capability in data quality monitoring.", resources: [{ title: "Data quality monitoring learning reference", provider: "Great Expectations", url: "https://docs.greatexpectations.io/", type: "Docs", cost: "Free" }] },
  { id: "database-access-control", name: "Database access control", category: "industry", summary: "Practical knowledge and repeatable methods for database access control.", why: "Useful for learners building career-ready capability in database access control.", resources: [{ title: "Database access control learning reference", provider: "Supabase", url: "https://supabase.com/docs/guides/database/postgres/row-level-security", type: "Docs", cost: "Free" }] },
  { id: "deployment-troubleshooting", name: "Deployment troubleshooting", category: "tools", summary: "Practical knowledge and repeatable methods for deployment troubleshooting.", why: "Useful for learners building career-ready capability in deployment troubleshooting.", resources: [{ title: "Deployment troubleshooting learning reference", provider: "Vercel", url: "https://vercel.com/docs/deployments/troubleshoot-a-build", type: "Docs", cost: "Free" }] },
  { id: "build-pipeline-debugging", name: "Build pipeline debugging", category: "tools", summary: "Practical knowledge and repeatable methods for build pipeline debugging.", why: "Useful for learners building career-ready capability in build pipeline debugging.", resources: [{ title: "Build pipeline debugging learning reference", provider: "GitHub", url: "https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows", type: "Docs", cost: "Free" }] },
  { id: "mobile-accessibility-testing", name: "Mobile accessibility testing", category: "technical", summary: "Practical knowledge and repeatable methods for mobile accessibility testing.", why: "Useful for learners building career-ready capability in mobile accessibility testing.", resources: [{ title: "Mobile accessibility testing learning reference", provider: "W3C WAI", url: "https://www.w3.org/WAI/test-evaluate/", type: "Docs", cost: "Free" }] },
  { id: "api-rate-limit-design", name: "API rate-limit design", category: "technical", summary: "Practical knowledge and repeatable methods for api rate-limit design.", why: "Useful for learners building career-ready capability in api rate-limit design.", resources: [{ title: "API rate-limit design learning reference", provider: "GitHub", url: "https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api", type: "Docs", cost: "Free" }] },
  { id: "secrets-management", name: "Secrets management", category: "industry", summary: "Practical knowledge and repeatable methods for secrets management.", why: "Useful for learners building career-ready capability in secrets management.", resources: [{ title: "Secrets management learning reference", provider: "Vercel", url: "https://vercel.com/docs/environment-variables", type: "Docs", cost: "Free" }] },
  { id: "data-migration-validation", name: "Data migration validation", category: "technical", summary: "Practical knowledge and repeatable methods for data migration validation.", why: "Useful for learners building career-ready capability in data migration validation.", resources: [{ title: "Data migration validation learning reference", provider: "Supabase", url: "https://supabase.com/docs/guides/deployment/database-migrations", type: "Docs", cost: "Free" }] },
  { id: "feature-flag-management", name: "Feature flag management", category: "tools", summary: "Practical knowledge and repeatable methods for feature flag management.", why: "Useful for learners building career-ready capability in feature flag management.", resources: [{ title: "Feature flag management learning reference", provider: "Vercel", url: "https://vercel.com/docs/flags", type: "Docs", cost: "Free" }] },
  { id: "technical-decision-records", name: "Technical decision records", category: "soft", summary: "Practical knowledge and repeatable methods for technical decision records.", why: "Useful for learners building career-ready capability in technical decision records.", resources: [{ title: "Technical decision records learning reference", provider: "ADR GitHub", url: "https://adr.github.io/", type: "Docs", cost: "Free" }] },
  { id: "incident-postmortems", name: "Incident postmortems", category: "soft", summary: "Practical knowledge and repeatable methods for incident postmortems.", why: "Useful for learners building career-ready capability in incident postmortems.", resources: [{ title: "Incident postmortems learning reference", provider: "Google SRE", url: "https://sre.google/sre-book/postmortem-culture/", type: "Docs", cost: "Free" }] },
  { id: "accessibility-content-writing", name: "Accessible content writing", category: "soft", summary: "Practical knowledge and repeatable methods for accessible content writing.", why: "Useful for learners building career-ready capability in accessible content writing.", resources: [{ title: "Accessible content writing learning reference", provider: "W3C WAI", url: "https://www.w3.org/WAI/tips/writing/", type: "Docs", cost: "Free" }] },
  { id: "financial-literacy-education", name: "Financial literacy education", category: "industry", summary: "Practical knowledge and repeatable methods for financial literacy education.", why: "Useful for learners building career-ready capability in financial literacy education.", resources: [{ title: "Financial literacy education learning reference", provider: "Consumer Financial Protection Bureau", url: "https://www.consumerfinance.gov/consumer-tools/educator-tools/", type: "Docs", cost: "Free" }] },
  { id: "professional-networking", name: "Professional networking", category: "soft", summary: "Practical knowledge and repeatable methods for professional networking.", why: "Useful for learners building career-ready capability in professional networking.", resources: [{ title: "Professional networking learning reference", provider: "CareerOneStop", url: "https://www.careeronestop.org/JobSearch/Network/network.aspx", type: "Docs", cost: "Free" }] },
  { id: "portfolio-project-documentation", name: "Portfolio project documentation", category: "soft", summary: "Practical knowledge and repeatable methods for portfolio project documentation.", why: "Useful for learners building career-ready capability in portfolio project documentation.", resources: [{ title: "Portfolio project documentation learning reference", provider: "GitHub Open Source Guides", url: "https://opensource.guide/starting-a-project/", type: "Docs", cost: "Free" }] },
];

const CORE_SKILLS: Skill[] = [...SOFT, ...DOMAIN, ...EXTRA_SKILLS];

const coreSkillIds = new Set(CORE_SKILLS.map((item) => item.id.toLowerCase()));
const coreSkillNames = new Set(CORE_SKILLS.map((item) => item.name.trim().toLowerCase()));

export const SKILLS: Skill[] = [
  ...CORE_SKILLS,
  ...EXPANDED_SKILLS.filter((item) => {
    const id = item.id.toLowerCase();
    const name = item.name.trim().toLowerCase();
    if (coreSkillIds.has(id) || coreSkillNames.has(name)) return false;
    coreSkillIds.add(id);
    coreSkillNames.add(name);
    return true;
  }),
];

export const skillById = (id: string): Skill | undefined => SKILLS.find((s) => s.id === id);

export type CareerSkillMap = Record<SkillCategory, string[]>;

const map = (
  foundation: string[],
  technical: string[],
  tools: string[],
  soft: string[],
  industry: string[],
  advanced: string[],
): CareerSkillMap => ({ foundation, technical, soft, tools, industry, advanced });

/** Keyed by the `major` used in careers.ts / careerPaths.ts. */
export const SKILL_MAPS: Record<string, CareerSkillMap> = {
  "Computer Science": map(
    ["mathematics", "programming-fundamentals", "critical-thinking", "digital-literacy"],
    ["python", "web-development", "databases-sql", "data-structures-algorithms", "machine-learning", "statistics"],
    ["version-control-git", "cloud-computing", "spreadsheets"],
    ["communication", "teamwork", "presentation", "adaptability"],
    ["gh-regulators", "gh-financial-sector"],
    ["deep-learning", "generative-ai", "computer-vision", "nlp", "cybersecurity"],
  ),
  "Data Science & Statistics": map(
    ["mathematics", "statistics", "programming-fundamentals"],
    ["python", "data-analysis", "databases-sql", "machine-learning"],
    ["spreadsheets", "version-control-git", "cloud-computing"],
    ["communication", "presentation", "critical-thinking", "research"],
    ["gh-financial-sector", "gh-health-system"],
    ["deep-learning", "nlp", "generative-ai"],
  ),
  Medicine: map(
    ["scientific-method", "anatomy-physiology", "statistics"],
    ["clinical-skills", "pharmacology", "infection-control", "epidemiology"],
    ["health-informatics", "digital-literacy"],
    ["empathy", "communication", "teamwork", "professional-ethics", "time-management"],
    ["gh-health-system", "gh-regulators"],
    ["research", "data-analysis"],
  ),
  Nursing: map(
    ["anatomy-physiology", "scientific-method", "digital-literacy"],
    ["clinical-skills", "pharmacology", "infection-control"],
    ["health-informatics", "spreadsheets"],
    ["empathy", "communication", "teamwork", "professional-ethics", "adaptability"],
    ["gh-health-system", "gh-regulators"],
    ["epidemiology", "leadership"],
  ),
  Pharmacy: map(
    ["scientific-method", "anatomy-physiology", "mathematics"],
    ["pharmacology", "clinical-skills", "infection-control"],
    ["health-informatics", "spreadsheets"],
    ["communication", "professional-ethics", "customer-service", "empathy"],
    ["gh-health-system", "gh-regulators", "food-safety"],
    ["research", "data-analysis"],
  ),
  "Public Health": map(
    ["statistics", "scientific-method", "research"],
    ["epidemiology", "data-analysis", "infection-control"],
    ["health-informatics", "spreadsheets", "gis"],
    ["communication", "teamwork", "presentation", "leadership"],
    ["gh-health-system", "gh-regulators"],
    ["project-management", "machine-learning"],
  ),
  Engineering: map(
    ["mathematics", "engineering-mechanics", "scientific-method"],
    ["cad", "electronics", "control-automation", "project-management"],
    ["spreadsheets", "digital-literacy", "gis"],
    ["teamwork", "communication", "critical-thinking", "professional-ethics"],
    ["hse", "gh-construction-standards", "gh-mining-energy", "gh-regulators"],
    ["bim-revit", "data-analysis", "leadership"],
  ),
  Architecture: map(
    ["mathematics", "scientific-method", "critical-thinking"],
    ["cad", "bim-revit", "graphic-design", "project-management"],
    ["digital-literacy", "gis"],
    ["presentation", "communication", "negotiation", "teamwork"],
    ["gh-construction-standards", "gh-regulators", "environmental-assessment"],
    ["entrepreneurship", "leadership"],
  ),
  Business: map(
    ["mathematics", "digital-literacy", "technical-writing"],
    ["financial-accounting", "market-research", "project-management", "data-analysis"],
    ["spreadsheets", "digital-marketing"],
    ["communication", "negotiation", "leadership", "teamwork", "time-management"],
    ["taxation-ghana", "gh-financial-sector", "hr-practice"],
    ["financial-modelling", "entrepreneurship"],
  ),
  Accounting: map(
    ["mathematics", "digital-literacy", "technical-writing"],
    ["financial-accounting", "taxation-ghana", "data-analysis"],
    ["spreadsheets", "databases-sql"],
    ["professional-ethics", "communication", "time-management", "critical-thinking"],
    ["gh-financial-sector", "gh-regulators"],
    ["financial-modelling", "cybersecurity"],
  ),
  "Banking & Finance": map(
    ["mathematics", "statistics", "digital-literacy"],
    ["financial-accounting", "financial-modelling", "data-analysis", "economics-analysis"],
    ["spreadsheets", "databases-sql"],
    ["customer-service", "communication", "negotiation", "professional-ethics"],
    ["gh-financial-sector", "taxation-ghana"],
    ["machine-learning", "cybersecurity"],
  ),
  Economics: map(
    ["mathematics", "statistics", "research"],
    ["economics-analysis", "data-analysis", "financial-modelling"],
    ["spreadsheets", "python"],
    ["communication", "presentation", "critical-thinking"],
    ["gh-financial-sector", "taxation-ghana"],
    ["machine-learning", "project-management"],
  ),
  Law: map(
    ["research", "technical-writing", "critical-thinking"],
    ["legal-research", "drafting", "negotiation"],
    ["digital-literacy", "spreadsheets"],
    ["communication", "presentation", "professional-ethics", "time-management"],
    ["gh-regulators", "hr-practice", "gh-financial-sector"],
    ["project-management", "leadership"],
  ),
  Marketing: map(
    ["digital-literacy", "technical-writing", "statistics"],
    ["digital-marketing", "market-research", "graphic-design", "data-analysis"],
    ["spreadsheets", "media-production"],
    ["communication", "presentation", "customer-service", "teamwork"],
    ["gh-financial-sector", "hospitality-operations"],
    ["entrepreneurship", "project-management"],
  ),
  "Human Resource Management": map(
    ["technical-writing", "digital-literacy", "statistics"],
    ["hr-practice", "data-analysis", "project-management"],
    ["spreadsheets", "databases-sql"],
    ["communication", "empathy", "negotiation", "professional-ethics"],
    ["taxation-ghana", "gh-regulators"],
    ["leadership", "entrepreneurship"],
  ),
  Education: map(
    ["technical-writing", "research", "digital-literacy"],
    ["pedagogy", "classroom-management", "presentation"],
    ["spreadsheets", "media-production"],
    ["communication", "empathy", "adaptability", "professional-ethics"],
    ["gh-education-system", "gh-regulators"],
    ["leadership", "data-analysis"],
  ),
  Psychology: map(
    ["statistics", "research", "scientific-method"],
    ["psych-assessment", "data-analysis", "epidemiology"],
    ["spreadsheets", "digital-literacy"],
    ["empathy", "communication", "professional-ethics", "critical-thinking"],
    ["gh-health-system", "gh-regulators"],
    ["research", "project-management"],
  ),
  "Journalism & Media": map(
    ["technical-writing", "research", "digital-literacy"],
    ["journalism-reporting", "media-production", "graphic-design"],
    ["digital-marketing", "spreadsheets"],
    ["communication", "professional-ethics", "adaptability", "time-management"],
    ["gh-regulators", "gh-education-system"],
    ["data-analysis", "entrepreneurship"],
  ),
  "Hospitality & Tourism": map(
    ["digital-literacy", "technical-writing", "mathematics"],
    ["hospitality-operations", "food-safety", "market-research"],
    ["spreadsheets", "digital-marketing"],
    ["customer-service", "communication", "teamwork", "adaptability"],
    ["gh-regulators", "environmental-assessment"],
    ["entrepreneurship", "project-management"],
  ),
  Agriculture: map(
    ["scientific-method", "mathematics", "digital-literacy"],
    ["agronomy", "agribusiness", "data-analysis"],
    ["gis", "spreadsheets"],
    ["teamwork", "communication", "adaptability", "negotiation"],
    ["food-safety", "environmental-assessment", "gh-regulators"],
    ["entrepreneurship", "project-management", "machine-learning"],
  ),
  "Environmental Science": map(
    ["scientific-method", "statistics", "research"],
    ["environmental-assessment", "gis", "data-analysis"],
    ["spreadsheets", "digital-literacy"],
    ["communication", "presentation", "teamwork", "professional-ethics"],
    ["gh-mining-energy", "gh-construction-standards", "gh-regulators"],
    ["project-management", "machine-learning"],
  ),
  "Fashion & Creative Arts": map(
    ["digital-literacy", "critical-thinking", "mathematics"],
    ["fashion-pattern", "graphic-design", "media-production"],
    ["digital-marketing", "spreadsheets"],
    ["communication", "customer-service", "time-management", "adaptability"],
    ["gh-regulators", "hospitality-operations"],
    ["entrepreneurship", "project-management"],
  ),
};

export const skillMapForMajor = (major: string): CareerSkillMap | undefined => SKILL_MAPS[major];

export const majorsUsingSkill = (skillId: string): string[] =>
  Object.entries(SKILL_MAPS)
    .filter(([, m]) => Object.values(m).some((ids) => ids.includes(skillId)))
    .map(([major]) => major);

export const CATEGORY_ORDER: SkillCategory[] = [
  "foundation",
  "technical",
  "tools",
  "soft",
  "industry",
  "advanced",
];
