import { useMemo, useState } from "react";

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
  [/university of mines and technology|\bumat\b/i, "umat.edu.gh"],
  [/ghana communication technology university|\bgctu\b/i, "gctu.edu.gh"],
  [/koforidua technical university|\bktu\b/i, "ktu.edu.gh"],
  [/university of ghana|\bug\b/i, "ug.edu.gh"],
  [/kwame nkrumah university of science and technology|\bknust\b/i, "knust.edu.gh"],
  [/university of cape coast|\bucc\b/i, "ucc.edu.gh"],
];

const BrandLogo = ({ name, websiteUrl, logoUrl, size = 40, className = "" }: BrandLogoProps) => {
  const suppliedDomain = domainOf(websiteUrl ?? logoUrl ?? null);
  const knownDomain = knownDomains.find(([pattern]) => pattern.test(name))?.[1] ?? null;
  const domain = suppliedDomain ?? knownDomain;

  const sources = useMemo(() => {
    const list: string[] = [];
    if (logoUrl && /^https?:\/\//.test(logoUrl)) list.push(logoUrl);
    if (domain) {
      list.push(`https://${domain}/favicon.ico`);
      list.push(`https://${domain}/favicon.png`);
      list.push(`https://www.google.com/s2/favicons?sz=128&domain=${domain}`);
      list.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
    }
    return [...new Set(list)];
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
          onError={() => setIndex((i) => Math.min(i + 1, sources.length))}
        />
      ) : (
        <span className="text-[11px] font-bold text-muted-foreground">{initialsOf(name)}</span>
      )}
    </span>
  );
};

export default BrandLogo;
