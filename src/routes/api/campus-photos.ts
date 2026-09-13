import { createFileRoute } from "@tanstack/react-router";

const GATEWAY = "https://connector-gateway.lovable.dev/google_maps";
const MAX_PHOTOS = 4;
const TTL_MS = 6 * 60 * 60 * 1000;

type Photo = { url: string; attribution: string; attributionUrl: string | null };
type Entry = { placeId: string | null; photos: Photo[]; expires: number };

/** Process-level cache so repeated page views don't re-bill Places lookups. */
const cache = new Map<string, Entry>();

const headers = (apiKey: string, lovableKey: string, fieldMask?: string) => ({
  Authorization: `Bearer ${lovableKey}`,
  "X-Connection-Api-Key": apiKey,
  "Content-Type": "application/json",
  ...(fieldMask ? { "X-Goog-FieldMask": fieldMask } : {}),
});

export const Route = createFileRoute("/api/campus-photos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const name = (url.searchParams.get("name") ?? "").trim().slice(0, 120);
        const location = (url.searchParams.get("location") ?? "").trim().slice(0, 80);
        const requestedPlaceId = (url.searchParams.get("placeId") ?? "").trim().slice(0, 180);
        if (name.length < 3) {
          return Response.json({ error: "An institution name is required." }, { status: 400 });
        }

        // A user-owned custom-domain connection is linked alongside the managed
        // preview connection and receives the _2 suffix. Prefer it in production.
        const apiKey = process.env["GOOGLE_MAPS_API_KEY_2"] ?? process.env["GOOGLE_MAPS_API_KEY"];
        const lovableKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey || !lovableKey) {
          return Response.json({ placeId: null, photos: [] as Photo[] });
        }

        const key = `${requestedPlaceId}|${name}|${location}`.toLowerCase();
        const hit = cache.get(key);
        if (hit && hit.expires > Date.now()) {
          return Response.json(
            { placeId: hit.placeId, photos: hit.photos },
            { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
          );
        }

        const store = (entry: Omit<Entry, "expires">) => {
          cache.set(key, { ...entry, expires: Date.now() + TTL_MS });
          return Response.json(entry, {
            headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
          });
        };

        try {
          const search = requestedPlaceId
            ? await fetch(`${GATEWAY}/places/v1/places/${encodeURIComponent(requestedPlaceId)}`, {
                headers: headers(apiKey, lovableKey, "id,displayName,photos"),
              })
            : await fetch(`${GATEWAY}/places/v1/places:searchText`, {
                method: "POST",
                headers: headers(apiKey, lovableKey, "places.id,places.displayName,places.photos"),
                body: JSON.stringify({
                  textQuery: location ? `${name}, ${location}, Ghana` : `${name}, Ghana`,
                  pageSize: 1,
                  regionCode: "GH",
                }),
              });

          if (!search.ok) {
            console.error(`Places search failed [${search.status}]: ${await search.text()}`);
            return store({ placeId: null, photos: [] });
          }

          const found = (await search.json()) as {
            id?: string;
            photos?: Array<{ name?: string; authorAttributions?: Array<{ displayName?: string; uri?: string }> }>;
            places?: Array<{
              id?: string;
              photos?: Array<{ name?: string; authorAttributions?: Array<{ displayName?: string; uri?: string }> }>;
            }>;
          };
          const place = requestedPlaceId ? found : found.places?.[0];
          if (!place?.photos?.length) return store({ placeId: place?.id ?? null, photos: [] });

          const photos: Photo[] = [];
          for (const photo of place.photos.slice(0, MAX_PHOTOS)) {
            if (!photo.name) continue;
            const media = await fetch(
              `${GATEWAY}/places/v1/${photo.name}/media?maxWidthPx=1200&skipHttpRedirect=true`,
              { headers: headers(apiKey, lovableKey) },
            );
            if (!media.ok) {
              console.error(`Places photo failed [${media.status}]: ${await media.text()}`);
              break;
            }
            const body = (await media.json()) as { photoUri?: string };
            if (!body.photoUri) continue;
            const author = photo.authorAttributions?.[0];
            photos.push({
              url: body.photoUri,
              attribution: author?.displayName ? `Photo: ${author.displayName} via Google` : "Photo via Google",
              attributionUrl: author?.uri ?? null,
            });
          }

          return store({ placeId: place.id ?? null, photos });
        } catch (error) {
          console.error("Campus photo lookup failed", error);
          return Response.json({ placeId: null, photos: [] as Photo[] });
        }
      },
    },
  },
});
