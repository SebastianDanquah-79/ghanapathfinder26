import { Link } from "@tanstack/react-router";

type Role = "student" | "employer" | "employee";

const content: Record<Role, { eyebrow: string; title: string; text: string; modules: string[] }> = {
  student: {
    eyebrow: "Student workspace",
    title: "Build an education and career path across Africa",
    text: "Start with your qualification, compare routes into Ghanaian universities, find funding and build the skills your future career requires.",
    modules: ["Admissions & Ghana universities", "Qualification matching", "Scholarships & funding", "Internships", "Skills & careers", "My Path"],
  },
  employer: {
    eyebrow: "Employer workspace",
    title: "Find and develop African talent",
    text: "Create an organization profile, publish jobs and internships, review candidates and build a structured hiring pipeline.",
    modules: ["Organization profile", "Jobs & internships", "Candidate discovery", "Applicant management", "Saved candidates", "Employer messages"],
  },
  employee: {
    eyebrow: "Professional workspace",
    title: "Turn your skills into opportunity",
    text: "Create a professional profile, discover jobs and internships, and make your skills visible to employers.",
    modules: ["Professional profile", "CV & portfolio", "Jobs", "Internships", "Skills", "Applications"],
  },
};

export default function RolePortal({ role }: { role: Role }) {
  const c = content[role];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link to="/" className="font-bold">GhanaPathFinder</Link>
          <Link to="/auth" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Create account</Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{c.eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{c.text}</p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {c.modules.map((module) => <div key={module} className="rounded-xl border border-border bg-card p-5"><h2 className="font-semibold">{module}</h2><p className="mt-2 text-sm text-muted-foreground">Available in the {role} workspace.</p></div>)}
        </div>
        <div className="mt-10 flex gap-3">
          <Link to="/auth" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Continue as {role}</Link>
          <Link to="/" className="rounded-lg border border-border px-5 py-3 text-sm font-semibold">Back</Link>
        </div>
      </main>
    </div>
  );
}
