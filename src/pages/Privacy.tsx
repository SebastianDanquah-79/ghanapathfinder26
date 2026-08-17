import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";

const points: { h: string; p: string }[] = [
  {
    h: "What we store",
    p: "When you create an account we store the details you enter yourself: name, email, school, region, target career, WASSCE results you add, saved items, deadlines and scholarship applications you track.",
  },
  {
    h: "Why we store it",
    p: "Your academic details are used to generate recommendations, admission match confidence and scholarship matches inside your own dashboard. They are not sold or shared with third parties.",
  },
  {
    h: "Anonymous usage counts",
    p: "We record anonymous page and item view events so the platform can show how many people use GhanaPathFinder. These events do not contain personal information beyond an account id when you are signed in.",
  },
  {
    h: "Parent access",
    p: "A parent can only see a student's information after the student shares an invite code and the link is accepted. Students can remove that access at any time.",
  },
  {
    h: "Your control",
    p: "You can edit your profile, delete saved items and tracked applications at any time. Write to us to request deletion of your account and its data.",
  },
];

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Privacy Policy | GhanaPathFinder"
      description="What GhanaPathFinder stores, why it is stored, how anonymous usage counts work and how students control their data."
      path="/privacy"
      jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Privacy", path: "/privacy" }])]}
    />
    <Navbar />
    <main className="pt-20 pb-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">Privacy policy</h1>
        <div className="space-y-3">
          {points.map((s) => (
            <section key={s.h} className="bg-glass rounded-xl p-4">
              <h2 className="font-display font-semibold text-foreground text-sm mb-1">{s.h}</h2>
              <p className="text-sm text-muted-foreground">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
