import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";

const points: { h: string; p: string }[] = [
  { h: "Information we handle", p: "Depending on features you use, GhanaPathFinder may process account details, name and email, education history and WASSCE results you enter, interests and career goals, saved items and tracked applications, profile content and image, portfolio links, feedback, and technical or security logs." },
  { h: "How information is used", p: "Information helps operate accounts, provide search and education guidance, remember saved items, generate recommendations, support applications you track, protect the service and improve reliability. We do not sell personal information." },
  { h: "Talent Discovery and public profiles", p: "Profile details and photos may be shown to other users only according to your visibility choices and the platform's access controls. Do not publish information you want to keep private. Private account credentials and private contact details must not be exposed as public profile fields. You can change visibility or remove profile information using available controls." },
  { h: "AI features", p: "Prompts and limited context you submit to AI features may be processed by the configured AI provider to generate a response. Do not enter passwords or sensitive personal information, or another person's information without permission. AI answers can be inaccurate and should be checked against official sources. Provider terms and privacy practices may also apply." },
  { h: "Service providers and security", p: "Hosting, database, authentication and AI providers may process information to provide their services. We use access controls and reasonable safeguards, but no online service can guarantee absolute security." },
  { h: "Usage data and cookies", p: "Technical logs, security events, browser information and usage events may be processed to operate, troubleshoot and protect the website. Where analytics or cookies are used, they should be limited to disclosed purposes and applicable settings." },
  { h: "Retention and your choices", p: "Information is retained for as long as reasonably needed to operate the service, address security issues and meet applicable obligations. You may edit your profile and remove saved items using available controls. For access, correction or deletion requests, use the contact channel published on the website. Some records may need to be retained for legal or security reasons." },
  { h: "Students and children", p: "Share only information needed to use the service. If you are under 18, ask a parent, guardian or trusted adult for help before sharing sensitive information online. Do not upload another student's results or personal details without permission." },
  { h: "External links", p: "University, scholarship, employer and other third-party links lead to services with their own privacy policies. GhanaPathFinder does not control those external practices." },
  { h: "Updates and contact", p: "We may update this policy as features and data practices change. The latest version will be published here. Contact the GhanaPathFinder team using the contact details published on the website for privacy requests or questions." },
];

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Seo title="Privacy Policy | GhanaPathFinder" description="How GhanaPathFinder handles account information, public talent profiles, AI prompts, education data and privacy requests." path="/privacy" jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }])]} />
    <Navbar />
    <main className="pt-20 pb-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-5">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Effective date: 12 October 2026. This product policy should be reviewed by a qualified legal professional against applicable Ghanaian law and the platform's actual data practices.</p>
        </header>
        <div className="space-y-3">{points.map((s) => <section key={s.h} className="bg-glass rounded-xl p-4"><h2 className="font-display font-semibold text-foreground text-sm mb-1">{s.h}</h2><p className="text-sm text-muted-foreground leading-relaxed">{s.p}</p></section>)}</div>
      </div>
    </main>
    <Footer />
  </div>
);
export default Privacy;
