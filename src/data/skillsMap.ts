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

export const SKILLS: Skill[] = [...SOFT, ...DOMAIN];

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
