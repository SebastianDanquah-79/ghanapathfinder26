import { useEffect, useMemo, useState } from "react";

interface UniversityCampusImageProps {
  name: string;
  location?: string | null | undefined;
  placeId?: string | null | undefined;
}

type CampusMedia = {
  src: string;
  sourceUrl: string;
  title: string;
  credit: string;
  license: string;
  kind: "photo" | "logo";
  source?: "Google Places" | "Wikimedia Commons" | undefined;
  authorAttributions?: Array<{ displayName: string; uri: string | null }> | undefined;
};

const cache = new Map<string, CampusMedia[]>();

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
  if (!matchesInstitution(title, name) || isLogoTitle(title) || !isPhotoTitle(title)) return null;
  const info = page.imageinfo?.[0];
  if (!info) return null;
  const meta = info.extmetadata ?? {};
  const license = stripHtml(meta["LicenseShortName"]?.value ?? meta["UsageTerms"]?.value ?? "");
  if (!isPermissiveLicense(license)) return null;
  const src = info.thumburl ?? info.url;
  if (!src) return null;
  return {
    src,
    sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
    title: title.replace(/^File:/i, ""),
    credit: stripHtml(meta["Artist"]?.value ?? meta["Credit"]?.value ?? "Wikimedia Commons contributor"),
    license,
    kind: "photo",
    source: "Wikimedia Commons",
  };
};

const fetchCommonsImages = async (name: string): Promise<CampusMedia[]> => {
  const terms = [
    `"${name}" campus building`,
    `"${name}" university campus`,
    `"${name}" campus Ghana`,
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

const fetchPlacePhotos = async (name: string, location?: string | null, placeId?: string | null): Promise<CampusMedia[]> => {
  try {
    const params = new URLSearchParams({ name });
    if (location) params.set("location", location);
    if (placeId) params.set("placeId", placeId);
    const response = await fetch(`/api/campus-photos?${params.toString()}`);
    if (!response.ok) return [];
    const payload = (await response.json()) as {
      photos?: Array<{ url?: string; attribution?: string; attributionUrl?: string | null; title?: string; license?: string; source?: "Google Places" | "Wikimedia Commons"; authorAttributions?: Array<{ displayName: string; uri: string | null }> }>;
    };
    return (payload.photos ?? [])
      .filter((photo): photo is { url: string; attribution?: string; attributionUrl?: string | null; title?: string; license?: string; source?: "Google Places" | "Wikimedia Commons"; authorAttributions?: Array<{ displayName: string; uri: string | null }> } => Boolean(photo.url))
      .map((photo) => ({
        src: photo.url,
        sourceUrl: photo.attributionUrl ?? photo.url,
        title: photo.title ?? `${name} campus`,
        credit: photo.attribution ?? "Wikimedia Commons contributor",
        license: photo.license ?? (photo.source === "Google Places" ? "Google Maps photo · attribution shown" : "Wikimedia Commons"),
        kind: "photo" as const,
        source: photo.source,
        authorAttributions: photo.authorAttributions,
      }));
  } catch {
    return [];
  }
};

const initialsFor = (name: string) => {
  const words = normalize(name).split(/\s+/).filter((word) => word.length >= 2 && !stopWords.has(word));
  return (words.length >= 2 ? `${words[0]![0]}${words[1]![0]}` : words[0]?.slice(0, 2) ?? "GP").toUpperCase();
};

const CampusIllustration = ({ name, location }: UniversityCampusImageProps) => {
  const initials = initialsFor(name);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([name, location, "Ghana"].filter(Boolean).join(", "))}`;
  const label = location ? `${name} · ${location}` : name;

  return (
    <div className="flex h-full w-full items-center justify-center bg-secondary px-4 py-8 text-center" aria-label={`${label}, campus photo unavailable`}>
      <div className="flex max-w-xs flex-col items-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-background text-lg font-bold text-muted-foreground">{initials}</div>
        <p className="break-words text-sm font-semibold text-foreground [overflow-wrap:anywhere]">{name}</p>
        <p className="mt-1 text-xs text-muted-foreground">Verified campus photo not available yet.</p>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-3 text-xs font-medium text-primary underline underline-offset-4">View on Google Maps</a>
      </div>
    </div>
  );
};

const UniversityCampusImage = ({ name, location, placeId }: UniversityCampusImageProps) => {
  const key = `${name.trim()}|${location ?? ""}|${placeId ?? ""}`;
  const [images, setImages] = useState<CampusMedia[]>((cache.get(key) ?? []).filter((item) => item.source !== "Google Places"));
  const [loaded, setLoaded] = useState(cache.has(key));
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!key) return;
    if (cache.has(key)) {
      setImages((cache.get(key) ?? []).filter((item) => item.source !== "Google Places"));
      setLoaded(true);
      return;
    }

    const loadImages = async () => {
      try {
        const placePhotos = await fetchPlacePhotos(name, location, placeId);
        const commonsPhotos = placePhotos.some((photo) => photo.source === "Google Places") ? [] : await fetchCommonsImages(name);
        const unique = new Map<string, CampusMedia>();
        for (const item of [...placePhotos, ...commonsPhotos]) if (!unique.has(item.src)) unique.set(item.src, item);
        const sources = [...unique.values()].slice(0, 8);
        if (cancelled) return;
        const cacheable = sources.filter((item) => item.source !== "Google Places");
        if (cacheable.length) cache.set(key, cacheable);
        else cache.delete(key);
        setImages(sources);
        setActive(0);
        setLoaded(true);
      } catch {
        if (cancelled) return;
        cache.delete(key);
        setImages([]);
        setLoaded(true);
      }
    };
    loadImages();
    return () => { cancelled = true; };
  }, [key, location, placeId]);

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
      const cacheable = next.filter((item) => item.source !== "Google Places");
      if (cacheable.length) cache.set(key, cacheable);
      else cache.delete(key);
      if (!next.length) setFailed(true);
      return next;
    });
  };

  if (!images.length && (loaded || failed)) return <div className="relative mb-4 min-h-[15rem] overflow-hidden rounded-lg bg-muted"><CampusIllustration name={name} location={location} /></div>;

  return (
    <div className={`relative mb-4 overflow-hidden rounded-lg bg-secondary ${images.length === 0 ? "min-h-[15rem]" : "aspect-[16/9]"}`}>
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
          {activeMedia && <div className="absolute bottom-2 left-2 max-w-[82%] rounded-md bg-black/60 px-2 py-1 text-[9px] leading-snug text-white backdrop-blur-sm" title={creditLabel}>{activeMedia.license} · {activeMedia.authorAttributions?.length ? activeMedia.authorAttributions.map((author) => author.uri ? <a key={author.displayName} href={author.uri} target="_blank" rel="noopener noreferrer" className="mr-1 underline underline-offset-2">{author.displayName}</a> : <span key={author.displayName} className="mr-1">{author.displayName}</span>) : activeMedia.credit}</div>}
          {images.length > 1 && <div className="absolute bottom-2 left-1/2 flex max-w-[90%] -translate-x-1/2 gap-1 overflow-hidden rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">{images.map((media, index) => <button key={media.src} type="button" aria-label={`Show university image ${index + 1}`} onClick={() => setActive(index)} className={`h-1.5 w-1.5 shrink-0 rounded-full ${index === active ? "bg-white" : "bg-white/45"}`} />)}</div>}
        </>
      )}
    </div>
  );
};

export default UniversityCampusImage;
