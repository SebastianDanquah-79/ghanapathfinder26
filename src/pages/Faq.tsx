import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { Link } from "@/lib/router-compat";
import { ChevronDown } from "@/lib/icons";

type Item = { question: string; answer: string };
type Group = { id: string; title: string; blurb: string; items: Item[] };

export const FAQ_GROUPS: Group[] = [
  {
    id: "admissions",
    title: "Admissions",
    blurb: "Applying to universities, colleges and technical institutions in Ghana.",
    items: [
      {
        question: "When do Ghanaian universities open applications?",
        answer:
          "Most public universities open undergraduate admissions between January and March and close between April and July, with some running extended or second-batch windows. Private institutions often admit in more than one intake across the year. Always confirm the current window on the institution's official admissions page, which is linked on every university profile in GhanaPathFinder.",
      },
      {
        question: "What do I need before I apply?",
        answer:
          "Typically your results slip or index number, a valid ID, passport photographs, the application voucher or online payment, and details of your chosen programmes in order of preference. Some programmes also require an interview, an aptitude test, a portfolio or a medical report.",
      },
      {
        question: "Can I apply with results other than WASSCE?",
        answer:
          "Yes. Ghanaian institutions also admit applicants with NovDec results, ABCE/GBCE, TVET and NVTI certificates, HND and diploma qualifications, IB or A-Levels, foreign certificates, and mature-applicant entry for candidates aged 25 and above. GhanaPathFinder is not limited to WASSCE.",
      },
      {
        question: "How many programmes should I choose?",
        answer:
          "Most application forms allow two to four choices. A balanced list usually includes one ambitious choice, one realistic choice and one safer choice, so that a competitive cut-off in one programme does not end your admission chances.",
      },
      {
        question: "What happens if I am not admitted to my first choice?",
        answer:
          "Institutions commonly offer an alternative programme in the same faculty, or place you on a related diploma or access route that can ladder into the degree later. You can also apply in a later intake, resit specific subjects, or consider a technical university pathway.",
      },
    ],
  },
  {
    id: "cut-off-points",
    title: "Cut-off points and grades",
    blurb: "How aggregates work and what the numbers on GhanaPathFinder mean.",
    items: [
      {
        question: "How is the WASSCE aggregate calculated?",
        answer:
          "The aggregate is the sum of your grade points for three core subjects (English, Mathematics and Integrated Science or Social Studies, depending on the programme) plus your three best elective subjects. A1 counts as 1 and C6 as 6, so the lowest possible aggregate is 6. A lower aggregate is better.",
      },
      {
        question: "What is a cut-off point?",
        answer:
          "A cut-off point is the weakest aggregate that was actually admitted into a programme in a given year. It is not a fixed rule. It moves each year with the number of applicants, available places and the strength of that year's results.",
      },
      {
        question: "Are the cut-off points shown here official?",
        answer:
          "No. GhanaPathFinder shows recorded or estimated cut-off ranges drawn from published institutional sources, and each entry carries its source and the date it was last checked. Treat them as planning guidance, not as a decision. The institution's admissions office is always the authority.",
      },
      {
        question: "Do subject requirements matter more than the aggregate?",
        answer:
          "Often, yes. Many programmes reject applicants who meet the aggregate but miss a required subject or a required grade in it, for example Elective Mathematics for engineering or Chemistry and Biology for medical programmes. GhanaPathFinder enforces subject requirements when it matches you.",
      },
      {
        question: "My aggregate is higher than the cut-off. Is it over?",
        answer:
          "Not necessarily. Cut-offs drift year to year, fee-paying and less competitive campuses often admit wider aggregates, and diploma or access routes can lead into the same degree. The matcher shows those alternatives alongside the competitive options.",
      },
    ],
  },
  {
    id: "scholarships",
    title: "Scholarships and funding",
    blurb: "Finding, qualifying for and tracking financial support.",
    items: [
      {
        question: "What kinds of funding are listed?",
        answer:
          "Government schemes such as the Scholarships Secretariat and the Student Loan Trust Fund, institutional bursaries and fee waivers, corporate and foundation awards, and international scholarships open to Ghanaian students.",
      },
      {
        question: "Do I need excellent grades to get a scholarship?",
        answer:
          "Not always. Some awards are purely merit-based, but many are needs-based, community-based, region-based or programme-specific, and some target women in STEM, students with disabilities or applicants from particular districts.",
      },
      {
        question: "When should I apply?",
        answer:
          "Start before admission results arrive. Many deadlines fall in the same months as admissions, and several awards require an admission letter, so preparing documents early matters more than waiting for certainty.",
      },
      {
        question: "Are the deadlines on GhanaPathFinder guaranteed?",
        answer:
          "No. Deadlines are recorded from official sources and rechecked, but sponsors change them without notice. Every scholarship entry links to the official page, and you should confirm there before relying on a date.",
      },
      {
        question: "Do I have to pay to apply for a scholarship?",
        answer:
          "Legitimate scholarships do not ask you to pay a fee to be considered. Requests for payment, 'processing charges' or personal bank transfers are a common scam sign. Verify through the official site linked on the listing.",
      },
    ],
  },
  {
    id: "guidance",
    title: "How guidance on GhanaPathFinder works",
    blurb: "Where our recommendations come from and how far they should be trusted.",
    items: [
      {
        question: "How are my matches produced?",
        answer:
          "Your saved profile — results or qualifications, subjects, interests, budget, preferred region and career goal — is compared against recorded programme requirements, cut-off ranges, fees and locations. Each match shows the reasoning behind it, including anything that counted against it.",
      },
      {
        question: "Is the guidance only for WASSCE candidates?",
        answer:
          "No. You can build a path from JHS, SHS, TVET, a diploma or HND, an existing degree, self-taught experience, employment or as a mature applicant. WASSCE is one input, not a requirement.",
      },
      {
        question: "How does the dream-job path builder work?",
        answer:
          "You name the job you want and describe where you are today. GhanaPathFinder returns a stage-by-stage route to the highest reasonable level of that career: the qualifications, skills, projects, experience and milestones for each stage, ending with one clear next step.",
      },
      {
        question: "Where does your data come from?",
        answer:
          "Institutional websites, admissions and fees pages, regulator and council publications, and scholarship sponsors. Entries carry a source link and a last-checked date, and the Credits & Sources page lists the references used.",
      },
      {
        question: "Can GhanaPathFinder guarantee admission?",
        answer:
          "No. Nothing here is an offer, an official decision or a promise of admission, funding or employment. It is guidance to help you shortlist, prepare and act earlier. Final decisions rest with the institutions and sponsors.",
      },
      {
        question: "Do I need an account?",
        answer:
          "You can browse universities, programmes, scholarships and careers freely. An account is needed only for personalised features such as matches, saved items, deadlines and your path, so your profile can be stored and reused.",
      },
      {
        question: "How do I report something that is wrong?",
        answer:
          "Use the Contact page with the page link and what you believe is incorrect. Corrections that can be verified against an official source are updated and the last-checked date is reset.",
      },
    ],
  },
];

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  ),
};

const Faq = () => {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="FAQ: Admissions, Cut-off Points & Scholarships | GhanaPathFinder"
        description="Answers on applying to Ghanaian universities, how WASSCE aggregates and cut-off points work, finding scholarships, and how GhanaPathFinder guidance is produced."
        path="/faq"
        jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "FAQ", path: "/faq" }]), faqLd]}
      />
      <Navbar />
      <main className="pt-20 pb-14 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="max-w-2xl mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-2">Help</p>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Frequently asked questions
            </h1>
            <p className="text-sm text-muted-foreground leading-6">
              Admissions, cut-off points, scholarships and how guidance on GhanaPathFinder is produced.
            </p>
          </header>

          <nav aria-label="FAQ sections" className="flex flex-wrap gap-2 mb-8">
            {FAQ_GROUPS.map((group) => (
              <a
                key={group.id}
                href={`#${group.id}`}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40"
              >
                {group.title}
              </a>
            ))}
          </nav>

          <div className="space-y-10">
            {FAQ_GROUPS.map((group) => (
              <section key={group.id} id={group.id} className="scroll-mt-24">
                <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">{group.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 mb-3">{group.blurb}</p>
                <div className="border border-border rounded-xl divide-y divide-border overflow-hidden">
                  {group.items.map((item) => {
                    const id = `${group.id}-${item.question}`;
                    const expanded = open === id;
                    return (
                      <div key={id} className="bg-card">
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => setOpen(expanded ? null : id)}
                          className="w-full text-left p-4 hover:bg-muted/40"
                        >
                          <span className="flex items-center justify-between gap-4">
                            <span className="text-sm font-medium text-foreground">{item.question}</span>
                            <ChevronDown
                              className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`}
                            />
                          </span>
                        </button>
                        {expanded && (
                          <p className="px-4 pb-4 -mt-1 text-sm text-muted-foreground leading-6">{item.answer}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-10 border border-border rounded-xl bg-card p-5">
            <h2 className="font-display text-base font-semibold text-foreground mb-1">Still need an answer?</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Tell us what is missing or what looks wrong and we will check it against the official source.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link to="/contact" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Contact us
              </Link>
              <Link to="/credits" className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground">
                Credits &amp; sources
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Faq;
