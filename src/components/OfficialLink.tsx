import { ExternalLink } from "@/lib/icons";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface Props {
  href?: string | null;
  label: string;
  /** Message shown when no verified link exists. */
  fallbackNote?: string;
  variant?: "primary" | "ghost";
  className?: string;
}

/**
 * External link that makes it clear the student is leaving GhanaPathFinder,
 * and never renders an unverified/missing URL as an active link.
 *
 * For university directory website links, we also resolve the institution's
 * official favicon/logo so the directory does not fall back to text-only cards.
 */
const OfficialLink = ({
  href,
  label,
  fallbackNote = "Link unavailable , check the official website.",
  variant = "primary",
  className = "",
}: Props) => {
  const [logo, setLogo] = useState<string | null>(null);
  const showInstitutionLogo = label === "Website" && !!href;

  useEffect(() => {
    if (!showInstitutionLogo || !href) return;
    try {
      const url = new URL(href);
      if (url.protocol !== "https:") return;
      const key = `ghanapathfinder:institution-media:${href}`;
      const cached = window.localStorage.getItem(key);
      if (cached) {
        const parsed = JSON.parse(cached) as { logo?: string | null };
        if (parsed.logo) setLogo(parsed.logo);
      }
      fetch(`/api/institution-media?url=${encodeURIComponent(url.toString())}`)
        .then((response) => (response.ok ? response.json() : null))
        .then((value: { logo?: string | null } | null) => {
          if (value?.logo) setLogo(value.logo);
        })
        .catch(() => undefined);
    } catch {
      // The normal official link remains available even if media discovery fails.
    }
  }, [href, showInstitutionLogo]);

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
      title={`${label} , opens in a new tab`}
      className={`${base} ${styles} ${className}`}
    >
      {logo && (
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="h-4 w-4 rounded-sm object-contain bg-white"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      <ExternalLink className="h-3.5 w-3.5" />
      {label}
    </a>
  );
};

export default OfficialLink;
