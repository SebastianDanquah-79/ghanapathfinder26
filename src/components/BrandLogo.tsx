import { useEffect, useMemo, useState } from "react";

interface BrandLogoProps {
  name: string;
  websiteUrl?: string | null;
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

const knownDomains: Array<[RegExp, string]> = [
  [/^university of mines and technology\b/i, "umat.edu.gh"],
  [/^ghana communication technology university\b/i, "gctu.edu.gh"],
  [/^koforidua technical university\b/i, "ktu.edu.gh"],
  [/^university of ghana\b/i, "ug.edu.gh"],
  [/^kwame nkrumah university of science and technology\b/i, "knust.edu.gh"],
  [/^university of cape coast\b/i, "ucc.edu.gh"],
];

// Reject generic icon providers and regulator/placeholder images, but allow
// legitimate logo files hosted directly by an institution's own domain.
const isGenericIcon = (url: string) =>
  /s2\/favicons|icons\.duckduckgo\.com|gtec\.edu\.gh|placeholder/i.test(url);

const logoCacheKey = (domain: string) => `ghanapathfinder:brand-logo:v2:${domain}`;

const BrandLogo = ({ name, websiteUrl, logoUrl, size = 40, className = "" }: BrandLogoProps) => {
  const suppliedWebsiteDomain = domainOf(websiteUrl);
  const suppliedLogoDomain = domainOf(logoUrl);
  const knownDomain = knownDomains.find(([pattern]) => pattern.test(name))?.[1] ?? null;
  const domain = knownDomain ?? suppliedWebsiteDomain ?? suppliedLogoDomain;

  const [resolved, setResolved] = useState<string | null>(() => {
    if (typeof window === "undefined" || !domain) return null;
    try {
      return window.localStorage.getItem(logoCacheKey(domain));
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!domain || resolved) return;
    let cancelled = false;
    const site = `https://${domain}`;

    fetch(`/api/institution-media?url=${encodeURIComponent(site)}&name=${encodeURIComponent(name)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((value: { logo?: string | null } | null) => {
        const logo = value?.logo;
        if (cancelled || !logo || isGenericIcon(logo)) return;
        setResolved(logo);
        try {
          window.localStorage.setItem(logoCacheKey(domain), logo);
        } catch {}
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [domain, name, resolved]);

  const sources = useMemo(() => {
    const list: string[] = [];

    if (resolved && !isGenericIcon(resolved)) list.push(resolved);

    // A supplied logo is useful when it is hosted on the institution's own
    // domain. Never let a third-party icon service become the institution logo.
    if (
      logoUrl &&
      /^https?:\/\//.test(logoUrl) &&
      !isGenericIcon(logoUrl) &&
      (!suppliedLogoDomain || suppliedLogoDomain === domain)
    ) {
      list.push(logoUrl);
    }

    if (domain) {
      // Direct institution-hosted assets are preferred over third-party services.
      list.push(`https://${domain}/favicon.ico`);
      list.push(`https://${domain}/favicon.png`);
      list.push(`https://${domain}/favicon.svg`);
      list.push(`https://${domain}/logo.png`);
      list.push(`https://${domain}/logo.svg`);
    }

    // Last-resort generic services. These are intentionally not cached as the
    // institution's resolved logo.
    if (domain) {
      list.push(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
      list.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
    }

    return [...new Set(list)];
  }, [resolved, logoUrl, suppliedLogoDomain, domain]);

  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [sources.join("|")]);

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
          onError={() => setIndex((i) => Math.min(i + 1, sources.length))}
        />
      ) : (
        <span className="text-[11px] font-bold text-muted-foreground">{initialsOf(name)}</span>
      )}
    </span>
  );
};

export default BrandLogo;
