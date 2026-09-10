import { useEffect, useState } from "react";

interface UniversityCampusImageProps {
  name: string;
  location?: string | null;
}

const cache = new Map<string, string[]>();

const UniversityCampusImage = ({ name, location }: UniversityCampusImageProps) => {
  const [images, setImages] = useState<string[]>(cache.get(name) ?? []);
  const [loaded, setLoaded] = useState(cache.has(name));
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const key = name.trim();
    if (!key || cache.has(key)) return;

    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrsearch: `${key} campus university`,
      gsrlimit: "6",
      gsrnamespace: "6",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: "1000",
      redirects: "1",
    });

    fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled) return;
        const pages = Object.values(payload?.query?.pages ?? {}) as Array<{ imageinfo?: Array<{ thumburl?: string; url?: string }> }>;
        const sources = pages
          .map((page) => page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url ?? null)
          .filter((source): source is string => Boolean(source));
        cache.set(key, sources);
        setImages(sources);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        cache.set(key, []);
        setImages([]);
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [name]);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % images.length), 4500);
    return () => window.clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative mb-4 overflow-hidden rounded-lg bg-secondary aspect-[16/9]">
      {images.length > 0 ? (
        <>
          {images.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`${name} campus view ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${index === active ? "opacity-100" : "opacity-0"}`}
              referrerPolicy="no-referrer"
              onError={() => setImages((current) => current.filter((item) => item !== src))}
            />
          ))}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 rounded-full bg-black/30 px-2 py-1 backdrop-blur-sm">
              {images.map((src, index) => (
                <button key={src} type="button" aria-label={`Show campus image ${index + 1}`} onClick={() => setActive(index)} className={`h-1.5 w-1.5 rounded-full ${index === active ? "bg-white" : "bg-white/45"}`} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="h-full w-full flex items-center justify-center px-5 text-center">
          <div>
            <div className="text-xs font-medium text-foreground">{name}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {loaded ? "Campus images unavailable" : "Loading campus images…"}
            </div>
            {location && <div className="mt-1 text-[10px] text-muted-foreground">{location}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityCampusImage;
