import { useEffect, useState } from "react";

interface UniversityCampusImageProps {
  name: string;
  location?: string | null;
}

const cache = new Map<string, string | null>();

const UniversityCampusImage = ({ name, location }: UniversityCampusImageProps) => {
  const [image, setImage] = useState<string | null>(cache.get(name) ?? null);
  const [loaded, setLoaded] = useState(cache.has(name));

  useEffect(() => {
    let cancelled = false;
    const key = name.trim();
    if (!key || cache.has(key)) return;

    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      prop: "pageimages",
      pithumbsize: "900",
      redirects: "1",
      titles: key,
    });

    fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (cancelled) return;
        const pages = payload?.query?.pages ?? {};
        const page = Object.values(pages)[0] as { thumbnail?: { source?: string } } | undefined;
        const source = page?.thumbnail?.source ?? null;
        cache.set(key, source);
        setImage(source);
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        cache.set(key, null);
        setLoaded(true);
      });

    return () => {
      cancelled = true;
    };
  }, [name]);

  return (
    <div className="relative mb-4 overflow-hidden rounded-lg bg-secondary aspect-[16/9]">
      {image ? (
        <img
          src={image}
          alt={`${name} campus`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          referrerPolicy="no-referrer"
          onError={() => setImage(null)}
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center px-5 text-center">
          <div>
            <div className="text-xs font-medium text-foreground">{name}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {loaded ? "Campus image unavailable" : "Loading campus image…"}
            </div>
            {location && <div className="mt-1 text-[10px] text-muted-foreground">{location}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityCampusImage;
