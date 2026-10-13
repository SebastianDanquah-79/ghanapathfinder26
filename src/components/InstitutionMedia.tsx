import { useEffect, useMemo, useState } from "react";
import { ExternalLink, MapPinned } from "lucide-react";

type Media = {
  logo: string | null;
  campusImage: string | null;
  source?: string | null;
  campusAttribution?: string | null;
  campusLicense?: string | null;
};
type CampusPhoto = {
  url: string;
  attribution?: string;
  attributionUrl?: string | null;
  title?: string;
  license?: string;
  source?: string;
};
type CampusCandidate = {
  url: string;
  sourceUrl?: string | null;
  attribution?: string | null;
  title?: string | null;
  license?: string | null;
};

const KNOWN_MEDIA: Record<string, Media> = {
  "university-of-ghana": {
    logo: "https://ug75.ug.edu.gh/file/logo-mainjpg",
    campusImage: "https://www.adomonline.com/wp-content/uploads/2019/11/Balme_Library_of_University_of_Ghana_Accra_Ghana.jpg",
  },
  "kwame-nkrumah-university-of-science-and-technology": {
    logo: null,
    campusImage: "https://www.knust.edu.gh/sites/default/files/2024-12/KNUST%20Receives%20QAA%20International%20Institutional%20Accreditation.jpg",
  },
  "university-of-cape-coast": {
    logo: "https://ucc.edu.gh/img/ucc-logos/vertical-logo/blue-vertical-logo/ucclogo_vertical_blue.png",
    campusImage: "https://kuulchat.com/universities/slides/f92d6569ac374f5f1b67da02d9fcd813.jpg",
  },
  "ghana-communication-technology-university": {
    logo: null,
    campusImage: "https://laptopfriendly.co/images/places/accra/ghana-communication-technology-university/ghana-communication-technology-university--accra.jpg",
  },
  "university-of-mines-and-technology": {
    logo: null,
    campusImage: "https://umat.edu.gh/images/AboutUs/umat-administration2.jpg",
  },
  "university-of-energy-and-natural-resources": {
    logo: null,
    campusImage: "https://i0.wp.com/galexgh.com/wp-content/uploads/2021/09/EoD7M0VW8AAHCIr.jpg",
  },
  "koforidua-technical-university": {
    logo: null,
    campusImage: "https://www.ghanabusinessnews.com/wp-content/uploads/2023/06/Koforidua-Technical-University.jpg",
  },
  "university-of-professional-studies-accra": {
    logo: "https://e4impact.org/wp-content/uploads/2022/04/upsa.jpg",
    campusImage: "https://pbs.twimg.com/media/GBC_CPYX0AIgFra.jpg",
  },
  "university-of-education-winneba": {
    logo: null,
    campusImage: "https://uew.edu.gh/sites/default/files/2022-09/winneba-campus.jpg",
  },
  "university-for-development-studies": {
    logo: null,
    campusImage: "https://uds.edu.gh/logmein/uploads/posts/95ce143da2b86545d1fae475785a34d7.jpg",
  },
  "university-of-health-and-allied-sciences": {
    logo: null,
    campusImage: "https://www.primenewsghana.com/images/2019/jan/12/University-of-Health-and-Allied-Sciences-.jpg",
  },
  "central-university": {
    logo: null,
    campusImage: "https://pbs.twimg.com/media/FNi6UxfVEAoiAFk.jpg",
  },
  "academic-city-university": {
    logo: null,
    campusImage: "https://craydel-test-cms.blr1.digitaloceanspaces.com/IQBVYMH3SWD0HGZFXULY.webp",
  },
  "delexes-university-college": {
    logo: "https://admission.delexesuniversity.edu.gh/assets/logo.png",
    campusImage: "https://delexesuniversity.edu.gh/wp-content/uploads/2025/01/campus.jpg",
  },
};

// The first 50 university-level institutions are covered here: 16 public universities,
// 10 public technical universities and 24 chartered private tertiary institutions.
// Domains are used only when a stronger explicit logo is not already available.
const FIRST_50_LOGO_DOMAINS: Record<string, string> = {
  "akenten-appiah-menka-university-of-skills-training-and-entrepreneurial-development": "aamusted.edu.gh",
  "c-k-tedam-university-of-technology-and-applied-sciences": "cut.edu.gh",
  "ghana-institute-of-management-and-public-administration": "gimpa.edu.gh",
  "s-d-dombo-university-of-business-and-integrated-development-studies": "sdub.edu.gh",
  "university-of-environment-and-sustainable-development": "uesd.edu.gh",
  "university-of-media-arts-and-communication": "unimac.edu.gh",
  "accra-technical-university": "atu.edu.gh",
  "bolgatanga-technical-university": "btu.edu.gh",
  "cape-coast-technical-university": "cctu.edu.gh",
  "dr-hilla-limann-technical-university": "dhltu.edu.gh",
  "ho-technical-university": "htu.edu.gh",
  "kumasi-technical-university": "kstu.edu.gh",
  "sunyani-technical-university": "stu.edu.gh",
  "takoradi-technical-university": "ttu.edu.gh",
  "tamale-technical-university": "tatu.edu.gh",
  "academic-city-university": "acity.edu.gh",
  "accra-metropolitan-university": "amu.edu.gh",
  "african-university-of-communication-and-business": "auc.edu.gh",
  "akrofi-christaller-institute-of-theology-mission-and-culture": "acimc.edu.gh",
  "all-nations-university": "anu.edu.gh",
  "ashesi-university": "ashesi.edu.gh",
  "catholic-university": "cug.edu.gh",
  "central-university": "central.edu.gh",
  "christian-service-university": "csuc.edu.gh",
  "ensign-global-university": "ensign.edu.gh",
  "entrance-university-of-health-sciences": "entrance.edu.gh",
  "family-health-university": "fhu.edu.gh",
  "garden-city-university": "gcuc.edu.gh",
  "heritage-christian-university": "hcu.edu.gh",
  "kaaf-university": "kaaf.edu.gh",
  "knutsford-university": "knutsford.edu.gh",
  "methodist-university": "mug.edu.gh",
  "nobel-international-business-university": "nibs.edu.gh",
  "pentecost-university": "pentvars.edu.gh",
  "presbyterian-university": "presbyuniversity.edu.gh",
  "thrivus-university-for-biomedical-science-and-technology": "thrivus.edu.gh",
  "trinity-theological-seminary": "tts.edu.gh",
  "university-of-gold-coast": "ug.edu.gh",
  "valley-view-university": "vvu.edu.gh",
};

const normalize = (value: string) => value.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const cacheKey = (url: string) => `ghanapathfinder:institution-media:v7:${url}`;

const faviconForDomain = (domain?: string | null) => domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : null;
const domainFromWebsite = (websiteUrl?: string | null) => {
  try {
    return websiteUrl ? new URL(websiteUrl).hostname.replace(/^www\\./, "") : null;
  } catch {
    return null;
  }
};

export default function InstitutionMedia({
  websiteUrl,
  name,
  location,
  logoSourceUrl,
  googlePlaceId,
  variant = "card",
}: {
  websiteUrl?: string | null;
  name: string;
  location?: string | null;
  logoSourceUrl?: string | null;
  googlePlaceId?: string | null;
  variant?: "card" | "hero";
}) {
  const normalizedName = normalize(name);
  const known = KNOWN_MEDIA[normalizedName];
  const [media, setMedia] = useState<Media>(known ?? { logo: null, campusImage: null });
  const [campusPhotos, setCampusPhotos] = useState<CampusPhoto[]>([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [failedLogoSources, setFailedLogoSources] = useState<string[]>([]);

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
    setImageIndex(0);
    setFailedLogoSources([]);
    setCampusPhotos([]);
    setMedia(known ?? { logo: null, campusImage: null });
  }, [name, websiteUrl, googlePlaceId]);

  useEffect(() => {
    if (!endpoint || !websiteUrl) return;
    let cancelled = false;
    try {
      const cached = window.localStorage.getItem(cacheKey(websiteUrl));
      if (cached) {
        const value = JSON.parse(cached) as Media;
        setMedia((current) => ({
          logo: value.logo ?? current.logo,
          campusImage: value.campusImage ?? current.campusImage,
          source: value.source ?? current.source ?? websiteUrl,
          campusAttribution: value.campusImage ? "Institution website" : current.campusAttribution,
          campusLicense: value.campusImage ? "Institution website asset" : current.campusLicense,
        }));
      }
    } catch {}

    fetch(endpoint)
      .then((response) => (response.ok ? response.json() : null))
      .then((value: Media | null) => {
        if (cancelled || !value) return;
        setMedia((current) => ({
          logo: value.logo ?? current.logo,
          campusImage: value.campusImage ?? current.campusImage,
          source: value.source ?? current.source ?? websiteUrl,
          campusAttribution: value.campusImage ? "Institution website" : current.campusAttribution,
          campusLicense: value.campusImage ? "Institution website asset" : current.campusLicense,
        }));
        try { window.localStorage.setItem(cacheKey(websiteUrl), JSON.stringify(value)); } catch {}
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [endpoint, websiteUrl]);

  useEffect(() => {
    if (!name.trim()) return;
    let cancelled = false;
    const params = new URLSearchParams({ name });
    if (location) params.set("location", location);
    if (googlePlaceId) params.set("placeId", googlePlaceId);

    fetch(`/api/campus-photos?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((value: { photos?: CampusPhoto[] } | null) => {
        if (cancelled) return;
        const validPhotos = (value?.photos ?? []).filter(
          (photo): photo is CampusPhoto & { url: string } =>
            Boolean(photo.url && /^https?:\/\//.test(photo.url) || photo.url?.startsWith("/api/google-place-photo?")),
        );
        setCampusPhotos(validPhotos);
        setImageIndex(0);
      })
      .catch(() => {
        if (!cancelled) setCampusPhotos([]);
      });

    // Google Places photo resource names are deliberately not stored in localStorage or a client cache.
    return () => { cancelled = true; };
  }, [googlePlaceId, name, location]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, location, "Ghana"].filter(Boolean).join(", "))}`;

  const campusCandidates = useMemo(() => {
    const candidates: CampusCandidate[] = [
      ...campusPhotos.map((photo) => ({
        url: photo.url,
        sourceUrl: photo.attributionUrl ?? photo.url,
        attribution: photo.attribution ?? (photo.source === "Google Places" ? "Google Maps" : null),
        title: photo.title ?? null,
        license: photo.license ?? null,
      })),
      ...(media.campusImage ? [{
        url: media.campusImage,
        sourceUrl: media.source ?? websiteUrl ?? null,
        attribution: media.campusAttribution ?? null,
        title: name,
        license: media.campusLicense ?? null,
      }] : []),
    ];
    const unique = new Map<string, CampusCandidate>();
    for (const candidate of candidates) {
      if (candidate.url && !unique.has(candidate.url)) unique.set(candidate.url, candidate);
    }
    return [...unique.values()];
  }, [campusPhotos, media.campusImage, media.source, media.campusAttribution, media.campusLicense, websiteUrl, name]);

  const logoCandidates = useMemo(() => {
    const domain = domainFromWebsite(websiteUrl) ?? FIRST_50_LOGO_DOMAINS[normalizedName];
    return [...new Set([
      logoSourceUrl,
      media.logo,
      domain ? `https://${domain}/favicon.ico` : null,
      domain ? `https://${domain}/favicon.png` : null,
      domain ? faviconForDomain(domain) : null,
      domain ? `https://icons.duckduckgo.com/ip3/${domain}.ico` : null,
    ].filter((candidate): candidate is string => Boolean(candidate && /^https:\/\//.test(candidate))))];
  }, [logoSourceUrl, media.logo, websiteUrl, normalizedName]);

  const activeCampus = campusCandidates[imageIndex] ?? null;
  const image = activeCampus?.url ?? null;
  const logo = logoCandidates.find((candidate) => !failedLogoSources.includes(candidate)) ?? null;
  const logoAlt = logo && (logo === logoSourceUrl || logo === media.logo) ? `${name} logo` : `${name} official website icon`;
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "GH";

  const handleLogoError = (source: string) => {
    setFailedLogoSources((current) => current.includes(source) ? current : [...current, source]);
  };

  const fallback = (
    <div className="flex h-full w-full items-center justify-center bg-[#E77917] px-5 pb-28 pt-6 text-center sm:px-8">
      <div className="max-w-xl min-w-0">
        {logo ? (
          <img src={logo} alt={logoAlt} className="mx-auto mb-3 h-14 w-14 object-contain" referrerPolicy="no-referrer" onError={() => handleLogoError(logo)} />
        ) : (
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-white/40 bg-white/15 text-lg font-bold text-white">{initials}</div>
        )}
        <p className="break-words text-balance text-base font-semibold leading-snug text-white [overflow-wrap:anywhere] sm:text-lg">{name}</p>
        <p className="mt-2 break-words text-xs leading-relaxed text-white/85">Campus photo unavailable. Open the institution's official website or Google Maps to view its location.</p>
      </div>
    </div>
  );

  const CampusImage = ({ eager = false }: { eager?: boolean }) => image ? (
    <img
      src={image}
      alt={`${name} campus`}
      className="h-full w-full object-cover"
      loading={eager ? "eager" : "lazy"}
      referrerPolicy="no-referrer"
      onError={() => setImageIndex((current) => current + 1)}
    />
  ) : fallback;

  if (variant === "hero") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary">
        <div className="aspect-[16/8] min-h-[15rem] sm:aspect-[16/6] sm:min-h-48"><CampusImage eager /></div>
        {image && activeCampus && (activeCampus.attribution || activeCampus.license) && (
          <div className="absolute left-3 top-3 max-w-[calc(100%-1.5rem)] rounded-md bg-black/60 px-2 py-1 text-[10px] leading-snug text-white backdrop-blur-sm">
            {activeCampus.license ? `${activeCampus.license}` : "Photo credit"}{activeCampus.attribution ? ` · ${activeCampus.attribution}` : ""}
            {activeCampus.sourceUrl && <a href={activeCampus.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline underline-offset-2">Source</a>}
          </div>
        )}
        <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2 sm:inset-x-4 sm:bottom-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-border bg-background/95 p-2 shadow-sm sm:h-16 sm:w-16">
            {logo ? <img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" onError={() => handleLogoError(logo)} /> : <span className="text-base font-bold text-muted-foreground">{initials}</span>}
          </div>
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-lg border border-border bg-background/95 px-3 text-xs font-medium text-foreground shadow-sm backdrop-blur"><MapPinned className="h-3.5 w-3.5 shrink-0" /> Campus map</a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
      <div className="aspect-[16/8]"><CampusImage /></div>
      {image && activeCampus && (activeCampus.attribution || activeCampus.license) && (
        <div className="absolute left-2 top-2 max-w-[calc(100%-1rem)] rounded-md bg-black/60 px-2 py-1 text-[9px] leading-snug text-white backdrop-blur-sm">
          {activeCampus.license ? `${activeCampus.license}` : "Photo credit"}{activeCampus.attribution ? ` · ${activeCampus.attribution}` : ""}
          {activeCampus.sourceUrl && <a href={activeCampus.sourceUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline underline-offset-2">Source</a>}
        </div>
      )}
      <div className="absolute left-3 bottom-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background/95 p-1.5 shadow-sm">{logo ? <img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" loading="lazy" referrerPolicy="no-referrer" onError={() => handleLogoError(logo)} /> : <span className="text-sm font-bold text-muted-foreground">{initials}</span>}</div>
      <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="absolute right-3 bottom-3 inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-background/90 px-2.5 text-[11px] font-medium text-foreground backdrop-blur"><ExternalLink className="h-3 w-3" /> Maps</a>
    </div>
  );
}
