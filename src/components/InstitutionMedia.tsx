import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPinned } from "lucide-react";

type Media = { logo: string | null; campusImage: string | null };

const KNOWN_MEDIA: Record<string, Media> = {
  "university-of-ghana": {
    logo: "https://ug75.ug.edu.gh/file/logo-mainjpg",
    campusImage: "https://www.adomonline.com/wp-content/uploads/2019/11/Balme_Library_of_University_of_Ghana_Accra_Ghana.jpg",
  },
  "university-of-professional-studies-accra": {
    logo: "https://e4impact.org/wp-content/uploads/2022/04/upsa.jpg",
    campusImage: "https://pbs.twimg.com/media/GBC_CPYX0AIgFra.jpg",
  },
  "delexes-university-college": {
    logo: "https://admission.delexesuniversity.edu.gh/assets/logo.png",
    campusImage: "https://delexesuniversity.edu.gh/wp-content/uploads/2025/01/campus.jpg",
  },
};

const normalize = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cacheKey = (url: string) => `ghanapathfinder:institution-media:v5:${url}`;

export default function InstitutionMedia({ websiteUrl, name, variant = "card" }: { websiteUrl?: string | null; name: string; variant?: "card" | "hero" }) {
  const known = KNOWN_MEDIA[normalize(name)];
  const [media, setMedia] = useState<Media>(known ?? { logo: null, campusImage: null });
  const [imageFailed, setImageFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const endpoint = useMemo(() => {
    if (!websiteUrl) return null;
    try {
      const url = new URL(websiteUrl);
      if (url.protocol !== "https:") return null;
      return `/api/institution-media?url=${encodeURIComponent(url.toString())}&name=${encodeURIComponent(name)}`;
    } catch {
      return null;
    }
  }, [websiteUrl, name]);

  useEffect(() => {
    setImageFailed(false);
    setLogoFailed(false);
  }, [name, websiteUrl]);

  useEffect(() => {
    if (!endpoint || !websiteUrl) return;
    let cancelled = false;
    try {
      const cached = window.localStorage.getItem(cacheKey(websiteUrl));
      if (cached) {
        const value = JSON.parse(cached) as Media;
        setMedia((current) => ({ logo: current.logo ?? value.logo, campusImage: current.campusImage ?? value.campusImage }));
      }
    } catch {}

    fetch(endpoint)
      .then((response) => (response.ok ? response.json() : null))
      .then((value: Media | null) => {
        if (cancelled || !value) return;
        setMedia((current) => ({ logo: current.logo ?? value.logo, campusImage: current.campusImage ?? value.campusImage }));
        try { window.localStorage.setItem(cacheKey(websiteUrl), JSON.stringify(value)); } catch {}
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [endpoint, websiteUrl]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} Ghana`)}`;
  const image = imageFailed ? null : media.campusImage;
  const logo = logoFailed ? null : media.logo;

  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "GH";
  const fallback = (
    <div className="flex h-full w-full items-center justify-center bg-secondary px-6 text-center">
      <div className="max-w-xl">
        {logo ? <img src={logo} alt={`${name} logo`} className="mx-auto mb-3 h-16 w-16 object-contain" referrerPolicy="no-referrer" onError={() => setLogoFailed(true)} /> : <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-background text-xl font-bold text-primary">{initials}</div>}
        <p className="font-semibold text-foreground">{name}</p>
        <p className="mt-1 text-xs text-muted-foreground">Institutional media is being resolved from verified public sources.</p>
      </div>
    </div>
  );

  const CampusImage = ({ eager = false }: { eager?: boolean }) => image ? <img src={image} alt={`${name} campus`} className="h-full w-full object-cover" loading={eager ? "eager" : "lazy"} referrerPolicy="no-referrer" onError={() => setImageFailed(true)} /> : fallback;

  if (variant === "hero") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary">
        <div className="aspect-[16/6] min-h-48"><CampusImage eager /></div>
        <div className="absolute inset-x-4 bottom-4 flex items-end gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-background/95 p-2 shadow-sm">
            {logo ? <img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" onError={() => setLogoFailed(true)} /> : <span className="text-lg font-bold text-muted-foreground">{initials}</span>}
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-background/90 px-3 text-xs font-medium text-foreground backdrop-blur"><MapPinned className="h-3.5 w-3.5" /> Campus map</a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
      <div className="aspect-[16/8]"><CampusImage /></div>
      <div className="absolute left-3 bottom-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background/95 p-1.5 shadow-sm">{logo ? <img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" loading="lazy" referrerPolicy="no-referrer" onError={() => setLogoFailed(true)} /> : <span className="text-sm font-bold text-muted-foreground">{initials}</span>}</div>
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="absolute right-3 bottom-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-background/90 px-2.5 text-[11px] font-medium text-foreground backdrop-blur"><ExternalLink className="h-3 w-3" /> Maps</a>
    </div>
  );
}
