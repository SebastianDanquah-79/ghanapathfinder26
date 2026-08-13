import { ExternalLink } from "lucide-react";

import { toast } from "sonner";

interface Props {
  href?: string | null;
  label: string;
  /** Message shown when no verified link exists. */
  fallbackNote?: string;
  variant?: "primary" | "ghost";
  className?: string;
}

/**
 * External link that makes it clear the student is leaving GhanaPath,
 * and never renders an unverified/missing URL as an active link.
 */
const OfficialLink = ({
  href,
  label,
  fallbackNote = "Link unavailable — check the official website.",
  variant = "primary",
  className = "",
}: Props) => {
  const base =
    "inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[44px] sm:min-h-[40px] rounded-lg text-xs font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground hover:opacity-90"
      : "bg-secondary text-muted-foreground hover:text-foreground";

  if (!href) {
    return (
      <button
        type="button"
        onClick={() => toast.info(fallbackNote)}
        title="Unverified link"
        className={`${base} bg-secondary text-muted-foreground/70 ${className}`}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        {label}
      </button>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${label} — opens in a new tab`}
      className={`${base} ${styles} ${className}`}
    >
      <ExternalLink className="h-3.5 w-3.5" />
      {label}
    </a>
  );
};

export default OfficialLink;
