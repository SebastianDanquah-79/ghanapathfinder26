import PortalShell from "./PortalShell";
import { ArrowUpRight, Users, Wallet, BookOpen } from "lucide-react";

const founderLinks = [
  { href: "/opportunities", title: "Startup funding and support", description: "Review current grants and founder programmes. Verify eligibility and deadlines before applying.", icon: Wallet },
  { href: "/community", title: "Founder community", description: "Share lessons, ask questions and learn from other people building in Africa.", icon: Users },
  { href: "/build", title: "Build your startup", description: "Explore practical resources to develop, test and grow your business.", icon: BookOpen },
];

export default function FounderPortal() {
  return (
    <PortalShell role="founder">
      <section className="founder-workspace">
        <header className="founder-workspace__header">
          <p className="founder-workspace__eyebrow">Founder workspace</p>
          <h2 className="founder-workspace__title">Build, fund and connect</h2>
          <p className="founder-workspace__intro">A practical workspace shaped around your founder profile and interests. Listings are research leads, not guarantees of funding or endorsement.</p>
        </header>
        <div className="founder-workspace__grid">
          {founderLinks.map(({ href, title, description, icon: Icon }) => (
            <a key={href} href={href} className="founder-workspace__card">
              <span className="founder-workspace__icon" aria-hidden="true"><Icon /></span>
              <span className="founder-workspace__copy">
                <span className="founder-workspace__card-title">{title}<ArrowUpRight className="founder-workspace__external" aria-hidden="true" /></span>
                <span className="founder-workspace__description">{description}</span>
              </span>
            </a>
          ))}
        </div>
        <p className="founder-workspace__notice">Before applying, confirm deadlines, eligibility, fees, equity terms and required documents from the official provider.</p>
      </section>
    </PortalShell>
  );
}
