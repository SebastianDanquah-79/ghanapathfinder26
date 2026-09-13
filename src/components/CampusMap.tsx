import { useEffect, useState } from "react";

interface CampusMapProps {
  name: string;
  location?: string | null | undefined;
  placeId?: string | null | undefined;
}

const placeCache = new Map<string, string | null>();

// Prefer the user-owned key because the managed key is restricted to preview domains.
const browserKey = (
  import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY_2"]
  ?? import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"]
) as string | undefined;

const CampusMap = ({ name, location, placeId: verifiedPlaceId }: CampusMapProps) => {
  const key = `${verifiedPlaceId ?? ""}|${name}|${location ?? ""}`;
  const [placeId, setPlaceId] = useState<string | null>(verifiedPlaceId ?? placeCache.get(key) ?? null);

  useEffect(() => {
    if (!browserKey || verifiedPlaceId || placeCache.has(key)) return;
    let cancelled = false;
    const load = async () => {
      try {
        const params = new URLSearchParams({ name });
        if (location) params.set("location", location);
        const response = await fetch(`/api/campus-photos?${params.toString()}`);
        const payload = response.ok ? ((await response.json()) as { placeId?: string | null }) : { placeId: null };
        const id = payload.placeId ?? null;
        placeCache.set(key, id);
        if (!cancelled) setPlaceId(id);
      } catch {
        placeCache.set(key, null);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [key, name, location, verifiedPlaceId]);

  if (!browserKey || !placeId) return null;

  return (
    <section className="mt-6">
      <h2 className="mb-2 text-sm font-semibold">Campus location</h2>
      <div className="overflow-hidden rounded-lg border border-border">
        <iframe
          title={`Map of ${name}`}
          src={`https://www.google.com/maps/embed/v1/place?key=${browserKey}&q=place_id:${placeId}&zoom=15`}
          className="h-[280px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">Map data © Google</p>
    </section>
  );
};

export default CampusMap;
