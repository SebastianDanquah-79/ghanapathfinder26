import { useEffect, useMemo, useState } from "react";

interface UniversityCampusImageProps {
  name: string;
  location?: string | null;
}

type CampusMedia = {
  src: string;
  sourceUrl: string;
  title: string;
  credit: string;
  license: string;
  kind: "photo" | "logo";
};

const cache = new Map<string, CampusMedia[]>();

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}`;

const verifiedCampusImages: Array<[RegExp, string[]]> = [
  [/academic city university|academic city/i, [commons("Academic City University Campus Drone Shot.jpg"), commons("Academic City University Hostel Courtyard.png"), commons("Academic City University Receration Center (REC).png")]],
  [/ashesi university|\bashesi\b/i, [commons("Ashesi's Archer Cornfield Courtyard.jpg"), commons("Founders courtyard Ashesi.jpg"), commons("Radichel Hall View Ashesi.jpg"), commons("Ashesi Todd & Ruth Warren Library.jpg")]],
  [/koforidua technical university|\bktu\b/i, [commons("Koforidua Technical University Entrance Monument.jpg"), commons("Koforidua Technical University Entrance.jpg"), commons("Business and management block.jpg"), commons("School of engineering block.jpg")]],
  [/ghana communication technology university|\bgctu\b/i, [commons("GCTU Signage 02.jpg"), commons("Hostel Block B (GCTU) 1.jpg"), commons("Student Study Area (GCTU).jpg"), commons("Parking Lot (GCTU).jpg")]],
  [/university of cape coast|\bucc\b/i, [commons("U.C.C GATE.jpg"), commons("UCC Central Administration Block and the Sam Jonah Library.jpg"), commons("University Library complex.JPG"), commons("Faculty of Education Lecture Theatre.JPG")]],
  [/university of ghana|\bug legon\b|\bug\b/i, [commons("Akuafo Hall.JPG"), commons("Akuafo Hall gardens.JPG"), commons("Akuafo Hall chapel.jpg"), commons("Vertebrate Museum @ University of Ghana.jpg")]],
  [/kwame nkrumah university of science and technology|\bknust\b/i, [commons("KNUST Administration block road.jpg"), commons("KNUST CENTRAL LAB BUILDING, KNUST.jpg"), commons("KNUST College of engineering Caesar Building.jpg"), commons("J.K SIAW AGYAPONG BUILDING - KNUST.jpg")]],
  [/university of mines and technology|\bumat\b|george grant university of mines/i, [commons("UMaT Campus 08.jpg"), commons("UMaT Campus 09.jpg"), commons("UMaT Campus 10.jpg"), commons("UMaT ED Block.jpg")]],
  [/accra technical university|\batu\b/i, [commons("Accra Technical University 01.jpg"), commons("Accra Technical University 2.jpg"), commons("Accra Technical University Ghana.jpg"), commons("View on Accra Technical University.jpg")]],
  [/tamale technical university|\btatu\b/i, [commons("A front view of TATU administration.jpg"), commons("A side view of administration of Tamale Technical University.jpg"), commons("Administration Block of TaTu.jpg"), commons("ICT block - TaTu.jpg")]],
  [/ho technical university|\bhtu\b/i, [commons("Ho Technical University gate.jpg"), commons("Ho Technical University.jpg"), commons("G. M Afeti Auditorium of HTU.jpg"), commons("New Agricultural engineering department of HTU.jpg")]],
];

const verifiedFor = (name: string) => verifiedCampusImages.find(([pattern]) => pattern.test(name))?.[1] ?? [];

const stopWords = new Set([
  "the", "and", "for", "university", "technical", "college", "school", "of", "technology", "science",
  "institute", "institution", "ghana", "national", "centre", "center", "campus", "faculty", "department",
]);

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const identityTokens = (name: string) =>
  normalize(name).split(/\s+/).filter((token) => token.length >= 3 && !stopWords.has(token));

const acronymFor = (name: string) =>
  normalize(name).split(/\s+/).filter((word) => word.length >= 2 && !stopWords.has(word)).map((word) => word[0]).join("").toLowerCase();

const isLogoTitle = (title: string) => /logo|crest|seal|emblem|coat of arms|wappen|insignia/i.test(title);

const isPhotoTitle = (title: string) => /campus|hostel|dormitory|\bdorm\b|hall|residence|accommodation|library|administration|administrative|block|building|gate|entrance|auditorium|laborator(?:y|ies)|\blab\b|faculty|lecture|courtyard|grounds|quad|sports|court|field|signage/i.test(title);

const isObviousNonUniversity = (title: string) => /stock photo|generic|portrait|headshot|wedding|church|mosque|beach|hotel|restaurant|airport|car|football player|person/i.test(title);

const matchesInstitution = (title: string, name: string) => {
  const normalizedTitle = normalize(title);
  const tokens = identityTokens(name);
  const acronym = acronymFor(name);
  const matched = tokens.filter((token) => normalizedTitle.includes(token));
  const strongTokenCount = tokens.length <= 1 ? matched.length : matched.length >= 2 ? matched.length : 0;
  const acronymMatch = acronym.length >= 3 && normalizedTitle.split(/\s+/).includes(acronym);
  return (strongTokenCount > 0 || acronymMatch) && !isObviousNonUniversity(title);
};

const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

const isPermissiveLicense = (value: string) => {
  const license = value.toLowerCase();
  if (!license || /non.?commercial|\bnc\b|no.?derivatives|\bnd\b|all rights reserved|fair use|copyrighted/i.test(license)) return false;
  return /cc0|public domain|cc by(?:-sa)?(?:\s|-)?[0-9]|creative commons attribution(?:-sharealike)?/i.test(value);
};

interface CommonsPage {
  title?: string;
  imageinfo?: Array<{
    thumburl?: string;
    url?: string;
    descriptionurl?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
}

const toMedia = (page: CommonsPage, name: string): CampusMedia | null => {
  const title = page.title ?? "";
  if (!matchesInstitution(title, name) || (!isLogoTitle(title) && !isPhotoTitle(title))) return null;
  const info = page.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  const license = stripHtml(meta.LicenseShortName?.value ?? meta.UsageTerms?.value ?? "");
  if (!isPermissiveLicense(license)) return null;
  const src = info.thumburl ?? info.url;
  if (!src) return null;
  return {
    src,
    sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
    title: title.replace(/^File:/i, ""),
    credit: stripHtml(meta.Artist?.value ?? meta.Credit?.value ?? "Wikimedia Commons contributor"),
    license,
    kind: isLogoTitle(title) ? "logo" : "photo",
  };
};

const fetchCommonsImages = async (name: string): Promise<CampusMedia[]> => {
  const terms = [
    `${name} logo crest`,
    `${name} campus building`,
    `${name} university campus`,
  ];
  const results = await Promise.all(terms.map(async (term) => {
    try {
      const params = new URLSearchParams({
        action: "query", format: "json", origin: "*", generator: "search",
        gsrsearch: term, gsrlimit: "20", gsrnamespace: "6",
        prop: "imageinfo", iiprop: "url|extmetadata", iiurlwidth: "1200", redirects: "1",
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`);
      if (!response.ok) return [];
      const payload = await response.json();
      return (Object.values(payload?.query?.pages ?? {}) as CommonsPage[])
        .map((page) => toMedia(page, name))
        .filter((item): item is CampusMedia => Boolean(item));
    } catch {
      return [];
    }
  }));

  const unique = new Map<string, CampusMedia>();
  for (const item of results.flat()) if (!unique.has(item.src)) unique.set(item.src, item);

  return [...unique.values()]
    .sort((a, b) => Number(a.kind === "logo") - Number(b.kind === "logo"))
    .slice(0, 8);
};

const isImageReachable = (src: string) => new Promise<boolean>((resolve) => {
  const image = new Image();
  const timeout = window.setTimeout(() => { image.onload = null; image.onerror = null; resolve(false); }, 8000);
  image.onload = () => { window.clearTimeout(timeout); resolve(true); };
  image.onerror = () => { window.clearTimeout(timeout); resolve(false); };
  image.src = src;
});

const hash = (value: string) => {
  let result = 0;
  for (let i = 0; i < value.length; i += 1) result = (result * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(result);
};

const initialsFor = (name: string) => {
  const words = normalize(name).split(/\s+/).filter((word) => word.length >= 2 && !stopWords.has(word));
  return (words.length >= 2 ? `${words[0][0]}${words[1][0]}` : words[0]?.slice(0, 2) ?? "GP").toUpperCase();
};

const CampusIllustration = ({ name, location }: UniversityCampusImageProps) => {
  const variant = hash(name) % 3;
  const initials = initialsFor(name);
  const label = location ? `${name} · ${location}` : name;

  return (
    <div className="relative h-full w-full overflow-hidden bg-muted" aria-label={`${label}, campus illustration`}>
      <svg viewBox="0 0 800 450" className="absolute inset-0 h-full w-full" role="img" aria-label={`${name} campus illustration`} preserveAspectRatio="xMidYMid slice">
        <rect width="800" height="450" fill="#f3f4f6" />
        <rect y="310" width="800" height="140" fill="#e5e7eb" />
        <rect y="330" width="800" height="8" fill="#d1d5db" />
        {variant === 0 && <>
          <rect x="105" y="145" width="590" height="185" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
          <path d="M85 145 L400 70 L715 145 Z" fill="#d1d5db" stroke="#94a3b8" strokeWidth="4" />
          <rect x="355" y="235" width="90" height="95" fill="#e5e7eb" stroke="#cbd5e1" strokeWidth="3" />
          {[145, 225, 525, 605].map((x) => <rect key={x} x={x} y="190" width="55" height="65" fill="#dbeafe" stroke="#cbd5e1" strokeWidth="3" />)}
        </>}
        {variant === 1 && <>
          <rect x="115" y="120" width="570" height="210" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
          <rect x="155" y="90" width="490" height="45" fill="#e5e7eb" stroke="#cbd5e1" strokeWidth="3" />
          {[155, 250, 345, 440, 535].map((x) => <rect key={x} x={x} y="175" width="55" height="120" fill="#dbeafe" stroke="#cbd5e1" strokeWidth="3" />)}
          <rect x="355" y="225" width="90" height="105" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
        </>}
        {variant === 2 && <>
          <rect x="130" y="135" width="540" height="195" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
          <path d="M130 135 H670 L610 85 H190 Z" fill="#e5e7eb" stroke="#94a3b8" strokeWidth="4" />
          {[170, 265, 360, 455, 550].map((x) => <rect key={x} x={x} y="180" width="50" height="80" fill="#dbeafe" stroke="#cbd5e1" strokeWidth="3" />)}
          <rect x="355" y="250" width="90" height="80" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="3" />
        </>}
        <circle cx="70" cy="345" r="28" fill="#d1d5db" /><rect x="65" y="345" width="10" height="65" fill="#9ca3af" />
        <circle cx="735" cy="350" r="32" fill="#d1d5db" /><rect x="730" y="350" width="10" height="60" fill="#9ca3af" />
        <rect x="325" y="28" width="150" height="52" rx="6" fill="#111827" />
        <text x="400" y="61" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="700" fontFamily="Arial, sans-serif">{initials}</text>
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/55 to-transparent px-4 pb-3 pt-12">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold text-white">{name}</div>
          <div className="text-[10px] text-white/80">Campus illustration · no AI image</div>
        </div>
      </div>
    </div>
  );
};

const UniversityCampusImage = ({ name, location }: UniversityCampusImageProps) => {
  const key = name.trim();
  const [images, setImages] = useState<CampusMedia[]>(cache.get(key) ?? []);
  const [loaded, setLoaded] = useState(cache.has(key));
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!key) return;
    if (cache.has(key)) {
      setImages(cache.get(key) ?? []);
      setLoaded(true);
      return;
    }

    const loadImages = async () => {
      try {
        const preferred = verifiedFor(key);
        const reachable = (await Promise.all(preferred.map(async (src) => (await isImageReachable(src)) ? src : null)))
          .filter((src): src is string => Boolean(src));
        let media = reachable.map((src) => ({ src, sourceUrl: src, title: key, credit: "GhanaPathFinder verified campus source", license: "Source verified", kind: "photo" as const }));
        if (media.length < 3) media = [...media, ...(await fetchCommonsImages(key))];
        const unique = new Map<string, CampusMedia>();
        for (const item of media) if (!unique.has(item.src)) unique.set(item.src, item);
        const sources = [...unique.values()].slice(0, 8);
        if (cancelled) return;
        cache.set(key, sources);
        setImages(sources);
        setActive(0);
        setLoaded(true);
      } catch {
        if (cancelled) return;
        cache.set(key, []);
        setImages([]);
        setLoaded(true);
      }
    };
    loadImages();
    return () => { cancelled = true; };
  }, [key]);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % images.length), 4500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  useEffect(() => { if (active >= images.length) setActive(0); }, [active, images.length]);

  const activeMedia = images[active];
  const creditLabel = useMemo(() => activeMedia ? `${activeMedia.title} · ${activeMedia.license} · ${activeMedia.credit}` : "", [activeMedia]);

  const handleImageError = (src: string) => {
    setImages((current) => {
      const next = current.filter((item) => item.src !== src);
      cache.set(key, next);
      if (!next.length) setFailed(true);
      return next;
    });
  };

  if (!images.length && (loaded || failed)) return <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg bg-muted"><CampusIllustration name={name} location={location} /></div>;

  return (
    <div className="relative mb-4 aspect-[16/9] overflow-hidden rounded-lg bg-secondary">
      {images.length > 0 ? images.map((media, index) => (
        <a key={media.src} href={media.sourceUrl} target="_blank" rel="noreferrer" title={creditLabel} className={index === active ? "absolute inset-0 block opacity-100" : "absolute inset-0 block opacity-0 pointer-events-none"}>
          <img src={media.src} alt={`${name} ${media.kind === "logo" ? "institution logo" : "campus"} image`} loading={index === 0 ? "eager" : "lazy"} referrerPolicy="no-referrer" onError={() => handleImageError(media.src)} className="h-full w-full object-cover transition-opacity duration-700" />
        </a>
      )) : <CampusIllustration name={name} location={location} />}
      {images.length > 0 && (
        <>
          <div className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {activeMedia?.kind === "logo" ? "Institution logo" : "Campus photo"}
          </div>
          {activeMedia && <div className="absolute bottom-2 left-2 max-w-[75%] truncate rounded-md bg-black/55 px-2 py-1 text-[9px] text-white backdrop-blur-sm" title={creditLabel}>{activeMedia.license} · {activeMedia.credit}</div>}
          {images.length > 1 && <div className="absolute bottom-2 left-1/2 flex max-w-[90%] -translate-x-1/2 gap-1 overflow-hidden rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">{images.map((media, index) => <button key={media.src} type="button" aria-label={`Show university image ${index + 1}`} onClick={() => setActive(index)} className={`h-1.5 w-1.5 shrink-0 rounded-full ${index === active ? "bg-white" : "bg-white/45"}`} />)}</div>}
        </>
      )}
    </div>
  );
};

export default UniversityCampusImage;
