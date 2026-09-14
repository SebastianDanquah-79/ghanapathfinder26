import { useEffect, useMemo, useState } from "react";
import { MapPinned } from "lucide-react";

type Media = { logo: string | null; campusImage: string | null; attribution?: string | null; attributionUrl?: string | null };

const KNOWN_MEDIA: Record<string, { logo: string | null }> = {
  "university-of-ghana": { logo: "https://ug75.ug.edu.gh/file/logo-mainjpg" },
  "university-of-cape-coast": { logo: "https://ucc.edu.gh/img/ucc-logos/vertical-logo/blue-vertical-logo/ucclogo_vertical_blue.png" },
  "university-of-professional-studies-accra": { logo: "https://e4impact.org/wp-content/uploads/2022/04/upsa.jpg" },
  "delexes-university-college": { logo: "https://admission.delexesuniversity.edu.gh/assets/logo.png" },
};

const normalize = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cacheKey = (url: string) => `ghanapathfinder:institution-media:v9:${url}`;

const InstitutionMedia = ({ websiteUrl, name, logoSourceUrl, googlePlaceId, variant = "card" }: { websiteUrl?: string | null; name: string; logoSourceUrl?: string | null; googlePlaceId?: string | null; variant?: "card" | "hero" }) => {
  const known = KNOWN_MEDIA[normalize(name)];
  const [media, setMedia] = useState<Media>({ logo: known?.logo ?? null, campusImage: null, attribution: null, attributionUrl: null });
  const [imageFailed, setImageFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const endpoint = useMemo(() => {
    if (!websiteUrl) return null;
    try {
      const url = new URL(websiteUrl);
      if (url.protocol !== "https:") return null;
      return `/api/institution-media?url=${encodeURIComponent(url.toString())}&name=${encodeURIComponent(name)}`;
    } catch { return null; }
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
        setMedia(current => ({ logo: current.logo ?? value.logo, campusImage: current.campusImage ?? null, attribution: current.attribution ?? value.attribution, attributionUrl: current.attributionUrl ?? value.attributionUrl }));
      }
    } catch {}
    fetch(endpoint)
      .then(response => response.ok ? response.json() : null)
      .then((value: Media | null) => {
        if (cancelled || !value) return;
        setMedia(current => ({ logo: current.logo ?? value.logo, campusImage: current.campusImage ?? null, attribution: current.attribution ?? value.attribution, attributionUrl: current.attributionUrl ?? value.attributionUrl }));
        try { window.localStorage.setItem(cacheKey(websiteUrl), JSON.stringify(value)); } catch {}
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [endpoint, websiteUrl]);

  // Search Google Maps/Places for every institution, even when the database does
  // not already contain a place ID. The API route resolves the place by name and
  // returns real Google Maps place photos. If no usable photo exists, the UI stays orange.
  useEffect(() => {
    if (!name) return;
    let cancelled = false;
    const params = new URLSearchParams({ name });
    if (googlePlaceId) params.set("placeId", googlePlaceId);
    fetch(`/api/campus-photos?${params.toString()}`)
      .then(response => response.ok ? response.json() : null)
      .then((value: { placeId?: string | null; photos?: Array<{ url?: string; attribution?: string; attributionUrl?: string | null }> } | null) => {
        const photo = value?.photos?.find(item => item.url);
        if (!cancelled && photo?.url) {
          setMedia(current => ({
            ...current,
            campusImage: photo.url ?? null,
            attribution: photo.attribution ?? "Photo via Google",
            attributionUrl: photo.attributionUrl ?? null,
          }));
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [googlePlaceId, name]);

  const image = imageFailed ? null : media.campusImage;
  const logo = logoFailed ? null : (logoSourceUrl ?? media.logo);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} Ghana`)}`;

  const fallback = <div className="h-full w-full bg-[#E77917]" aria-label={`${name} campus photo unavailable`} />;
  const CampusImage = ({ eager = false }: { eager?: boolean }) => image ? <img src={image} alt={`${name} campus`} className="h-full w-full object-cover" loading={eager ? "eager" : "lazy"} referrerPolicy="no-referrer" onError={() => setImageFailed(true)} /> : fallback;
  const attribution = image && media.attribution ? (
    media.attributionUrl ? <a href={media.attributionUrl} target="_blank" rel="noopener noreferrer" className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] text-white hover:bg-black/75">{media.attribution}</a> : <span className="absolute left-3 top-3 rounded bg-black/60 px-2 py-1 text-[10px] text-white">{media.attribution}</span>
  ) : null;

  if (variant === "hero") return <div className="relative overflow-hidden rounded-xl border border-border bg-secondary"><div className="aspect-[16/6] min-h-48"><CampusImage eager /></div>{attribution}{image && <><div className="absolute left-4 bottom-4 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-background/95 p-2 shadow-sm">{logo && <img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" onError={() => setLogoFailed(true)} />}</div><a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="absolute right-4 bottom-4 inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-background/90 px-3 text-xs font-medium text-foreground backdrop-blur"><MapPinned className="h-3.5 w-3.5" /> Campus map</a></>}</div>;

  return <div className="relative overflow-hidden rounded-xl border border-border bg-secondary"><div className="aspect-[16/8]"><CampusImage /></div>{attribution}{image && logo && <div className="absolute left-3 bottom-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background/95 p-1.5 shadow-sm"><img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" onError={() => setLogoFailed(true)} /></div>}</div>;
};

export default InstitutionMedia;
