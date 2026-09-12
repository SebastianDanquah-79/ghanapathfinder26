import { useEffect, useMemo, useState } from "react";
import { ImageOff } from "lucide-react";

type Media = {
  logo: string | null;
  campusImage: string | null;
};

const cacheKey = (url: string) => `ghanapathfinder:institution-media:${url}`;

export default function InstitutionMedia({
  websiteUrl,
  name,
  variant = "card",
}: {
  websiteUrl?: string | null;
  name: string;
  variant?: "card" | "hero";
}) {
  const [media, setMedia] = useState<Media | null>(null);
  const [failed, setFailed] = useState(false);

  const endpoint = useMemo(() => {
    if (!websiteUrl) return null;
    try {
      const url = new URL(websiteUrl);
      if (url.protocol !== "https:") return null;
      return `/api/institution-media?url=${encodeURIComponent(url.toString())}`;
    } catch {
      return null;
    }
  }, [websiteUrl]);

  useEffect(() => {
    if (!endpoint || !websiteUrl) return;
    let cancelled = false;
    try {
      const cached = window.localStorage.getItem(cacheKey(websiteUrl));
      if (cached) setMedia(JSON.parse(cached) as Media);
    } catch {
      // Continue with the network request.
    }

    fetch(endpoint)
      .then((response) => (response.ok ? response.json() : null))
      .then((value: Media | null) => {
        if (cancelled || !value) return;
        setMedia(value);
        try {
          window.localStorage.setItem(cacheKey(websiteUrl), JSON.stringify(value));
        } catch {
          // Cache is optional.
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [endpoint, websiteUrl]);

  const image = media?.campusImage ?? null;
  const logo = media?.logo ?? null;

  if (variant === "hero") {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-secondary">
        <div className="aspect-[16/6] min-h-40">
          {image ? (
            <img
              src={image}
              alt={`${name} campus`}
              className="h-full w-full object-cover"
              loading="eager"
              referrerPolicy="no-referrer"
              onError={() => setFailed(true)}
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-secondary to-background" aria-hidden="true" />
          )}
        </div>
        <div className="absolute inset-x-4 bottom-4 flex items-end gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-border bg-background/95 p-2 shadow-sm">
            {logo ? (
              <img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
            ) : (
              <span className="text-lg font-bold text-muted-foreground">{name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          {failed && !image && (
            <span className="rounded-md bg-background/90 px-2 py-1 text-[11px] text-muted-foreground">
              Campus media unavailable
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
      <div className="aspect-[16/8]">
        {image ? (
          <img
            src={image}
            alt={`${name} campus`}
            className="h-full w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary text-muted-foreground">
            <ImageOff className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="absolute left-3 bottom-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-background/95 p-1.5 shadow-sm">
        {logo ? (
          <img src={logo} alt={`${name} logo`} className="max-h-full max-w-full object-contain" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <span className="text-sm font-bold text-muted-foreground">{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
    </div>
  );
}
