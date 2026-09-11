import { useState } from "react";
import { Mail, Phone, Linkedin, Quote, Compass, GraduationCap, Wallet, Briefcase, Bookmark, Sparkles } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { Link } from "@/lib/router-compat";
import founderPhoto from "@/assets/founder-sebastian-2.png.asset.json";
import cofounderPhoto from "@/assets/founder-som.jpg.asset.json";
import seraphinePhoto from "@/assets/seraphine-kattah.jpg.asset.json";

const expectations = [
  "Personalised path planning",
  "University and programme discovery",
  "Scholarships and student financing",
  "Career and skills intelligence",
  "Applications, deadlines and saved options",
  "Alternative routes when the first route does not fit",
  "Source-backed Ghana-specific information",
  "A personal My Path journey",
];

const offers = [
  { icon: Compass, title: "Discover", body: "Explore universities, programmes, careers, skills and opportunities across Ghana." },
  { icon: GraduationCap, title: "Decide", body: "Compare routes and understand what each option means for your next step." },
  { icon: Wallet, title: "Fund", body: "Find scholarships, student financing and funding opportunities, with current status clearly labelled." },
  { icon: Briefcase, title: "Build", body: "Connect your destination to skills, projects, experience and practical milestones." },
  { icon: Bookmark, title: "Track", body: "Save options and keep applications, deadlines and progress organised in one place." },
  { icon: Sparkles, title: "Personalise", body: "Use your goals, interests, academic profile and constraints to build a more relevant path." },
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
    bio: "Founder of GhanaPathFinder and a Computer Science student at Ghana Communication Technology University. Sebastian leads product direction and engineering, with a focus on AI, software, hardware and robotics. His earlier work includes building an open-source Tiny Tapeout microchip project, an adaptive traffic-light controller in Verilog, and student technology initiatives. He also has experience in IT, robotics leadership and technical project development.",
    responsibilities: ["Product and engineering", "Platform architecture", "Data and partnerships"],
    emails: ["ghanapath26@gmail.com", "tumikwabena79@gmail.com"],
    phone: "0243783567",
    linkedin: "https://www.linkedin.com/in/sebastian-danquah-761a98346?utm_source=share_via&utm_content=profile&utm_medium=member_android",
  },
  {
    name: "Som Emmanuel Egyir",
    role: "Co-Founder | Aspiring Electrical Engineer",
    location: "Accra, Ghana",
    photo: cofounderPhoto.url,
    initials: "SE",
    bio: "Som Emmanuel Egyir is an aspiring Electrical Engineer and Co-Founder of GhanaPathFinder, with interests in Electrical Engineering, Artificial Intelligence, software development, healthcare technology, education technology and entrepreneurship. He focuses on research, marketing, promotion and reviewing the platform to improve its value to users.",
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
    photo: seraphinePhoto.url,
    initials: "SK",
    bio: "Seraphine Enam Kattah is an entrepreneur, youth advocate and Chief Communications & Research Officer at GhanaPathFinder. She leads communications and user research, helping ensure that product decisions are grounded in evidence and that the platform remains useful to young people across Ghana.",
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
        {f.photo ? <img src={f.photo} alt={`${f.name}, ${f.role}`} loading="lazy" className="h-20 w-20 shrink-0 rounded-2xl object-cover object-top border border-border" /> : <div className="h-20 w-20 shrink-0 rounded-2xl grid place-items-center bg-secondary border border-border font-display text-xl font-bold text-primary">{f.initials}</div>}
        <div className="min-w-0">
          <h3 className="font-display font-semibold text-foreground text-base leading-tight">{f.name}</h3>
          <p className="text-sm text-primary mt-0.5">{f.role}</p>
          {f.location && <p className="text-xs text-muted-foreground mt-0.5">{f.location}</p>}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground leading-relaxed">{expanded ? f.bio : preview}</p>
        {f.bio.length > 220 && <button onClick={() => setExpanded((v) => !v)} className="mt-2 text-sm font-medium text-primary hover:underline">{expanded ? "Show less" : "Read more"}</button>}
      </div>
      {f.quote && <p className="flex gap-2 text-sm italic text-foreground/80 border-l-2 border-primary pl-3"><Quote className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />{f.quote}</p>}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Key responsibilities</h4>
        <ul className="flex flex-wrap gap-1.5">{f.responsibilities.map((r) => <li key={r} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">{r}</li>)}</ul>
      </div>
      <div className="mt-auto space-y-2 text-sm">
        {f.emails.map((e) => <a key={e} href={`mailto:${e}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="truncate">{e}</span></a>)}
        {f.phone && <a href={`tel:${f.phone}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Phone className="h-4 w-4 shrink-0" aria-hidden="true" />{f.phone}</a>}
        <a href={f.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"><Linkedin className="h-4 w-4" aria-hidden="true" />LinkedIn</a>
      </div>
    </article>
  );
};

const About = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="About GhanaPathFinder | Ghanaian Life Decision Platform"
      description="GhanaPathFinder helps people in Ghana discover, compare and plan education, careers, skills, funding and opportunities around a personal path."
      path="/about"
      jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "About", path: "/about" }]), { "@context": "https://schema.org", "@type": "AboutPage", name: "About GhanaPathFinder", url: "https://ghanapathfinder.com/about", isPartOf: { "@id": "https://ghanapathfinder.com/#website" } }]}
    />
    <Navbar />
    <main className="pt-20 pb-16 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <header className="space-y-3">
          <p className="text-sm font-medium text-primary">A Ghanaian life decision platform</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Your path should be bigger than one school choice.</h1>
          <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">GhanaPathFinder helps people in Ghana understand the options in front of them, compare realistic routes and turn a destination into a practical plan across education, careers, skills, funding and opportunity.</p>
        </header>

        <section aria-labelledby="expect" className="space-y-3">
          <h2 id="expect" className="font-display text-lg font-semibold text-foreground">What you can expect</h2>
          <ul className="grid gap-2 sm:grid-cols-2">{expectations.map((e) => <li key={e} className="text-sm text-muted-foreground bg-glass rounded-xl px-4 py-3">{e}</li>)}</ul>
        </section>

        <section aria-labelledby="offer" className="space-y-3">
          <h2 id="offer" className="font-display text-lg font-semibold text-foreground">How the platform works</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{offers.map(({ icon: Icon, title, body }) => <div key={title} className="bg-glass rounded-2xl p-4"><Icon className="h-5 w-5 text-primary mb-2" aria-hidden="true" /><h3 className="font-display font-semibold text-foreground text-sm mb-1">{title}</h3><p className="text-sm text-muted-foreground leading-relaxed">{body}</p></div>)}</div>
        </section>

        <section aria-labelledby="mission" className="space-y-3">
          <h2 id="mission" className="font-display text-lg font-semibold text-foreground">Our mission</h2>
          <p className="bg-glass rounded-2xl p-5 text-sm text-muted-foreground leading-relaxed">To make important life decisions easier to understand for people in Ghana by bringing trustworthy information, practical planning and multiple possible routes into one place. There is rarely only one route to a good future.</p>
        </section>

        <section aria-labelledby="founders" className="space-y-3">
          <h2 id="founders" className="font-display text-lg font-semibold text-foreground">Our team</h2>
          <div className="grid gap-4 md:grid-cols-2 items-stretch">{founders.map((f) => <FounderCard key={f.name} f={f} />)}</div>
        </section>

        <section aria-labelledby="refs" className="space-y-3">
          <h2 id="refs" className="font-display text-lg font-semibold text-foreground">Information and verification</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Institution, programme, accreditation, scholarship and regulatory information is sourced from official or authoritative organisations where possible. Dynamic facts such as deadlines, fees and recognition status can change, so GhanaPathFinder provides source links and expects users to confirm important decisions with the relevant organisation.</p>
          <div className="flex flex-wrap gap-3 text-sm"><Link to="/references" className="text-primary underline">References and acknowledgements</Link><Link to="/credits" className="text-primary underline">Credits and sources</Link><Link to="/terms" className="text-primary underline">Terms and Conditions</Link></div>
        </section>

        <section aria-labelledby="contact" className="space-y-3">
          <h2 id="contact" className="font-display text-lg font-semibold text-foreground">Contact</h2>
          <div className="bg-glass rounded-2xl p-5 space-y-2 text-sm"><a href="mailto:ghanapath26@gmail.com" className="flex items-center gap-2 text-muted-foreground hover:text-primary"><Mail className="h-4 w-4 shrink-0" aria-hidden="true" />ghanapath26@gmail.com</a><p className="text-muted-foreground">Founder: Sebastian Danquah. Co-Founder: Som Emmanuel Egyir.</p></div>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default About;
