export type DecisionProfile = {
  goal: string;
  stage: string;
  priority: string;
  budget?: number;
  aggregate?: number | null;
  savedUniversities?: number;
  savedScholarships?: number;
  savedInternships?: number;
  skillsStarted?: number;
};

export type PathOption = {
  name: string;
  reason: string;
  strengths: string[];
  watchouts: string[];
  nextAction: string;
  fit: number;
};

const normalise = (value: string) => value.toLowerCase().trim();

const routeLibrary: Record<string, string[]> = {
  ai: ["Computer Science", "Computer Engineering", "Mathematics / Statistics"],
  software: ["Computer Science", "Information Technology", "Computer Engineering"],
  robotics: ["Mechatronics Engineering", "Electrical / Electronic Engineering", "Computer Science"],
  cybersecurity: ["Computer Science", "Cybersecurity / Information Technology", "Computer Engineering"],
  data: ["Computer Science", "Statistics / Mathematics", "Information Technology"],
  business: ["Business Administration", "Economics", "Accounting / Finance"],
  medicine: ["Medicine", "Biomedical / Health Sciences", "Related health pathway"],
  engineering: ["Engineering", "Computer Engineering", "Applied Science pathway"],
};

const findRoutes = (goal: string) => {
  const g = normalise(goal);
  const key = Object.keys(routeLibrary).find((candidate) => g.includes(candidate));
  return key ? routeLibrary[key] : ["Closest relevant degree pathway", "Related degree + targeted skills", "Alternative route + later specialisation"];
};

const priorityBonus = (priority: string, optionIndex: number) => {
  const p = normalise(priority);
  if (p.includes("cost")) return optionIndex === 0 ? 4 : optionIndex === 2 ? 2 : 0;
  if (p.includes("fast")) return optionIndex === 0 ? 5 : 0;
  if (p.includes("international")) return optionIndex === 0 ? 3 : optionIndex === 1 ? 2 : 1;
  if (p.includes("university")) return optionIndex === 0 ? 3 : 2;
  return optionIndex === 0 ? 4 : optionIndex === 1 ? 2 : 1;
};

export function buildDecision(profile: DecisionProfile): PathOption[] {
  const routes = findRoutes(profile.goal);
  const base = profile.aggregate && profile.aggregate <= 24 ? 78 : profile.aggregate && profile.aggregate <= 30 ? 68 : 58;
  const readiness = Math.min(12, (profile.savedUniversities ?? 0) * 2 + (profile.savedScholarships ?? 0) * 2 + (profile.savedInternships ?? 0) * 2 + (profile.skillsStarted ?? 0) * 2);

  return routes.map((name, index) => {
    const fit = Math.min(96, Math.max(42, base + readiness + priorityBonus(profile.priority, index) - index * 3));
    const strengths = [
      index === 0 ? "Strongest first route for the stated destination" : "Credible alternative if the first route is unavailable",
      profile.stage === "WASSCE graduate" ? "Can be researched immediately for undergraduate entry" : "Can be combined with targeted skills and experience",
      "Keeps multiple future options open when paired with practical projects",
    ];
    const watchouts = [
      "Confirm current programme accreditation and entry requirements before applying",
      profile.budget ? "Compare total cost, not tuition alone" : "Add a realistic budget before making a final choice",
      "Treat the fit score as decision support, not an admission guarantee",
    ];
    return {
      name,
      fit,
      reason: index === 0 ? `Best starting route for ${profile.goal || "your goal"}, based on your stated priority and current profile.` : `Worth comparing before you commit, especially if the first route has a constraint.`,
      strengths,
      watchouts,
      nextAction: index === 0 ? `Compare ${name} programmes and current entry requirements.` : `Compare this route against ${routes[0]}.`,
    };
  });
}

export function nextBestActions(profile: DecisionProfile, options: PathOption[]) {
  const actions: { title: string; detail: string; href: string; urgency: "Now" | "Next" | "Later" }[] = [];
  if (!profile.goal.trim()) actions.push({ title: "Define your destination", detail: "Name the career or outcome you are building toward.", href: "/career-path", urgency: "Now" });
  if ((profile.savedUniversities ?? 0) < 2) actions.push({ title: "Build a real shortlist", detail: "Keep at least two credible routes so one admission result does not decide your future.", href: "/universities", urgency: "Now" });
  if ((profile.savedScholarships ?? 0) < 1) actions.push({ title: "Check funding before committing", detail: "Save funding options and compare their eligibility and deadlines.", href: "/scholarships", urgency: "Next" });
  if ((profile.skillsStarted ?? 0) < 1) actions.push({ title: "Start one marketable skill", detail: "Choose a skill that produces evidence you can show, not just a certificate.", href: "/skills", urgency: "Next" });
  if ((profile.savedInternships ?? 0) < 1) actions.push({ title: "Create evidence of ability", detail: "Find an internship, project or practical experience connected to your target.", href: "/internships", urgency: "Next" });
  if (!actions.length && options[0]) actions.push({ title: `Deepen your ${options[0].name} route`, detail: "Move from exploration to applications, projects and measurable progress.", href: "/applications", urgency: "Later" });
  return actions.slice(0, 5);
}
