import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import SectionHeader from "@/components/SectionHeader";
import { SKILLS } from "@/data/skillsMap";

interface CreditGroup {
  heading: string;
  note: string;
  items: { name: string; url: string; use: string }[];
}

const OFFICIAL: CreditGroup = {
  heading: "Official Ghanaian sources",
  note: "Institutional, regulatory and sector information is summarised from authoritative sources and linked back to the organisation that publishes it. Source links were refreshed for this release on 11 September 2026.",
  items: [
    { name: "Ghana Tertiary Education Commission (GTEC)", url: "https://gtec.edu.gh/", use: "Accredited institutions, programmes and tertiary regulation" },
    { name: "GTEC: Explore Institutions", url: "https://gtec.edu.gh/explore-institutions/", use: "Current institution categories and accreditation reference" },
    { name: "GTEC: Unrecognised Institutions", url: "https://gtec.edu.gh/unrecognized-institutions-by-gtec/", use: "Current public warning list" },
    { name: "West African Examinations Council (WAEC Ghana)", url: "https://www.waecgh.org/", use: "WASSCE grading and examination context" },
    { name: "Ghana Education Service", url: "https://ges.gov.gh/", use: "Pre-tertiary education structure" },
    { name: "Ghana Health Service", url: "https://ghs.gov.gh/", use: "Health system structure" },
    { name: "Bank of Ghana", url: "https://www.bog.gov.gh/", use: "Financial sector regulation" },
    { name: "Ghana Revenue Authority", url: "https://gra.gov.gh/", use: "Taxation and compliance" },
    { name: "Environmental Protection Agency, Ghana", url: "https://epa.gov.gh/", use: "Environmental regulation" },
    { name: "Food and Drugs Authority, Ghana", url: "https://fdaghana.gov.gh/", use: "Food, medicines and health-product regulation" },
    { name: "Ghana Scholarships Authority", url: "https://scholarships.gov.gh/", use: "Current government scholarship opportunities and notices" },
    { name: "Students Loan Trust Fund", url: "https://www.sltf.gov.gh/", use: "Student financing information" },
    { name: "General Legal Council", url: "https://www.glc.gov.gh/", use: "Legal education and professional regulation" },
    { name: "Pharmacy Council Ghana", url: "https://pcghana.org/", use: "Pharmacy education, licensing and regulation" },
  ],
};

const Credits = () => {
  const learning = Array.from(
    new Map(
      SKILLS.flatMap((s) => s.resources)
        .filter((r) => r.url.startsWith("http"))
        .map((r) => [r.provider, r]),
    ).values(),
  ).sort((a, b) => a.provider.localeCompare(b.provider));

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Credits, Sources & Acknowledgements | GhanaPathFinder"
        description="Official sources, regulators and learning providers used by GhanaPathFinder, with a September 2026 information refresh note."
        path="/credits"
        jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Credits", path: "/credits" }])]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="Acknowledgements"
            title="Credits &"
            highlight="sources"
            description="GhanaPathFinder summarises public information in its own words and links back to the organisation that publishes it. Provider names, logos and trademarks remain the property of their respective owners."
          />

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="font-display font-semibold text-foreground mb-1">{OFFICIAL.heading}</h2>
            <p className="text-xs text-muted-foreground mb-3">{OFFICIAL.note}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {OFFICIAL.items.map((i) => (
                <li key={i.url} className="rounded-lg bg-secondary/60 p-3">
                  <a href={i.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary">{i.name}</a>
                  <p className="text-xs text-muted-foreground">{i.use}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="font-display font-semibold text-foreground mb-1">Learning providers</h2>
            <p className="text-xs text-muted-foreground mb-3">Courses, documentation, videos and certifications linked from our skills pages. GhanaPathFinder is not affiliated with or endorsed by these providers.</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {learning.map((r) => (
                <li key={r.provider} className="rounded-lg bg-secondary/60 p-3">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary">{r.provider}</a>
                  <p className="text-xs text-muted-foreground">{r.type} • {r.cost}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-glass rounded-xl p-4">
            <h2 className="font-display font-semibold text-foreground mb-2">How we handle information</h2>
            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
              <li>Institution, programme and regulator facts are linked to authoritative sources whenever available.</li>
              <li>Dynamic admissions, fees, scholarship deadlines and accreditation status can change; always check the latest official notice before acting.</li>
              <li>Where something cannot be verified we show “Information unavailable” rather than inventing an answer.</li>
              <li>Student-contributed content is labelled “Student Insight” and is not presented as official.</li>
              <li>Expired opportunities are labelled as closed or expired rather than silently presented as current.</li>
              <li>Logos and images belong to their owners; when a reliable source cannot be established, the UI should say so.</li>
              <li>Spotted something wrong or missing? Tell us on the <a href="/contact" className="text-primary">contact page</a>.</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Credits;
