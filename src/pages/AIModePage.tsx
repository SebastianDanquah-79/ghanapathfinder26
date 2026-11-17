import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AskPanel from "@/components/AskPanel";
import { BookOpenCheck, BrainCircuit, ClipboardList, FileText, FlaskConical, Gauge, Rocket, ShieldCheck, Target } from "lucide-react";

type AIModePageProps = {
  mode: "personal-tutor" | "cofounder";
};

const tutorSuggestions = [
  "Build a structured study guide from the sources I uploaded. Cite the source page or section when visible.",
  "Explain the most difficult concept in my notes one small step at a time, then test my understanding.",
  "Quiz me one question at a time. Wait for my attempt before giving the answer.",
  "Create 15 concise active-recall flashcards using only my uploaded sources.",
  "Compare the two sources and identify any differences or contradictions.",
  "Create a rigorous university-style practice test from these materials, with a separate answer key.",
];

const cofounderSuggestions = [
  "Pressure-test this startup idea. Identify the customer, painful problem, weakest assumption and first experiment.",
  "Act as my product review board. What should we cut, build and measure this week?",
  "Design a 7-day customer-discovery sprint for a Ghanaian startup with almost no budget.",
  "Review this product architecture. Identify reliability, security, data and unit-cost risks.",
  "Challenge my pricing and business model. Show the assumptions that need evidence.",
  "Give me a direct verdict: TEST, RESHAPE, BUILD, SHIP or STOP. Here is the idea...",
];

const tutorWorkflows = [
  {
    icon: FileText,
    title: "Source-grounded answers",
    description: "Use your own lecture slides, notes and reading material as the main reference.",
  },
  {
    icon: BrainCircuit,
    title: "Understand, do not memorise",
    description: "Break a difficult topic into prerequisites, small steps, examples and common misconceptions.",
  },
  {
    icon: ClipboardList,
    title: "Practice and recall",
    description: "Generate quizzes, flashcards, revision guides and exam-style questions from your sources.",
  },
];

const founderWorkflows = [
  {
    icon: Target,
    title: "Customer before features",
    description: "Identify the exact first customer, painful problem, current workaround and buying trigger.",
  },
  {
    icon: Gauge,
    title: "Evidence over excitement",
    description: "Separate facts from assumptions, design measurable experiments and reject vanity metrics.",
  },
  {
    icon: FlaskConical,
    title: "Build, test, learn",
    description: "Find the smallest useful product, test it with real users and improve from observed behaviour.",
  },
];

export default function AIModePage({ mode }: AIModePageProps) {
  const isTutor = mode === "personal-tutor";
  const title = isTutor ? "Personal AI Tutor" : "AI Co-Founder";
  const description = isTutor
    ? "A source-grounded study workspace that helps you understand your own lecture material, practise actively and prepare for rigorous assessments."
    : "A demanding startup operating partner for product strategy, customer discovery, engineering decisions and disciplined execution.";
  const path = isTutor ? "/personal-tutor" : "/ai-cofounder";
  const workflows = isTutor ? tutorWorkflows : founderWorkflows;
  const suggestions = isTutor ? tutorSuggestions : cofounderSuggestions;
  const query = isTutor
    ? "Personal study tutor. Prioritise the student's uploaded PDFs and images, explain concepts step by step, and distinguish source-backed statements from extra explanation."
    : "AI co-founder. Pressure-test startup ideas, customers, product choices, technical decisions, business models and weekly execution with rigorous, evidence-led feedback.";

  return (
    <div className="min-h-dvh bg-background pb-24 pt-20">
      <Seo
        title={`${title} | GhanaPathFinder`}
        description={description}
        path={path}
      />
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <header className="mb-8 max-w-4xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {isTutor ? <BookOpenCheck className="size-3.5" /> : <Rocket className="size-3.5" />}
            {isTutor ? "Source-grounded learning" : "Founder operating room"}
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {isTutor ? "Learn directly from your materials." : "Build what survives hard questions."}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            {description}
          </p>
          {!isTutor && (
            <p className="mt-3 inline-flex items-center gap-2 text-xs leading-5 text-muted-foreground">
              <ShieldCheck className="size-4 shrink-0 text-primary" />
              High-standard Silicon Valley and accelerator-style scrutiny. This is an AI adviser, not a real investor, founder or Y Combinator representative.
            </p>
          )}
        </header>

        <div className="mb-7 grid gap-3 md:grid-cols-3">
          {workflows.map((item) => {
            const Icon = item.icon;
            return (
              <article key={item.title} className="rounded-xl border border-border bg-card p-4">
                <Icon className="size-5 text-primary" />
                <h2 className="mt-3 text-sm font-semibold text-foreground">{item.title}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
              </article>
            );
          })}
        </div>

        <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="min-w-0">
            <AskPanel
              query={query}
              items={[]}
              suggestions={suggestions}
              mode={isTutor ? "personal-tutor" : "cofounder"}
            />
            {isTutor ? (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Upload up to 3 PDF or image sources at once, with 2 MB total across the files. Sources remain available in this active chat only. Reloading the page removes the file data, so reattach sources to study them again. Do not upload private or sensitive records.
              </p>
            ) : (
              <p className="mt-3 text-xs leading-5 text-muted-foreground">
                Expect direct feedback, explicit assumptions and measurable next steps. The goal is better decisions, not motivation theatre or fake certainty.
              </p>
            )}
          </div>

          <aside className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">
              {isTutor ? "How to use this study room" : "How the co-founder works"}
            </h2>
            <ol className="mt-3 space-y-3 text-xs leading-5 text-muted-foreground">
              {(isTutor
                ? [
                    "Attach your relevant lecture slides, notes or reading extracts.",
                    "Ask about one learning objective or difficult concept.",
                    "Work through examples, then attempt the practice question.",
                    "Ask for a quiz or flashcards to test recall.",
                  ]
                : [
                    "Describe the customer and problem, not just the product idea.",
                    "Share what you have observed or tested so far.",
                    "Ask for a verdict and the riskiest assumption.",
                    "Run the smallest experiment and return with evidence.",
                  ]).map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
            </ol>
          </aside>
        </section>
      </main>
    </div>
  );
}
