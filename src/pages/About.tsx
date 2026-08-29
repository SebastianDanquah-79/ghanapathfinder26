import { useState } from "react";
import { Mail, Phone, Linkedin, Quote, Compass, GraduationCap, Wallet, Briefcase, Bookmark, Sparkles } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { Link } from "@/lib/router-compat";
import founderPhoto from "@/assets/founder-sebastian-2.png.asset.json";
import cofounderPhoto from "@/assets/founder-som.jpg.asset.json";

const expectations = [
  "Personalised university recommendations",
  "Programme discovery",
  "Scholarship opportunities",
  "Career exploration",
  "University comparisons",
  "Saved universities and programmes",
  "Application planning",
  "Educational resources",
];

const offers = [
  { icon: Compass, title: "Discover universities", body: "Browse accredited institutions across Ghana by category, region and type." },
  { icon: GraduationCap, title: "Explore programmes", body: "Understand what you study, entry requirements and where a programme leads." },
  { icon: Wallet, title: "Find funding", body: "Search scholarships, check eligibility and track deadlines in one place." },
  { icon: Briefcase, title: "Plan a career", body: "Connect programmes to real career paths and realistic salary expectations." },
  { icon: Bookmark, title: "Save and compare", body: "Keep universities, programmes and scholarships in your account across devices." },
  { icon: Sparkles, title: "Get recommendations", body: "Use your WASSCE results to see where your aggregate realistically fits." },
];

type Founder = {
  name: string;
  role: string;
  location?: string;
  photo?: string;
  initials: string;
  bio: string;
  responsibilities: string[];
  emails: string[];
  phone?: string;
  linkedin: string;
  quote?: string;
};

const founders: Founder[] = [
  {
    name: "Sebastian Danquah",
    role: "Founder, GhanaPathFinder",
    photo: founderPhoto.url,
    initials: "SD",
    bio: "Currently the Founder at GhanaPathFinder, a venture focused on innovative solutions in the Ghanaian tech ecosystem and the world as a whole, while pursuing a high school diploma in Science IT at Suhum Senior High/Tech School. Previous roles include Vice President of Robotics, IT personnel, and Assistant Treasurer of CASU, showcasing leadership and technical acumen. Skilled in prompt engineering, hardware verification, and testing, with certifications in machine learning, OpenAI APIs, and circuit principles. Recognised for academic excellence with the DGA Excellence Award for 2022/2023. Combining technical expertise with leadership, focused on driving innovation in hardware technologies.",
    responsibilities: ["Product and engineering", "Platform architecture", "Data and partnerships"],
    emails: ["ghanapath26@gmail.com", "tumikwabena79@gmail.com"],
    phone: "0243783567",
    linkedin:
      "https://www.linkedin.com/in/sebastian-danquah-761a98346?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  },
  {
    name: "Som Emmanuel Egyir",
    role: "Co-Founder | Aspiring Electrical Engineer",
    location: "Accra, Ghana",
    photo: cofounderPhoto.url,
    initials: "SE",
    bio: "Som Emmanuel Egyir is an aspiring Electrical Engineer and Co-Founder of GhanaPathFinder, with interests in Electrical Engineering, Artificial Intelligence, Generative AI, software development, healthcare technology, education technology, and entrepreneurship. A General Science graduate of Adisadel College, he has demonstrated leadership as an Organizer of the Adisadel College Cybersecurity Club, Dispensary Prefect, and SRC Welfare Officer. He also gained practical healthcare experience through an internship at Health Net Airport Medical Centre.\n\nAs a Co-Founder of GhanaPathFinder, Som focuses on research, marketing, promotion, and reviewing the platform to improve its value to users. His vision is to use technology and engineering to help people make informed educational and career decisions and discover the right path for their future.",
    responsibilities: ["Research and content quality", "Marketing and promotion", "Platform review"],
    emails: ["somemmanuel354@gmail.com"],
    phone: "0533286832",
    linkedin: "https://www.linkedin.com/in/som-emmanuel-egyir-b6a09a41b?utm_source=share_via&utm_content=profile&utm_medium=member_android",
    quote: "The right path can change a future; my goal is to use technology to help people discover theirs.",
  },
  {
    name: "Seraphine Enam Kattah",
    role: "Chief Communications & Research Officer (CCRO)",
    location: "Accra, Ghana",
    initials: "SK",
    bio: "I am Seraphine Enam Kattah, an entrepreneur, youth advocate, and Chief Communications & Research Officer at GhanaPathFinder. I am committed to expanding opportunities for Africa's next generation through technology and innovation, with a particular focus on the girl child. At GhanaPathFinder, I lead the organisation's communications strategy and user research, ensuring every decision is grounded in evidence and every message serves the students we exist for. A proud alumna of Wesley Girls' High School, I believe every young African deserves the tools and guidance to build a meaningful future.",
    responsibilities: ["Communications strategy", "User research", "Youth advocacy & partnerships"],
    emails: ["enamseraphinekattah92@gmail.com"],
    linkedin: "https://www.linkedin.com/in/seraphine-enam-kattah-b997a22bb?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  },
];

const FounderCard = ({ f }: { f: Founder }) => {
  const [expanded, setExpanded] = useState(false);
  const preview = f.bio.length > 220 ? f.bio.slice(0, 220).trimEnd() + "..." : f.bio;

  return (
    <article className="bg-glass rounded-2xl p-5 flex flex-col gap-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
        {f.photo ? (
          <img
            src={f.photo}
            alt={`${f.name}, ${f.role}`}
            loading="lazy"
            className="h-20 w-20 shrink-0 rounded-2xl object-cover object-top border border-border"
          />
        ) : (
          <div className="h-20 w-20 shrink-0 rounded-2xl grid place-items-center bg-secondary border border-border font-display text-xl font-bold text-primary">
            {f.initials}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-foreground text-base leading-tight">{f.name}</h3>
          <p className="text-sm text-primary mt-0.5">{f.role}</p>
          {f.location && <p className="text-xs text-muted-foreground mt-0.5">{f.location}</p>}
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground leading-relaxed">{expanded ? f.bio : preview}</p>
        {f.bio.length > 220 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 text-sm font-medium text-primary hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}
      </div>

      {f.quote && (
        <p className="flex gap-2 text-sm italic text-foreground/80 border-l-2 border-primary pl-3">
          <Quote className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          {f.quote}
        </p>
      )}

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
          Key responsibilities
        </h4>
        <ul className="flex flex-wrap gap-1.5">
          {f.responsibilities.map((r) => (
            <li key={r} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
              {r}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto space-y-2 text-sm">
        {f.emails.map((e) => (
          <a key={e} href={`mailto:${e}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{e}</span>
          </a>
        ))}
        <a href={`tel:${f.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary">
          <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
          {f.phone}
        </a>
        <a
          href={f.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Linkedin className="h-4 w-4" aria-hidden="true" />
          LinkedIn
        </a>
      </div>
    </article>
  );
};

const About = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="About GhanaPathFinder: Education & Career Platform for Ghana"
      description="GhanaPathFinder brings university discovery, programmes, careers, scholarships and WASSCE-based recommendations into one platform for students in Ghana."
      path="/about"
      jsonLd={[
        breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]),
        {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "About GhanaPathFinder",
          url: "https://ghanapathfinder.com/about",
          isPartOf: { "@id": "https://ghanapathfinder.com/#website" },
        },
      ]}
    />
    <Navbar />
    <main className="pt-20 pb-16 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-3">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">About GhanaPathFinder</h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            GhanaPathFinder is an AI powered college and career companion built to help students explore universities,
            programmes, scholarships, careers and educational opportunities in Ghana.
          </p>
        </header>

        <section aria-labelledby="expect" className="space-y-3">
          <h2 id="expect" className="font-display text-lg font-semibold text-foreground">
            What you can expect
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {expectations.map((e) => (
              <li key={e} className="text-sm text-muted-foreground bg-glass rounded-xl px-4 py-3">
                {e}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="offer" className="space-y-3">
          <h2 id="offer" className="font-display text-lg font-semibold text-foreground">
            What we offer
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map(({ icon: Icon, title, body }) => (
              <div key={title} className="bg-glass rounded-2xl p-4">
                <Icon className="h-5 w-5 text-primary mb-2" aria-hidden="true" />
                <h3 className="font-display font-semibold text-foreground text-sm mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="mission" className="space-y-3">
          <h2 id="mission" className="font-display text-lg font-semibold text-foreground">
            Our mission
          </h2>
          <p className="bg-glass rounded-2xl p-5 text-sm text-muted-foreground leading-relaxed">
            To give every Ghanaian student clear, honest and accessible information about their education and career
            options, so that the next step after Senior High School is a decision made with confidence rather than
            guesswork.
          </p>
        </section>

        <section aria-labelledby="founders" className="space-y-3">
          <h2 id="founders" className="font-display text-lg font-semibold text-foreground">
            Our founders
          </h2>
          <div className="grid gap-4 md:grid-cols-2 items-stretch">
            {founders.map((f) => (
              <FounderCard key={f.name} f={f} />
            ))}
          </div>
        </section>

        <section aria-labelledby="contact" className="space-y-3">
          <h2 id="contact" className="font-display text-lg font-semibold text-foreground">
            Contact
          </h2>
          <div className="bg-glass rounded-2xl p-5 space-y-2 text-sm">
            <a
              href="mailto:ghanapath26@gmail.com"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              ghanapath26@gmail.com
            </a>
            <p className="text-muted-foreground">
              Founder: Sebastian Danquah, 0243783567. Co-Founder: Som Emmanuel Egyir, 0533286832.
            </p>
          </div>
        </section>

        <section aria-labelledby="refs" className="space-y-3">
          <h2 id="refs" className="font-display text-lg font-semibold text-foreground">
            References and acknowledgements
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Institution, programme and scholarship information comes from official sources including the Ghana Tertiary
            Education Commission, WAEC, regulatory councils, scholarship providers and official university websites.
            GhanaPathFinder does not own information originating from those organisations.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link to="/references" className="text-primary underline">
              Full references and acknowledgements
            </Link>
            <Link to="/terms" className="text-primary underline">
              Terms and Conditions
            </Link>
          </div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
