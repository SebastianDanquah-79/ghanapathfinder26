// GhanaPathFinder service worker.
// Goals: make the PWA reliably installable on Android, and give students on
// weak/patchy connections a usable offline fallback — without ever serving
// stale scholarship/programme data after a deploy.
//
// Strategy:
//  - CSS -> network-first with a cached-good fallback. A transient 404 must
//    never be cached as the stylesheet, or the entire app can appear unstyled.
//  - Other static, hashed assets -> cache-first; only successful responses
//    are cached.
//  - HTML navigations -> network-first, falling back to the cached shell or
//    OFFLINE_URL if the network is unreachable.
//  - Everything else (API calls to Supabase, etc.) -> untouched, goes to the
//    network as normal.
//
// Bump CACHE_VERSION whenever cache behavior changes so old broken responses
//    are discarded when the new service worker activates.

const CACHE_VERSION = "gpf-v5";
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

function isStaleCache(name) {
  const isOldWorkbox = /(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name);
  const isOldGpf = name.startsWith("gpf-") && !name.startsWith(CACHE_VERSION);
  return isOldWorkbox || isOldGpf;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // addAll fails the whole install if any request fails, so tolerate a
      // missing optional asset rather than preventing the worker from installing.
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

  // HTML navigations: network-first so students see the latest application
  // shell when online. Never cache an unsuccessful response as the shell.
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          if (fresh.ok) {
            const cache = await caches.open(SHELL_CACHE);
            await cache.put(request, fresh.clone());
          }
          if (fresh.ok) return fresh;
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match(request)) || fresh;
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          return (await cache.match(request)) || (await cache.match("/")) || (await cache.match(OFFLINE_URL)) || Response.error();
        }
      })(),
    );
    return;
  }

  if (!isStaticAsset(request)) return;

  // CSS is network-first. The old cache-first handler could permanently save
  // a transient 404 for a stylesheet URL, leaving the page with default browser
  // styles even after the stylesheet became available again.
  if (url.pathname.endsWith(".css")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        try {
          const fresh = await fetch(request, { cache: "no-cache" });
          if (fresh.ok) {
            await cache.put(request, fresh.clone());
            return fresh;
          }
          return (await cache.match(request)) || fresh;
        } catch {
          return (await cache.match(request)) || Response.error();
        }
      })(),
    );
    return;
  }

  // Other static assets have content-hashed names, so cache-first is safe.
  // Cache only successful responses: never persist a transient 404/500.
  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      const cached = await cache.match(request);
      if (cached) return cached;
      try {
        const fresh = await fetch(request);
        if (fresh.ok) await cache.put(request, fresh.clone());
        return fresh;
      } catch {
        return (await cache.match(request)) || Response.error();
      }
    })(),
  );
});


// Display a system notification when the server sends a Web Push message.
// This also runs when GhanaPathFinder is closed, provided the user has enabled push.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "You have a new GhanaPathFinder update." };
  }

  const title = typeof payload.title === "string" && payload.title.trim()
    ? payload.title.slice(0, 120)
    : "GhanaPathFinder";
  const body = typeof payload.body === "string" && payload.body.trim()
    ? payload.body.slice(0, 240)
    : "Open GhanaPathFinder to see the latest update.";
  const url = typeof payload.url === "string" ? payload.url : "/notifications";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: typeof payload.icon === "string" ? payload.icon : "/app-icon-192.png",
      badge: typeof payload.badge === "string" ? payload.badge : "/favicon.png",
      tag: typeof payload.tag === "string" ? payload.tag : undefined,
      renotify: false,
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const value = event.notification && event.notification.data
    ? event.notification.data.url
    : "/notifications";

  let target;
  try {
    target = new URL(typeof value === "string" ? value : "/notifications", self.location.origin);
  } catch {
    target = new URL("/notifications", self.location.origin);
  }
  if (target.protocol !== "https:" && target.protocol !== "http:") return;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of windows) {
        if (new URL(client.url).origin !== target.origin) continue;
        if ("navigate" in client) {
          const navigated = await client.navigate(target.href);
          if (navigated) return navigated.focus();
        }
        return client.focus();
      }
      return self.clients.openWindow(target.href);
    })(),
  );
});
