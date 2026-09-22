export type CuratedLink = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  category: string;
  publishedAt?: string;
  type?: "video" | "news" | "opportunity";
};

export const curatedVideos: CuratedLink[] = [
  {
    id: "yt-neural-networks",
    title: "But what is a neural network?",
    description: "A clear visual introduction to neural networks and the core ideas behind modern machine learning.",
    url: "https://www.youtube.com/watch?v=aircAruvnKk",
    source: "YouTube · 3Blue1Brown",
    category: "AI",
    type: "video",
  },
  {
    id: "yt-alphago",
    title: "AlphaGo: The movie",
    description: "A documentary-style look at the DeepMind AlphaGo project and the people and research behind it.",
    url: "https://www.youtube.com/watch?v=WXuK6gekU1Y",
    source: "YouTube · DeepMind",
    category: "AI",
    type: "video",
  },
  {
    id: "yt-darpa",
    title: "DARPA Grand Challenge 2004",
    description: "A look at the autonomous-vehicle competition that helped push robotics and self-driving research forward.",
    url: "https://www.youtube.com/watch?v=FaBJ5sPPmcl",
    source: "YouTube",
    category: "Robotics",
    type: "video",
  },
  {
    id: "tiktok-ai-creators",
    title: "AI and creativity on TikTok",
    description: "Explore current creator-led AI experiments, tools and storytelling on TikTok.",
    url: "https://www.tiktok.com/@tiktok",
    source: "TikTok",
    category: "AI",
    type: "video",
  },
  {
    id: "facebook-tech-video",
    title: "Technology and innovation videos on Facebook",
    description: "Explore technology, science and innovation video content from publishers and creators on Facebook.",
    url: "https://www.facebook.com/watch/",
    source: "Facebook Watch",
    category: "Innovation",
    type: "video",
  },
];

export const curatedNews: CuratedLink[] = [
  {
    id: "news-gemini-security",
    title: "Google's Gemini AI hacked three companies in a security test",
    description: "Citi Newsroom reports on a Google security test in which Gemini was used in autonomous cyber-security work against three companies.",
    url: "https://www.citinewsroom.com/category/technology/",
    source: "Citi Newsroom",
    category: "Tech",
    publishedAt: "2026-09-21",
    type: "news",
  },
  {
    id: "news-ai-local-needs",
    title: "Ghana's AI adoption must focus on local needs",
    description: "A September 17 report discusses calls for Ghana's AI adoption to address local needs and practical national priorities.",
    url: "https://www.citinewsroom.com/category/technology/",
    source: "Citi Newsroom",
    category: "Tech",
    publishedAt: "2026-09-17",
    type: "news",
  },
  {
    id: "news-telecel-5g",
    title: "Telecel secures 2.3 GHz spectrum lots for 5G rollout",
    description: "The National Communications Authority awarded Telecel Ghana three spectrum lots in the 2.3 GHz band to support its 5G rollout.",
    url: "https://www.citinewsroom.com/category/technology/",
    source: "Citi Newsroom",
    category: "Tech",
    publishedAt: "2026-09-17",
    type: "news",
  },
  {
    id: "news-digital-assets",
    title: "DASA 2026 highlights jobs, investment and digital finance opportunities",
    description: "The Ghana News Agency reports on the Digital Asset Summit Africa 2026 in Accra and its focus on innovation, jobs and digital finance.",
    url: "https://gna.org.gh/2026/09/dasa-2026-highlights-opportunities-for-jobs-investment-and-digital-finance-growth-in-africa/",
    source: "Ghana News Agency",
    category: "Business",
    publishedAt: "2026-09-19",
    type: "news",
  },
  {
    id: "news-ai-learning",
    title: "UNESCO explores scaling AI and simulation learning for youth",
    description: "UNESCO is examining how AI and simulation-based learning can move beyond pilot projects to create scalable opportunities for young people.",
    url: "https://www.unesco.org/en/articles/beyond-pilot-unesco-and-partners-explore-scaling-ai-and-simulation-learning-lasting-youth-impact",
    source: "UNESCO",
    category: "Education",
    publishedAt: "2026-09-21",
    type: "news",
  },
  {
    id: "news-girls-ict",
    title: "Ghana Girls-In-ICT projects showcase practical AI and robotics",
    description: "Recent projects included an AI-powered accessibility assistant, a Rubik's Cube solver, an automated crane and a colour sorter.",
    url: "https://techafricanews.com/2026/09/09/ghana-girls-in-ict-beneficiaries-atc-ghana-tech-experience/",
    source: "TechAfrica News",
    category: "Innovation",
    publishedAt: "2026-09-09",
    type: "news",
  },
];

export const curatedOpportunities: CuratedLink[] = [
  {
    id: "opp-telecel-software",
    title: "Software Engineer - Telecel Cash",
    description: "Software engineering role in Accra covering APIs, databases, integrations, testing, DevSecOps and digital payments. Listed on LinkedIn with a September 23, 2026 closing date.",
    url: "https://gh.linkedin.com/jobs/view/software-engineer-%E2%80%93-telecel-cash-at-telecel-ghana-4468043992",
    source: "LinkedIn · Telecel Ghana",
    category: "job",
    publishedAt: "2026-09-20",
    type: "opportunity",
  },
  {
    id: "opp-riscura-ai",
    title: "AI Enablement Analyst",
    description: "Cape Town role focused on AI tools, LLM workflows, automation and coding projects. LinkedIn lists an application close date of September 30, 2026.",
    url: "https://za.linkedin.com/jobs/view/ai-enablement-analyst-at-riscura-4464818149",
    source: "LinkedIn · RisCura",
    category: "job",
    publishedAt: "2026-09-15",
    type: "opportunity",
  },
  {
    id: "opp-gephra-intern",
    title: "Full-Stack Software Engineer Intern - Remote",
    description: "Remote, part-time and flexible internship with GEPHRA. The listing says academic projects, personal projects and GitHub portfolios are welcome, with a September 25, 2026 deadline.",
    url: "https://rw.linkedin.com/jobs/view/full-stack-software-engineer-intern-remote-at-gephra-4468363650",
    source: "LinkedIn · GEPHRA",
    category: "internship",
    publishedAt: "2026-09-18",
    type: "opportunity",
  },
  {
    id: "opp-bangopure-ai",
    title: "AI Engineer",
    description: "Remote AI engineering role covering multimodal AI, LLM serving, AI security and open-source AI. LinkedIn lists a September 30, 2026 deadline.",
    url: "https://pk.linkedin.com/jobs/view/ai-engineer-at-bangopure-4464218439",
    source: "LinkedIn · BangoPure",
    category: "job",
    publishedAt: "2026-09-17",
    type: "opportunity",
  },
  {
    id: "opp-arc-ai",
    title: "AI Trading Developer",
    description: "Arc currently lists an actively hiring remote AI trading developer opportunity requiring Python, Pandas and SQL.",
    url: "https://arc.dev/en-gh/remote-jobs",
    source: "Arc",
    category: "job",
    publishedAt: "2026-09-21",
    type: "opportunity",
  },
  {
    id: "opp-linkedin-remote-search",
    title: "LinkedIn remote software opportunities",
    description: "A live LinkedIn search for remote software engineering roles. Users should confirm location, age, work authorization and closing date on each listing.",
    url: "https://www.linkedin.com/jobs/search/?f_WT=2&keywords=software%20engineer",
    source: "LinkedIn Jobs",
    category: "job",
    publishedAt: "2026-09-22",
    type: "opportunity",
  },
];
