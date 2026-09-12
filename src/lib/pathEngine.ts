export type FinancialPriority = "low" | "medium" | "high";

export type PathProfile = {
  career: string;
  financialPriority: FinancialPriority;
  monthlyCapacity: number;
};

export type SkillPlan = {
  name: string;
  level: "Foundation" | "Intermediate" | "Advanced";
  current: number;
  target: number;
  reason: string;
};

const careerSkills: Record<string, string[]> = {
  "AI Engineer": ["Python", "Data Structures", "Linear Algebra", "Machine Learning", "Deep Learning", "Cloud & Deployment"],
  "Machine Learning Engineer": ["Python", "Data Structures", "Linear Algebra", "Machine Learning", "Deep Learning", "MLOps"],
  "Software Engineer": ["Python", "Data Structures", "Algorithms", "Git & GitHub", "Testing", "System Design"],
  "Robotics Engineer": ["Python", "C/C++", "Linear Algebra", "Control Systems", "Computer Vision", "ROS 2"],
  "Data Scientist": ["Python", "Statistics", "SQL", "Data Analysis", "Machine Learning", "Visualization"],
};

const baselineSkills: Record<string, number> = {
  Python: 70,
  "Git & GitHub": 55,
  "Data Structures": 25,
  Algorithms: 20,
  "Linear Algebra": 35,
  "Machine Learning": 10,
  "Deep Learning": 5,
  "Cloud & Deployment": 15,
  "C/C++": 10,
  "Control Systems": 5,
  "Computer Vision": 5,
  "ROS 2": 0,
  MLOps: 0,
  Statistics: 20,
  SQL: 15,
  "Data Analysis": 25,
  Visualization: 20,
  Testing: 10,
  "System Design": 5,
};

export function normalizeCareer(input: string) {
  const value = input.trim().toLowerCase();
  if (value.includes("robot")) return "Robotics Engineer";
  if (value.includes("machine learning") || value === "ml engineer") return "Machine Learning Engineer";
  if (value.includes("software")) return "Software Engineer";
  if (value.includes("data scientist")) return "Data Scientist";
  return "AI Engineer";
}

export function getSkillPlan(career: string): SkillPlan[] {
  const selected = careerSkills[normalizeCareer(career)] ?? careerSkills["AI Engineer"];
  return selected.map((name, index) => {
    const current = baselineSkills[name] ?? 0;
    const target = index < 2 ? 80 : 70;
    const reason = index === 0 ? "Core prerequisite" : index === 1 ? "High-leverage foundation" : "Evidence for the target role";
    return { name, current, target, level: current < 30 ? "Foundation" : current < 65 ? "Intermediate" : "Advanced", reason };
  });
}

export function calculatePathFit(profile: PathProfile) {
  const career = normalizeCareer(profile.career);
  const skills = getSkillPlan(career);
  const readiness = skills.reduce((sum, skill) => sum + Math.min(skill.current / skill.target, 1), 0) / skills.length;
  const financial = profile.financialPriority === "low" ? 0.92 : profile.financialPriority === "medium" ? 0.82 : 0.7;
  return Math.round(Math.min(96, 48 + readiness * 42 + financial * 8));
}

export function estimateAnnualCost(monthlyCapacity: number, tuition: number, accommodation: number, food: number, transport: number) {
  const annualCost = tuition + accommodation + food + transport;
  const annualCapacity = Math.max(0, monthlyCapacity) * 12;
  return { annualCost, annualCapacity, fundingGap: Math.max(0, annualCost - annualCapacity), coverage: annualCost ? Math.min(100, Math.round((annualCapacity / annualCost) * 100)) : 0 };
}

export function getProjectRoadmap(career: string) {
  const normalized = normalizeCareer(career);
  const robotics = normalized === "Robotics Engineer";
  return [
    { stage: "Foundation", title: robotics ? "Sensor data logger" : "Developer portfolio", outcome: "Public GitHub evidence and a short technical write-up", effort: "1–2 weeks" },
    { stage: "Intermediate", title: robotics ? "Computer-vision robot simulation" : "Recommendation system", outcome: "End-to-end project with tests, metrics and documentation", effort: "2–4 weeks" },
    { stage: "Advanced", title: robotics ? "Autonomous navigation prototype" : "Production AI application", outcome: "Deployed system with measurable usage and monitoring", effort: "4–8 weeks" },
  ];
}

export const defaultTasks = [
  { title: "Define your target career", category: "direction" },
  { title: "Shortlist 3 realistic programmes", category: "education" },
  { title: "Review scholarships and funding routes", category: "funding" },
  { title: "Choose the next high-leverage skill", category: "skills" },
  { title: "Start a portfolio project", category: "evidence" },
  { title: "Create an internship target list", category: "experience" },
];
