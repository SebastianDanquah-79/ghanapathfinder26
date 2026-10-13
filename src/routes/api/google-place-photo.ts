import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/google-place-photo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const photoName = (requestUrl.searchParams.get("name") ?? "").trim();
        const apiKey = process.env.GOOGLE_MAPS_API_KEY ?? process.env.GOOGLE_PLACES_API_KEY;

        if (!apiKey) {
          return new Response("Google Places photo access is not configured.", {
            status: 503,
            headers: { "Cache-Control": "no-store" },
          });
        }
        // Accept only a valid Google Places photo resource path, never an arbitrary upstream URL.
        if (!/^places\/[A-Za-z0-9_-]+\/photos\/[A-Za-z0-9_-]+$/.test(photoName)) {
          return new Response("A valid Google Places photo resource name is required.", {
            status: 400,
            headers: { "Cache-Control": "no-store" },
          });
        }

        try {
          const endpoint = new URL(`https://places.googleapis.com/v1/${photoName}/media`);
          endpoint.searchParams.set("key", apiKey);
          endpoint.searchParams.set("maxWidthPx", "1400");
          const upstream = await fetch(endpoint.toString(), { headers: { Accept: "image/*" } });
          if (!upstream.ok || !upstream.body) {
            return new Response("The campus photo could not be retrieved.", {
              status: upstream.status || 502,
              headers: { "Cache-Control": "no-store" },
            });
          }

          const contentType = upstream.headers.get("content-type") ?? "";
          if (!contentType.startsWith("image/")) {
            return new Response("Google Places did not return an image.", {
              status: 502,
              headers: { "Cache-Control": "no-store" },
            });
          }
          return new Response(upstream.body, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "no-store",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch {
          return new Response("The campus photo service is temporarily unavailable.", {
            status: 502,
            headers: { "Cache-Control": "no-store" },
          });
        }
      },
    },
  },
});
