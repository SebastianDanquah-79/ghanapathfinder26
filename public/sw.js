// GhanaPathFinder service worker.
// Goals: make the PWA reliably installable on Android, and give students on
// weak/patchy connections a usable offline fallback — without ever serving
// stale scholarship/programme data after a deploy.
//
// Strategy:
//  - Static, hashed assets (icons, css/js bundles) -> cache-first (safe,
//    filenames change on every build so there's no staleness risk).
//  - HTML navigations -> network-first, falling back to the cached shell or
//    OFFLINE_URL if the network is unreachable.
//  - Everything else (API calls to Supabase, etc.) -> untouched, goes to
//    the network as normal. We never want to serve cached scholarship data
//    as if it were current.
//
// Bump CACHE_VERSION any time you want to force-invalidate old caches.

const CACHE_VERSION = "gpf-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const OFFLINE_URL = "/offline.html";

const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/favicon.png",
  "/app-icon-192.png",
  "/app-icon-512.png",
  "/apple-touch-icon.png",
  OFFLINE_URL,
];

// --- Cleanup of the previous "kill switch" SW's caches -------------------
// The old sw.js deleted its own Workbox precache/runtime caches before
// unregistering itself. Some clients may still be running that version when
// this one first installs, so we defensively sweep any leftover Workbox
// buckets too, in addition to our own outdated versions below.
function isStaleCache(name) {
  const isOldWorkbox = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name);
  const isOldGpf = name.startsWith("gpf-") && !name.startsWith(CACHE_VERSION);
  return isOldWorkbox || isOldGpf;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // addAll fails the whole install if any single request fails, so add
      // individually and tolerate a missing asset rather than blocking
      // installability over one 404.
      await Promise.allSettled(APP_SHELL.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.allSettled(cacheNames.filter(isStaleCache).map((name) => caches.delete(name)));
      await self.clients.claim();
    })(),
  );
});

function isStaticAsset(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  return /\.(?:png|jpg|jpeg|svg|webp|ico|css|js|woff2?)$/.test(url.pathname);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Never intercept cross-origin requests (Supabase API calls, analytics,
  // etc.) — those must always hit the network live.
  if (url.origin !== self.location.origin) return;

  // HTML navigations: network-first so students always see current
  // scholarships/deadlines when online; fall back to cache/offline page
  // only when the network genuinely fails.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          const cache = await caches.open(SHELL_CACHE);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match(request)) || (await cache.match("/")) || (await cache.match(OFFLINE_URL));
        }
      })(),
    );
    return;
  }

  // Static hashed assets: cache-first, since the build hash changes the
  // filename whenever content changes, so a cache hit is always correct.
  if (isStaticAsset(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const fresh = await fetch(request);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          return cached || Response.error();
        }
      })(),
    );
  }
});
