import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import DecisionPathway from "@/components/DecisionPathway";
import ProgrammeCareerExplorer from "@/components/ProgrammeCareerExplorer";
import { ChevronDown, Target } from "@/lib/icons";

interface Stage {
  name: string;
  timeframe: string;
  focus: string;
  skills: string[];
  actions: string[];
  milestones: string[];
}
interface CareerSource {
  title: string;
  url: string;
  status: string;
}
interface CareerPlan {
  title: string;
  summary: string;
  current_state: string;
  stages: Stage[];
  next_step: string;
  faq: { question: string; answer: string }[];
  evidenceNote: string;
  sources: CareerSource[];
  evidenceCounts: Record<string, number>;
}

const fields = [
  ["education", "Education", "e.g. SHS graduate, BSc Computer Science, final-year student"],
  ["skills", "Skills", "What can you already do?"],
  ["interests", "Interests", "What areas do you enjoy?"],
  ["experience", "Experience", "Work, volunteering, internships or other experience"],
  ["projects", "Projects", "Projects, portfolio work or things you have built"],
  ["goals", "Goals", "What do you want your career to become?"],
  ["location", "Location", "Where you are based or hope to work"],
] as const;

const CareerPath = () => {
  const [dreamJob, setDreamJob] = useState("");
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const buildPath = async () => {
    if (!dreamJob.trim() || loading) return;
    setLoading(true);
    setError("");
    setPlan(null);

    try {
      const response = await fetch("/api/career-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dreamJob, ...profile }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = typeof payload?.error === "string"
          ? payload.error
          : "Career Path could not be built. Please try again.";
        throw new Error(message);
      }

      setPlan({
        title: String(payload.title ?? ""),
        summary: String(payload.summary ?? ""),
        current_state: String(payload.current_state ?? ""),
        stages: Array.isArray(payload.stages) ? payload.stages : [],
        next_step: String(payload.next_step ?? ""),
        faq: Array.isArray(payload.faq) ? payload.faq : [],
        evidenceNote: String(payload.evidenceNote ?? ""),
        sources: Array.isArray(payload.sources) ? payload.sources : [],
        evidenceCounts: payload.evidenceCounts && typeof payload.evidenceCounts === "object"
          ? payload.evidenceCounts
          : {},
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Career Path is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Career Path | GhanaPathFinder"
        description="Build a practical path from where you are today to the career you want."
        path="/career-path"
        jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Career Path", path: "/career-path" }])]}
      />
      <Navbar />
      <main className="px-4 pb-14 pt-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 max-w-3xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Career Intelligence</p>
            <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Turn your dream job into a practical path.
            </h1>
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              Build a clear route from where you are now to where you want to go, using education, skills, projects, experience and available platform evidence.
            </p>
          </div>

          <section className="mb-8 rounded-2xl border border-border bg-card p-5 sm:p-7">
            <label className="mb-2 block text-sm font-semibold text-foreground">What is your dream job?</label>
            <input
              value={dreamJob}
              onChange={(event) => setDreamJob(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && void buildPath()}
              placeholder="e.g. AI engineer, robotics engineer, doctor, product manager"
              maxLength={200}
              className="h-12 w-full rounded-lg border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {fields.map(([key, label, placeholder]) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    {label} <span className="font-normal text-muted-foreground">(optional)</span>
                  </label>
                  <textarea
                    value={profile[key] ?? ""}
                    onChange={(event) => setProfile((current) => ({ ...current, [key]: event.target.value }))}
                    placeholder={placeholder}
                    rows={2}
                    maxLength={800}
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ))}
            </div>
            {error && <p className="mt-4 text-sm text-destructive" role="alert">{error}</p>}
            <button
              type="button"
              disabled={!dreamJob.trim() || loading}
              onClick={() => void buildPath()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
            >
              {loading ? "Building your path…" : "Build my path"}
            </button>
          </section>

          <DecisionPathway />
          <ProgrammeCareerExplorer />

          {plan && (
            <section className="mb-12" aria-live="polite">
              <div className="mb-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg border border-border p-2">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{plan.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.summary}</p>
                  </div>
                </div>
                <div className="mt-5 border-t border-border pt-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Where you are now</p>
                  <p className="text-sm leading-6 text-foreground">{plan.current_state}</p>
                </div>
              </div>

              <div className="space-y-4">
                {plan.stages.map((stage, index) => (
                  <article key={`${stage.name}-${index}`} className="rounded-xl border border-border bg-card p-5 sm:p-6">
                    <div className="flex gap-4">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary/30 text-sm font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="font-display text-lg font-semibold text-foreground">{stage.name}</h3>
                          <span className="text-xs text-muted-foreground">{stage.timeframe}</span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{stage.focus}</p>
                        <div className="mt-5 grid gap-5 md:grid-cols-3">
                          <List title="Build these skills" items={stage.skills} />
                          <List title="What to do" items={stage.actions} />
                          <List title="Milestones" items={stage.milestones} />
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Your next step</p>
                <p className="text-sm leading-6 text-foreground">{plan.next_step}</p>
              </div>

              {plan.evidenceNote && (
                <div className="mt-5 rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">Evidence and limitations</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.evidenceNote}</p>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    The pathway combines general career guidance with the GhanaPathFinder records available at the time of the request. It is not an admission, scholarship or employment guarantee.
                  </p>
                </div>
              )}

              {!!plan.sources.length && (
                <div className="mt-5 rounded-xl border border-border bg-card p-4">
                  <h3 className="text-sm font-semibold text-foreground">Sources from GhanaPathFinder records</h3>
                  <div className="mt-3 space-y-2">
                    {plan.sources.map((source) => (
                      <div key={source.url} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <a href={source.url} target="_blank" rel="noreferrer" className="font-medium text-primary underline underline-offset-2">
                          {source.title}
                        </a>
                        <span className="text-xs text-muted-foreground">{source.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="mb-2 font-display text-xl font-bold text-foreground">Career Path FAQ</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Common questions about building and using a career path. See the{" "}
              <a href="/faq" className="text-primary underline underline-offset-2">full FAQ</a>{" "}
              for admissions, cut-off points and scholarships.
            </p>
            <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
              {(plan?.faq ?? defaultFaq).map((item, index) => (
                <button
                  key={item.question}
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full bg-card p-4 text-left hover:bg-muted/40"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-foreground">{item.question}</span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                  </div>
                  {openFaq === index && <p className="mt-3 pr-6 text-sm leading-6 text-muted-foreground">{item.answer}</p>}
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

const List = ({ title, items }: { title: string; items: string[] }) => (
  <div>
    <h4 className="mb-2 text-xs font-semibold text-foreground">{title}</h4>
    <ul className="space-y-1.5">
      {items.map((item) => <li key={item} className="text-xs leading-5 text-muted-foreground">{item}</li>)}
    </ul>
  </div>
);

const defaultFaq = [
  { question: "Do I need a WASSCE result?", answer: "No. WASSCE can be useful context, but your education, skills, interests, experience, projects and goals can all shape your path." },
  { question: "Can I use this if I am already in university?", answer: "Yes. Start with your current programme and experience, then use the path to identify skills, projects, internships and longer-term roles." },
  { question: "What if I do not have the required skills yet?", answer: "That is expected for most people. The path separates the skills you need to develop from the experience and milestones that come later." },
  { question: "Can I change my dream job later?", answer: "Yes. Careers are not fixed. Build a new path whenever your interests or goals change." },
  { question: "Does the path include projects and experience?", answer: "Yes. The plan can include practical projects, portfolio work, internships, volunteering and other experience that helps you progress." },
  { question: "Can the path lead to international opportunities?", answer: "Yes. Where relevant, the progression can include international study, remote work, global portfolios and professional specialisation." },
];

export default CareerPath;
