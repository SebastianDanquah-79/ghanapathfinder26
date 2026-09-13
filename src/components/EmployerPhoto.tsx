import { useEffect, useState } from "react";

interface EmployerPhotoProps {
  name: string;
  location?: string | null | undefined;
  /** How many Google Places photos to show. Listings use one, detail pages three. */
  limit?: number;
}

type Photo = { url: string; attribution: string; attributionUrl: string | null };

const cache = new Map<string, Photo[]>();

/** Office / campus imagery for an employer, sourced live from Google Places. */
const EmployerPhoto = ({ name, location }: EmployerPhotoProps) => {
  const key = `${name}|${location ?? ""}`;
  const [photos, setPhotos] = useState<Photo[]>(cache.get(key) ?? []);

  useEffect(() => {
    if (cache.has(key)) {
      setPhotos(cache.get(key) ?? []);
      return;
    }
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams({ name });
        if (location) params.set("location", location);
        const response = await fetch(`/api/campus-photos?${params.toString()}`);
        const payload = response.ok ? ((await response.json()) as { photos?: Photo[] }) : { photos: [] };
        const list = (payload.photos ?? []).filter((p) => Boolean(p?.url)).slice(0, 3);
        cache.set(key, list);
        if (!cancelled) setPhotos(list);
      } catch {
        cache.set(key, []);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [key, name, location]);

  if (photos.length === 0) return null;

  return (
    <figure className="mb-4">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {photos.map((photo) => (
          <img
            key={photo.url}
            src={photo.url}
            alt={`${name} offices in Ghana`}
            loading="lazy"
            className="h-36 w-full rounded-lg border border-border object-cover"
          />
        ))}
      </div>
      <figcaption className="mt-1 text-[11px] text-muted-foreground">
        {photos[0]?.attribution ?? "Photo via Google"} · Map data © Google
      </figcaption>
    </figure>
  );
};

export default EmployerPhoto;
