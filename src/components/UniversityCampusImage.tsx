import { useEffect, useState } from "react";

interface UniversityCampusImageProps {
  name: string;
  location?: string | null;
}

const cache = new Map<string, string[]>();

const commons = (file: string) =>
  `https://commons.wikimedia.org/wiki/Special:Redirect/file/${encodeURIComponent(file)}`;

const verifiedCampusImages: Array<[RegExp, string[]]> = [
  [/academic city university|academic city/i, [commons("Academic City University Campus Drone Shot.jpg"), commons("Academic City University Hostel Courtyard.png"), commons("Academic City University Receration Center (REC).png"), commons("Academic City University Belltower.png"), commons("Academic City University Basketball Court.png")]],
  [/ashesi university|\bashesi\b/i, [commons("Ashesi's Archer Cornfield Courtyard.jpg"), commons("Founders courtyard Ashesi.jpg"), commons("Radichel Hall View Ashesi.jpg"), commons("Ashesi Todd & Ruth Warren Library.jpg"), commons("Ashesi Honour Code.jpg")]],
  [/koforidua technical university|\bktu\b/i, [commons("Koforidua Technical University Entrance Monument.jpg"), commons("Koforidua Technical University Entrance.jpg"), commons("Business and management block.jpg"), commons("School of engineering block.jpg"), commons("New engineering block.jpg")]],
  [/ghana communication technology university|\bgctu\b/i, [commons("GCTU Signage 02.jpg"), commons("Hostel Block B (GCTU) 1.jpg"), commons("Student Study Area (GCTU).jpg"), commons("Parking Lot (GCTU).jpg"), commons("Play Ground (GCTU).jpg")]],
  [/university of cape coast|\bucc\b/i, [commons("U.C.C GATE.jpg"), commons("UCC Central Administration Block and the Sam Jonah Library.jpg"), commons("University Library complex.JPG"), commons("Faculty of Education Lecture Theatre.JPG"), commons("Large Lecture Theatre.JPG")]],
  [/university of ghana|\bug legon\b|\bug\b/i, [commons("Akuafo Hall.JPG"), commons("Akuafo Hall gardens.JPG"), commons("Akuafo Hall chapel.jpg"), commons("Vertebrate Museum @ University of Ghana.jpg"), commons("Viannis Bistro, University of Ghana.jpg")]],
  [/kwame nkrumah university of science and technology|\bknust\b/i, [commons("KNUST Administration block road.jpg"), commons("KNUST CENTRAL LAB BUILDING, KNUST.jpg"), commons("KNUST College of engineering Caesar Building.jpg"), commons("J.K SIAW AGYAPONG BUILDING - KNUST.jpg"), commons("Knust campus- Commercial area.jpg")]],
  [/university of mines and technology|\bumat\b|george grant university of mines/i, [commons("UMaT Campus 08.jpg"), commons("UMaT Campus 09.jpg"), commons("UMaT Campus 10.jpg"), commons("UMaT ED Block.jpg"), commons("UMaT KT Hall.jpg")]],
  [/accra technical university|\batu\b/i, [commons("Accra Technical University 01.jpg"), commons("Accra Technical University 2.jpg"), commons("Accra Technical University Ghana.jpg"), commons("View on Accra Technical University.jpg")]],
  [/tamale technical university|\btatu\b/i, [commons("A front view of TATU administration.jpg"), commons("A side view of administration of Tamale Technical University.jpg"), commons("Administration Block of TaTu.jpg"), commons("ICT block - TaTu.jpg")]],
  [/ho technical university|\bhtu\b/i, [commons("Ho Technical University gate.jpg"), commons("Ho Technical University.jpg"), commons("G. M Afeti Auditorium of HTU.jpg"), commons("New Agricultural engineering department of HTU.jpg")]],
];

const verifiedFor = (name: string) => verifiedCampusImages.find(([pattern]) => pattern.test(name))?.[1] ?? [];

const cleanSources = (pages: Array<{ title?: string; imageinfo?: Array<{ thumburl?: string; url?: string }> }>) =>
  pages.filter((page) => !/logo|coat of arms|emblem/i.test(page.title ?? ""))
    .map((page) => page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url ?? null)
    .filter((source): source is string => Boolean(source));

const fetchCommonsImages = async (name: string) => {
  const searchParams = new URLSearchParams({
    action: "query", format: "json", origin: "*", generator: "search",
    gsrsearch: `${name} campus Ghana university`, gsrlimit: "15", gsrnamespace: "6",
    prop: "imageinfo", iiprop: "url", iiurlwidth: "1200", redirects: "1",
  });
  const response = await fetch(`https://commons.wikimedia.org/w/api.php?${searchParams.toString()}`);
  const payload = response.ok ? await response.json() : null;
  const pages = Object.values(payload?.query?.pages ?? {}) as Array<{ title?: string; imageinfo?: Array<{ thumburl?: string; url?: string }> }>;
  return [...new Set(cleanSources(pages))].slice(0, 8);
};

const isImageReachable = (src: string) => new Promise<boolean>((resolve) => {
  const image = new Image();
  const timeout = window.setTimeout(() => { image.onload = null; image.onerror = null; resolve(false); }, 8000);
  image.onload = () => { window.clearTimeout(timeout); resolve(true); };
  image.onerror = () => { window.clearTimeout(timeout); resolve(false); };
  image.src = src;
});

const UniversityCampusImage = ({ name, location }: UniversityCampusImageProps) => {
  const [images, setImages] = useState<string[]>(cache.get(name) ?? []);
  const [loaded, setLoaded] = useState(cache.has(name));
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const key = name.trim();
    if (!key) return;
    if (cache.has(key)) {
      setImages(cache.get(key) ?? []);
      setLoaded(true);
      return;
    }

    const loadImages = async () => {
      try {
        // Validate the curated Wikimedia candidates first. If redirects/files have moved,
        // automatically fall back to a fresh Wikimedia Commons search instead of showing blanks.
        const preferred = verifiedFor(key);
        const reachable = (await Promise.all(preferred.map(async (src) => (await isImageReachable(src)) ? src : null)))
          .filter((src): src is string => Boolean(src));
        let sources = reachable;
        if (sources.length < 3) {
          const dynamic = await fetchCommonsImages(key);
          sources = [...new Set([...sources, ...dynamic])].slice(0, 8);
        }
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
  }, [name]);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % images.length), 4500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    if (active >= images.length) setActive(0);
  }, [active, images.length]);

  const handleImageError = (src: string) => {
    setImages((current) => {
      const next = current.filter((item) => item !== src);
      cache.set(name, next);
      return next;
    });
  };

  return (
    <div className="relative mb-4 overflow-hidden rounded-lg bg-secondary aspect-[16/9]">
      {images.length > 0 ? (
        <>
          {images.map((src, index) => (
            <img key={src} src={src} alt={`${name} campus view ${index + 1}`} loading={index === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
              referrerPolicy="no-referrer" onError={() => handleImageError(src)} />
          ))}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex max-w-[90%] gap-1 overflow-hidden rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">
              {images.map((src, index) => (
                <button key={src} type="button" aria-label={`Show campus image ${index + 1}`} onClick={() => setActive(index)}
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${index === active ? "bg-white" : "bg-white/45"}`} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="h-full w-full flex items-center justify-center px-5 text-center">
          <div>
            <div className="text-xs font-medium text-foreground">{name}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{loaded ? "Campus images unavailable" : "Loading campus images…"}</div>
            {location && <div className="mt-1 text-[10px] text-muted-foreground">{location}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityCampusImage;
