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
  note: "Institutional, regulatory and sector information is taken from these bodies. Facts are summarised in GhanaPathFinder's own words and linked back to the source.",
  items: [
    { name: "Ghana Tertiary Education Commission (GTEC)", url: "https://gtec.edu.gh/", use: "Accredited institutions and programmes" },
    { name: "West African Examinations Council (WAEC)", url: "https://www.waecgh.org/", use: "WASSCE grading and results context" },
    { name: "Ghana Education Service", url: "https://ges.gov.gh/", use: "Pre-tertiary education structure" },
    { name: "Ghana Health Service", url: "https://ghs.gov.gh/", use: "Health system structure and placements" },
    { name: "Bank of Ghana", url: "https://www.bog.gov.gh/", use: "Financial sector regulation" },
    { name: "Ghana Revenue Authority", url: "https://gra.gov.gh/", use: "Taxation and compliance" },
    { name: "Environmental Protection Agency, Ghana", url: "https://epa.gov.gh/", use: "Environmental assessment rules" },
    { name: "Food and Drugs Authority, Ghana", url: "https://fdaghana.gov.gh/", use: "Food and medicines safety" },
    { name: "Scholarships Secretariat", url: "https://www.scholarshipgh.gov.gh/", use: "Government scholarship information" },
    { name: "Student Loan Trust Fund", url: "https://www.sltf.gov.gh/", use: "Student financing information" },
    { name: "Public Procurement Authority", url: "https://ppa.gov.gh/", use: "Construction and procurement practice" },
    { name: "Petroleum Commission Ghana", url: "https://www.petrocom.gov.gh/", use: "Energy sector and local content" },
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
        description="Every organisation, dataset and learning provider GhanaPathFinder links to or draws on, credited in full — from GTEC and WAEC to freeCodeCamp, Khan Academy and Coursera."
        path="/credits"
        jsonLd={[
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Credits", path: "/credits" },
          ]),
        ]}
      />
      <Navbar />
      <main className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            badge="Acknowledgements"
            title="Credits &"
            highlight="sources"
            description="GhanaPathFinder does not copy other people's content. We summarise publicly available information in our own words and link back to the organisation that published it. Every provider below owns its own material and trademarks."
          />

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="font-display font-semibold text-foreground mb-1">{OFFICIAL.heading}</h2>
            <p className="text-xs text-muted-foreground mb-3">{OFFICIAL.note}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {OFFICIAL.items.map((i) => (
                <li key={i.url} className="rounded-lg bg-secondary/60 p-3">
                  <a
                    href={i.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {i.name}
                  </a>
                  <p className="text-xs text-muted-foreground">{i.use}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-glass rounded-xl p-4 mb-4">
            <h2 className="font-display font-semibold text-foreground mb-1">Learning providers</h2>
            <p className="text-xs text-muted-foreground mb-3">
              Courses, YouTube channels, documentation and certifications linked from our skills pages.
              GhanaPathFinder is not affiliated with, endorsed by, or earning commission from any of them.
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {learning.map((r) => (
                <li key={r.provider} className="rounded-lg bg-secondary/60 p-3">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-primary"
                  >
                    {r.provider}
                  </a>
                  <p className="text-xs text-muted-foreground">{r.type} • {r.cost}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="bg-glass rounded-xl p-4">
            <h2 className="font-display font-semibold text-foreground mb-2">How we handle information</h2>
            <ul className="list-disc pl-4 text-sm text-muted-foreground space-y-1">
              <li>Facts about institutions come from the institution or its regulator, with a source link and a last-checked date.</li>
              <li>Where something cannot be verified we show “Information unavailable” instead of guessing.</li>
              <li>Student-contributed content is labelled “Student Insight”, never presented as official.</li>
              <li>Expired opportunities are labelled “Expired” rather than removed silently.</li>
              <li>Logos and images belong to their owners; where none can be reliably sourced we show “Logo unavailable” or “Image unavailable”.</li>
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
