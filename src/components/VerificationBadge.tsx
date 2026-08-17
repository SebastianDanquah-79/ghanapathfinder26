import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldCheck, Shield, ExternalLink } from "@/lib/icons";
import { prettyHost } from "@/lib/legal";

export type VerificationBadgeProps = {
  /** Comes from the database (universities.verification_status / programmes.verification_status). */
  verified: boolean;
  /** ISO timestamp of the last verification, from the database. */
  lastVerifiedAt?: string | null;
  /** Official source URL stored on the record. */
  sourceUrl?: string | null;
  /** Human readable name of the source, when stored. */
  sourceName?: string | null;
  /** Short description of what exactly was checked. */
  whatVerified?: string;
  /** Recorded reason a record is not verified, when the database stores one. */
  reason?: string | null;
  /** Title of the record being described. */
  subject?: string;
  className?: string;
};


const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "Date not recorded";

const VerificationBadge = ({
  verified,
  lastVerifiedAt,
  sourceUrl,
  sourceName,
  whatVerified = "Institution details, accreditation status and published programme information.",
  reason,
  subject,
  className = "",

}: VerificationBadgeProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${className}`}>
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium ${
            verified ? "text-ghana-green" : "text-muted-foreground"
          }`}
        >
          {verified ? <ShieldCheck className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
          {verified ? "Verified" : "Not verified"}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          className="relative z-10 inline-flex items-center min-h-[36px] px-2.5 rounded-lg bg-secondary text-[11px] font-medium text-muted-foreground hover:text-foreground active:text-primary"
        >
          {verified ? "Why verified?" : "What does this mean?"}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">
              {verified ? "Verified information" : "Not verified"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 text-sm text-muted-foreground">
            {subject && <p className="text-foreground font-medium break-words">{subject}</p>}

            {verified ? (
              <>
                <p>
                  Verified information has been checked against an authoritative or official source,
                  such as a university, regulatory body, government institution, or official
                  organisation.
                </p>
                <dl className="space-y-2 rounded-lg bg-secondary p-3 text-[13px]">
                  <div>
                    <dt className="text-foreground">Source</dt>
                    <dd className="break-words">
                      {sourceName || (sourceUrl ? prettyHost(sourceUrl) : "Official institutional source")}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-foreground">Status</dt>
                    <dd>Verified against official information</dd>
                  </div>
                  {sourceUrl && (
                    <div>
                      <dt className="text-foreground">Official source</dt>
                      <dd className="break-all">
                        <a
                          href={sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {sourceUrl}
                        </a>
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-foreground">What was verified</dt>
                    <dd>{whatVerified}</dd>
                  </div>
                  <div>
                    <dt className="text-foreground">Last verified</dt>
                    <dd>{formatDate(lastVerifiedAt)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <>
                <p>
                  Not verified means GhanaPathFinder has not yet confirmed the information through a
                  sufficiently reliable official or authoritative source. It does not automatically
                  mean the information is incorrect.
                </p>
                <dl className="space-y-2 rounded-lg bg-secondary p-3 text-[13px]">
                  <div>
                    <dt className="text-foreground">Reason</dt>
                    <dd>{reason || "No official source has been recorded for this entry yet."}</dd>
                  </div>
                </dl>
              </>
            )}


            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {verified ? "Open source" : "Check official source"}
              </a>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default VerificationBadge;
