import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";

type CV = {
  name: string;
  headline: string;
  email: string;
  location: string;
  phone: string;
  summary: string;
  skills: string;
  education: string;
  experience: string;
  projects: string;
  certifications: string;
  links: string;
};

const initial: CV = {
  name: "",
  headline: "",
  email: "",
  location: "",
  phone: "",
  summary: "",
  skills: "",
  education: "",
  experience: "",
  projects: "",
  certifications: "",
  links: "",
};

const fields: { key: keyof CV; label: string; placeholder: string; multiline?: boolean }[] = [
  { key: "name", label: "Full name", placeholder: "Your name" },
  { key: "headline", label: "Professional headline", placeholder: "Computer Science Student | Software Developer" },
  { key: "email", label: "Email", placeholder: "you@example.com" },
  { key: "location", label: "Location", placeholder: "Accra, Ghana" },
  { key: "phone", label: "Phone", placeholder: "Optional" },
  { key: "summary", label: "Professional summary", placeholder: "2 to 4 sentences about your background, strengths and goals.", multiline: true },
  { key: "skills", label: "Skills", placeholder: "Python, TypeScript, React, SQL, Git", multiline: true },
  { key: "education", label: "Education", placeholder: "Degree, institution, dates, relevant coursework or achievements.", multiline: true },
  { key: "experience", label: "Experience", placeholder: "Role, organisation, dates, and measurable contributions. One item per paragraph.", multiline: true },
  { key: "projects", label: "Projects", placeholder: "Project name, technologies and what you built.", multiline: true },
  { key: "certifications", label: "Certifications", placeholder: "Certification, provider and year.", multiline: true },
  { key: "links", label: "Links", placeholder: "GitHub, portfolio, LinkedIn", multiline: true },
];

const CVBuilder = () => {
  const [cv, setCv] = useState<CV>(() => {
    try {
      return { ...initial, ...JSON.parse(localStorage.getItem("ghanapathfinder-cv") || "{}") };
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem("ghanapathfinder-cv", JSON.stringify(cv));
  }, [cv]);

  const update = (key: keyof CV, value: string) => setCv((v) => ({ ...v, [key]: value }));

  const lines = useMemo(() => (value: string) => value.split(/\n+/).map((x) => x.trim()).filter(Boolean), []);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Free CV Builder | GhanaPathFinder"
        description="Build and print a professional CV with GhanaPathFinder."
        path="/cv-builder"
        jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "CV Builder", path: "/cv-builder" }])]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-7 max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-2">Career tools</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Build your CV</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a clean, ATS-friendly CV, save your draft on this device and print it to PDF.
              Your draft is stored locally in your browser.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
            <section className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3 mb-5">
                <h2 className="font-semibold">Your information</h2>
                <button type="button" onClick={() => window.print()} className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                  Print / PDF
                </button>
              </div>
              <div className="space-y-4">
                {fields.map((f) => (
                  <label key={f.key} className="block">
                    <span className="text-xs font-medium text-foreground">{f.label}</span>
                    {f.multiline ? (
                      <textarea
                        value={cv[f.key]}
                        onChange={(e) => update(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        rows={f.key === "summary" ? 4 : 5}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    ) : (
                      <input
                        value={cv[f.key]}
                        onChange={(e) => update(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                      />
                    )}
                  </label>
                ))}
              </div>
              <button type="button" onClick={() => setCv(initial)} className="mt-5 text-xs font-semibold text-muted-foreground hover:text-foreground">
                Clear draft
              </button>
            </section>

            <section id="cv-preview" className="rounded-xl border border-border bg-white text-slate-900 p-7 sm:p-10 shadow-sm print:shadow-none print:border-0">
              <header className="border-b border-slate-200 pb-5">
                <h2 className="text-3xl font-bold">{cv.name || "Your Name"}</h2>
                <p className="mt-1 text-base font-medium">{cv.headline || "Professional headline"}</p>
                <p className="mt-2 text-xs text-slate-600">
                  {[cv.email, cv.location, cv.phone].filter(Boolean).join(" · ") || "Email · Location · Phone"}
                </p>
                {cv.links && <p className="mt-1 text-xs text-slate-600">{cv.links}</p>}
              </header>

              {([
                ["PROFILE", cv.summary],
                ["SKILLS", cv.skills],
                ["EXPERIENCE", cv.experience],
                ["PROJECTS", cv.projects],
                ["EDUCATION", cv.education],
                ["CERTIFICATIONS", cv.certifications],
              ] as const).map(([title, value]) => value ? (
                <section key={title} className="mt-6">
                  <h3 className="text-xs font-bold tracking-[0.16em] text-slate-700">{title}</h3>
                  <div className="mt-2 space-y-2 text-sm leading-6">
                    {lines(value).map((item, i) => <p key={i}>{item}</p>)}
                  </div>
                </section>
              ) : null)}

              {!Object.values(cv).some(Boolean) && (
                <p className="mt-8 text-sm text-slate-500">Your CV preview will appear here as you type.</p>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CVBuilder;
