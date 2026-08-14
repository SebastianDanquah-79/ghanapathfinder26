export interface PlanScholarship {
  name: string;
  provider?: string | null | undefined;
  coverage?: string | undefined;
  deadline?: string | undefined;
  score?: number | undefined;
  why?: string | undefined;
  gaps?: string[] | undefined;
  nextStep?: string | undefined;
}

export interface PlanInput {
  studentName?: string | null;
  aggregate?: number | null;
  targetCareer?: string | null;
  region?: string | null;
  school?: string | null;
  summary?: string;
  scholarships: PlanScholarship[];
  deadlines: { title: string; due_date: string }[];
  checklist: { task: string; done: boolean }[];
}

export const buildPlanText = (p: PlanInput) => {
  const line = "=".repeat(52);
  const out: string[] = [];
  out.push("GHANAPATH — MY SCHOLARSHIP PLAN");
  out.push(`Generated ${new Date().toLocaleDateString("en-GB", { dateStyle: "long" })}`);
  out.push(line, "");

  out.push("STUDENT");
  out.push(`Name: ${p.studentName ?? "—"}`);
  out.push(`School: ${p.school ?? "—"}`);
  out.push(`Region: ${p.region ?? "—"}`);
  out.push(`WASSCE aggregate: ${p.aggregate ?? "—"}`);
  out.push(`Target career: ${p.targetCareer ?? "—"}`);
  out.push("");

  if (p.summary) {
    out.push("FUNDING STRATEGY");
    out.push(p.summary);
    out.push("");
  }

  out.push("MY SCHOLARSHIPS");
  if (!p.scholarships.length) out.push("None saved yet.");
  p.scholarships.forEach((s, i) => {
    out.push(`${i + 1}. ${s.name}${s.score ? ` — ${s.score}% match` : ""}`);
    if (s.provider) out.push(`   Provider: ${s.provider}`);
    if (s.coverage) out.push(`   Covers: ${s.coverage}`);
    if (s.deadline) out.push(`   Deadline: ${s.deadline}`);
    if (s.why) out.push(`   Why it fits: ${s.why}`);
    if (s.gaps?.length) out.push(`   Watch out: ${s.gaps.join("; ")}`);
    if (s.nextStep) out.push(`   Next step: ${s.nextStep}`);
    out.push("");
  });

  out.push("DEADLINE REMINDERS");
  if (!p.deadlines.length) out.push("None tracked yet.");
  p.deadlines.forEach((d) => out.push(`- ${d.due_date} — ${d.title}`));
  out.push("");

  out.push("APPLICATION CHECKLIST");
  if (!p.checklist.length) out.push("Nothing added yet.");
  p.checklist.forEach((c) => out.push(`[${c.done ? "x" : " "}] ${c.task}`));
  out.push("", line, "ghanapathfinder26.lovable.app");

  return out.join("\n");
};

export const downloadPlan = (text: string, filename = "my-scholarship-plan.txt") => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
