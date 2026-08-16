import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo, { breadcrumbLd } from "@/components/Seo";
import { Link } from "@/lib/router-compat";
import { Mail, Flag, BookMarked } from "lucide-react";

const Contact = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="Contact GhanaPathFinder"
      description="Report an out-of-date requirement, suggest an institution or programme, or ask a question about GhanaPathFinder."
      path="/contact"
      jsonLd={[breadcrumbLd([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]}
    />
    <Navbar />
    <main className="pt-20 pb-12 px-4 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">Contact us</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          <section className="bg-glass rounded-xl p-4">
            <Mail className="h-5 w-5 text-primary mb-2" />
            <h2 className="font-display font-semibold text-foreground text-sm mb-1">Email</h2>
            <a href="mailto:hello@ghanapathfinder.com" className="text-sm text-primary underline">
              hello@ghanapathfinder.com
            </a>
            <p className="text-xs text-muted-foreground mt-2">
              Questions, partnership requests and feedback about the platform.
            </p>
          </section>
          <section className="bg-glass rounded-xl p-4">
            <Flag className="h-5 w-5 text-primary mb-2" />
            <h2 className="font-display font-semibold text-foreground text-sm mb-1">Report wrong information</h2>
            <p className="text-xs text-muted-foreground">
              Every programme page has a feedback control — use it to flag an out-of-date requirement,
              cut-off point or link, and include the official source if you have it.
            </p>
          </section>
          <section className="bg-glass rounded-xl p-4 sm:col-span-2">
            <BookMarked className="h-5 w-5 text-primary mb-2" />
            <h2 className="font-display font-semibold text-foreground text-sm mb-1">Checking a source first?</h2>
            <p className="text-xs text-muted-foreground">
              The{" "}
              <Link to="/references" className="text-primary underline">source directory</Link>{" "}
              lists every official website GhanaPathFinder actually uses, what it verifies and when it
              was last checked.
            </p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Contact;
