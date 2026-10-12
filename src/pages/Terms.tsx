import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { Link } from "@/lib/router-compat";

const points: { h: string; p: string }[] = [
  { h: "1. About the service", p: "GhanaPathFinder is an independent education, career and opportunity discovery platform. It is not affiliated with or endorsed by GTEC, WAEC, a university, employer, scholarship provider or government body unless explicitly stated." },
  { h: "2. Accounts and eligibility", p: "Provide accurate information, protect your login credentials and access only accounts you are authorised to use. If you are under 18, involve a parent, guardian or trusted adult before sharing sensitive information or making important education or financial decisions." },
  { h: "3. Guidance and AI", p: "Search results, recommendations, admission matches, career suggestions and AI answers are informational aids, not admission decisions, legal or financial advice, or guarantees of funding, employment or acceptance. AI can be wrong; verify important claims with official sources." },
  { h: "4. Institution and programme information", p: "Institution names, programme details, qualification levels, accreditation, fees, entry requirements and deadlines can change. A listing or source link does not by itself guarantee current accreditation or programme approval. Check GTEC and the institution's official sources before applying, paying fees or relying on a qualification." },
  { h: "5. Applications and third parties", p: "You are responsible for checking eligibility, deadlines, fees and official instructions. External services have their own terms, privacy practices and decisions. GhanaPathFinder does not guarantee third-party availability or outcomes." },
  { h: "6. Public profiles and user content", p: "You are responsible for content you upload, including photographs, biographies, portfolio links and qualifications. Share only content you have a right to publish. Do not impersonate others, misrepresent credentials, harass people or disclose another person's private information without permission. Visibility depends on available settings." },
  { h: "7. Acceptable use", p: "Do not bypass access controls, interfere with the service, harvest personal information without authorisation, upload malware, or use the platform to defraud, threaten or harm others. Access may be restricted to protect users and the service." },
  { h: "8. Privacy", p: "Use of the platform is also governed by the Privacy Policy, which explains how account information, public profiles and AI prompts may be handled." },
  { h: "9. Intellectual property", p: "The platform's software, design and original content are protected by applicable intellectual-property rules. Third-party names, logos and materials remain the property of their respective owners." },
  { h: "10. Availability and changes", p: "Features and information may change, be corrected, temporarily unavailable or removed. We aim to improve accuracy but do not promise uninterrupted service or that every listing is complete and current." },
  { h: "11. Responsibility", p: "To the extent permitted by applicable law, the service is provided for informational purposes without guarantees about admissions, scholarships, employment, accreditation outcomes or third-party services. Nothing here excludes liability that cannot lawfully be excluded." },
  { h: "12. Updates and contact", p: "We may update these terms as the service changes. The latest version will be published here. Contact the GhanaPathFinder team through the contact details published on the website for questions." },
];

const Terms = () => (
  <div className="min-h-screen bg-background">
    <Seo title="Terms & Conditions | GhanaPathFinder" description="Terms for using GhanaPathFinder's education, career, AI guidance, public profiles and opportunity discovery features." path="/terms" jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Terms", path: "/terms" }])]} />
    <Navbar />
    <main className="pt-20 pb-16 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto space-y-5">
        <header className="space-y-2"><h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">Terms &amp; Conditions</h1><p className="text-sm text-muted-foreground">Effective date: 12 October 2026. This is a general product draft and should be reviewed by a qualified legal professional for compliance with applicable Ghanaian law.</p></header>
        <section aria-label="Terms of use" className="space-y-3">{points.map((s) => <article key={s.h} className="bg-glass rounded-2xl p-4"><h2 className="font-display font-semibold text-foreground text-sm mb-1">{s.h}</h2><p className="text-sm text-muted-foreground leading-relaxed">{s.p}</p></article>)}</section>
        <p className="text-sm text-muted-foreground">Read the <Link to="/privacy" className="text-primary underline">Privacy Policy</Link> and <Link to="/references" className="text-primary underline">references and acknowledgements</Link>.</p>
      </div>
    </main>
    <Footer />
  </div>
);
export default Terms;
