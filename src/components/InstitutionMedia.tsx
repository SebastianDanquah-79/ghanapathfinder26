import { useEffect, useMemo, useState } from "react";
import { MapPinned } from "lucide-react";

type Media = { logo: string | null; campusImage: string | null };

const KNOWN_MEDIA: Record<string, Media> = {
  "university-of-ghana": { logo: "https://ug75.ug.edu.gh/file/logo-mainjpg", campusImage: "https://www.adomonline.com/wp-content/uploads/2019/11/Balme_Library_of_University_of_Ghana_Accra_Ghana.jpg" },
  "kwame-nkrumah-university-of-science-and-technology": { logo: null, campusImage: "https://www.knust.edu.gh/sites/default/files/2024-12/KNUST%20Receives%20QAA%20International%20Institutional%20Accreditation.jpg" },
  "university-of-cape-coast": { logo: "https://ucc.edu.gh/img/ucc-logos/vertical-logo/blue-vertical-logo/ucclogo_vertical_blue.png", campusImage: "https://kuulchat.com/universities/slides/f92d6569ac374f5f1b67da02d9fcd813.jpg" },
  "ghana-communication-technology-university": { logo: null, campusImage: "https://laptopfriendly.co/images/places/accra/ghana-communication-technology-university/ghana-communication-technology-university--accra.jpg" },
  "university-of-mines-and-technology": { logo: null, campusImage: "https://umat.edu.gh/images/AboutUs/umat-administration2.jpg" },
  "university-of-energy-and-natural-resources": { logo: null, campusImage: "https://i0.wp.com/galexgh.com/wp-content/uploads/2021/09/EoD7M0VW8AAHCIr.jpg" },
  "koforidua-technical-university": { logo: null, campusImage: "https://www.ghanabusinessnews.com/wp-content/uploads/2023/06/Koforidua-Technical-University.jpg" },
  "university-of-professional-studies-accra": { logo: "https://e4impact.org/wp-content/uploads/2022/04/upsa.jpg", campusImage: "https://pbs.twimg.com/media/GBC_CPYX0AIgFra.jpg" },
  "university-of-education-winneba": { logo: null, campusImage: "https://uew.edu.gh/sites/default/files/2022-09/winneba-campus.jpg" },
  "university-for-development-studies": { logo: null, campusImage: "https://uds.edu.gh/logmein/uploads/posts/95ce143da2b86545d1fae475785a34d7.jpg" },
  "university-of-health-and-allied-sciences": { logo: null, campusImage: "https://www.primenewsghana.com/images/2019/jan/12/University-of-Health-and-Allied-Sciences-.jpg" },
  "central-university": { logo: null, campusImage: "https://pbs.twimg.com/media/FNi6UxfVEAoiAFk.jpg" },
  "academic-city-university": { logo: null, campusImage: "https://craydel-test-cms.blr1.digitaloceanspaces.com/IQBVYMH3SWD0HGZFXULY.webp" },
  "delexes-university-college": { logo: "https://admission.delexesuniversity.edu.gh/assets/logo.png", campusImage: "https://delexesuniversity.edu.gh/wp-content/uploads/2025/01/campus.jpg" },
};

const normalize = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cacheKey = (url: string) => `ghanapathfinder:institution-media:v8:${url}`;

const InstitutionMedia = ({ websiteUrl, name, logoSourceUrl, googlePlaceId, variant = "card" }: { websiteUrl?: string | null; name: string; logoSourceUrl?: string | null; googlePlaceId?: string | null; variant?: "card" | "hero" }) => {
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
        setMedia(current => ({ logo: current.logo ?? value.logo, campusImage: current.campusImage ?? value.campusImage }));
      }
    } catch {}
    fetch(endpoint)
      .then(response => response.ok ? response.json() : null)
      .then((value: Media | null) => {
        if (cancelled || !value) return;
        setMedia(current => ({ logo: current.logo ?? value.logo, campusImage: current.campusImage ?? value.campusImage }));
        try { window.localStorage.setItem(cacheKey(websiteUrl), JSON.stringify(value)); } catch {}
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [endpoint, websiteUrl]);

  useEffect(() => {
    if (!googlePlaceId) return;
    let cancelled = false;
    const params = new URLSearchParams({ name, placeId: googlePlaceId });
    fetch(`/api/campus-photos?${params.toString()}`)
      .then(response => response.ok ? response.json() : null)
      .then((value: { photos?: Array<{ url?: string }> } | null) => {
        const campusImage = value?.photos?.find(photo => photo.url)?.url;
        if (!cancelled && campusImage) setMedia(current => ({ ...current, campusImage }));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [googlePlaceId, name]);

  const image = imageFailed ? null : media.campusImage;
  const logo = logoFailed ? null : (logoSourceUrl ?? media.logo);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} Ghana`)}`;

  const fallback = <div className="h-full w-full bg-[#E77917]" aria-label={`${name} campus photo unavailable`} />;
  const CampusImage = ({ eager = false }: { eager?: boolean }) => image ? <img src={image} alt={`${name} campus`} className="h-full w-full object-cover" loading={eager ? "eager" : "lazy"} referrerPolicy="no-referrer" onError={() => setImageFailed(true)} /> : fallback;

  if (variant === "hero") return <div className="relative overflow-hidden rounded-xl border border-border bg-secondary"><div className="aspect-[16/6] min-h-48"><CampusImage eager /></div>{image && <><div className="absolute left-4 bottom-4 flex h-16 w-16 items-center justify-center rounded-xl border border-border bg-background/95 p-2 shadow-sm">{logo && <img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" onError={() => setLogoFailed(true)} />}</div><a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="absolute right-4 bottom-4 inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border bg-background/90 px-3 text-xs font-medium text-foreground backdrop-blur"><MapPinned className="h-3.5 w-3.5" /> Campus map</a></>}</div>;

  return <div className="relative overflow-hidden rounded-xl border border-border bg-secondary"><div className="aspect-[16/8]"><CampusImage /></div>{image && logo && <div className="absolute left-3 bottom-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background/95 p-1.5 shadow-sm"><img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" onError={() => setLogoFailed(true)} /></div>}</div>;
};

export default InstitutionMedia;
