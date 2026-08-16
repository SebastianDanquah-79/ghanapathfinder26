import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { DISCLAIMER_SUMMARY, DISCLAIMER_PARAGRAPHS } from "@/lib/legal";

/** Compact, expandable disclaimer shown at the very top of the public site. */
const DisclaimerBanner = () => {
  const [open, setOpen] = useState(false);
  return (
    <section aria-label="GhanaPathFinder disclaimer" className="px-4 pt-2">
      <div className="max-w-7xl mx-auto bg-glass border border-border/60 rounded-xl p-3 sm:p-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              GhanaPathFinder disclaimer
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{DISCLAIMER_SUMMARY}</p>

            {open && (
              <div className="mt-2 space-y-2">
                {DISCLAIMER_PARAGRAPHS.map((p) => (
                  <p key={p.slice(0, 30)} className="text-xs text-muted-foreground">
                    {p}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary min-h-[36px]"
                aria-expanded={open}
              >
                {open ? "Hide" : "Show"} summary details
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
              </button>
              <Link to="/disclaimer" className="text-xs font-medium text-primary underline min-h-[36px] inline-flex items-center">
                Read Full Disclaimer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DisclaimerBanner;
