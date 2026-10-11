import { useState } from "react";
import PortalShell from "./PortalShell";
import { Link } from "@/lib/router-compat";
import { Sparkles, Search } from "@/lib/icons";

export default function StudentPortal() {
  const [interest, setInterest] = useState("");
  const recommendationUrl = "/admission-match" + (interest.trim() ? "?interest=" + encodeURIComponent(interest.trim()) : "");
  return (
    <PortalShell role="student">
      <section className="mt-6 border border-primary/30 bg-primary/[0.04] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-1 h-5 w-5 shrink-0 text-primary" />
          <div className="w-full">
            <h2 className="text-lg font-semibold">Find programmes that fit your WASSCE results</h2>
            <p className="mt-1 text-sm text-muted-foreground">We compare your saved WASSCE grades with programme entry evidence, then rank possible university matches. Add a subject, programme or career interest to narrow the results.</p>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={e => { e.preventDefault(); window.location.href = recommendationUrl; }}>
              <label className="sr-only" htmlFor="student-programme-interest">Programme or career interest</label>
              <input id="student-programme-interest" value={interest} onChange={e => setInterest(e.target.value)} placeholder="e.g. Computer Science, Nursing, Engineering" className="min-h-11 w-full border border-border bg-background px-3 text-sm" />
              <Link to={recommendationUrl} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-primary px-4 text-sm font-semibold text-primary-foreground"><Search className="h-4 w-4" /> Get recommendations</Link>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">Recommendations are guidance, not an admission offer. Check the institution’s current official entry requirements.</p>
          </div>
        </div>
      </section>
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        <a className="border border-border bg-card p-4 hover:border-primary" href="/my-path"><p className="font-semibold">My Path</p><p className="mt-1 text-xs text-muted-foreground">Turn decisions into a plan.</p></a>
        <a className="border border-border bg-card p-4 hover:border-primary" href="/careers"><p className="font-semibold">Career paths</p><p className="mt-1 text-xs text-muted-foreground">Connect programmes to work.</p></a>
        <a className="border border-border bg-card p-4 hover:border-primary" href="/feed"><p className="font-semibold">Community feed</p><p className="mt-1 text-xs text-muted-foreground">See what people are building.</p></a>
      </section>
    </PortalShell>
  );
}
