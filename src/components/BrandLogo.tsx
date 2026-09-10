import { useMemo, useState } from "react";

interface BrandLogoProps {
  name: string;
  /** Official website of the institution or company. */
  websiteUrl?: string | null;
  /** Explicit logo URL from the database (takes priority). */
  logoUrl?: string | null;
  size?: number;
  className?: string;
}

const domainOf = (url?: string | null) => {
  if (!url) return null;
  try {
    const withProto = url.startsWith("http") ? url : `https://${url}`;
    return new URL(withProto).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
};

const initialsOf = (name: string) =>
  name
    .replace(/[^A-Za-z ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 || /^[A-Z]{2,}$/.test(w))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || name.slice(0, 2).toUpperCase();

/**
 * Institution / employer logo resolved from the organisation's own website
 * domain first, with reliable favicon fallbacks and an initials fallback.
 */
const BrandLogo = ({ name, websiteUrl, logoUrl, size = 40, className = "" }: BrandLogoProps) => {
  const domain = domainOf(websiteUrl ?? logoUrl ?? null);
  const sources = useMemo(() => {
    const list: string[] = [];

    // Explicit logo URLs from trusted first-party data take priority.
    if (logoUrl && /^https?:\/\//.test(logoUrl)) list.push(logoUrl);

    // Prefer the organisation's own favicon before third-party resolvers.
    if (domain) {
      list.push(`https://${domain}/favicon.ico`);
      list.push(`https://${domain}/favicon.png`);
      list.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
      list.push(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
    }

    return list;
  }, [logoUrl, domain]);

  const [index, setIndex] = useState(0);
  const src = sources[index];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary border border-border ${className}`}
      style={{ width: size, height: size }}
      aria-hidden={!src}
    >
      {src ? (
        <img
          src={src}
          alt={`${name} logo`}
          width={size}
          height={size}
          loading="lazy"
          className="h-full w-full object-contain p-1"
          onError={() => setIndex((i) => i + 1)}
        />
      ) : (
        <span className="text-[11px] font-bold text-muted-foreground">{initialsOf(name)}</span>
      )}
    </span>
  );
};

export default BrandLogo;
