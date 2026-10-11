import { useState } from "react";
import PortalShell from "./PortalShell";
import { Link } from "@/lib/router-compat";
import { Sparkles, Search } from "@/lib/icons";

export default function InternationalStudentPortal() {
  const [interest, setInterest] = useState("");
  const recommendationUrl = "/admission-match" + (interest.trim() ? "?interest=" + encodeURIComponent(interest.trim()) : "");
  return (
    <PortalShell role="international-student">
      <section className="mt-6 border border-primary/30 bg-primary/[0.04] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div className="w-full">
            <h2 className="text-lg font-semibold">Find Ghana programmes for your qualifications</h2>
            <p className="mt-1 text-sm text-muted-foreground">Use your saved results and study interests to explore possible matches. If you studied under another qualification system, confirm equivalence with the institution.</p>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={e => { e.preventDefault(); window.location.href = recommendationUrl; }}>
              <label className="sr-only" htmlFor="international-programme-interest">Programme or career interest</label>
              <input id="international-programme-interest" value={interest} onChange={e => setInterest(e.target.value)} placeholder="e.g. Computer Science, Business, Public Health" className="min-h-11 w-full border border-border bg-background px-3 text-sm" />
              <Link to={recommendationUrl} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground"><Search className="h-4 w-4" /> Find study matches</Link>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">Confirm accepted qualifications, subject requirements, fees and deadlines with the official institution.</p>
          </div>
        </div>
      </section>
      <section className="mt-6 grid gap-3 sm:grid-cols-2">
        <a className="border border-border bg-card p-4 hover:border-primary" href="/international-community"><p className="font-semibold">Embassy and visa guidance</p><p className="mt-1 text-xs text-muted-foreground">Review official mission and visa information.</p></a>
        <a className="border border-border bg-card p-4 hover:border-primary" href="/admission-match"><p className="font-semibold">Qualification match</p><p className="mt-1 text-xs text-muted-foreground">Review possible matches from your saved results.</p></a>
      </section>
    </PortalShell>
  );
}
