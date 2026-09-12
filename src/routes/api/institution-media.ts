import { createFileRoute } from "@tanstack/react-router";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
];

const isSafeUrl = (value: string) => {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (BLOCKED_HOSTS.has(host)) return false;
    if (/^(10|127)\./.test(host)) return false;
    if (/^192\.168\./.test(host)) return false;
    if (/^169\.254\./.test(host)) return false;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;
    if (host.includes("[")) return false;
    return true;
  } catch {
    return false;
  }
};

const absolute = (value: string, base: string) => {
  try {
    return new URL(value, base).toString();
  } catch {
    return null;
  }
};

const firstMeta = (html: string, key: string) => {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
};

const firstIcon = (html: string, base: string) => {
  const matches = html.matchAll(/<link[^>]+(?:rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*)[^>]+href=["']([^"']+)["'][^>]*>/gi);
  for (const match of matches) {
    const url = absolute(match[1], base);
    if (url) return url;
  }
  return null;
};

const firstUsefulImage = (html: string, base: string) => {
  const matches = html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi);
  for (const match of matches) {
    const tag = match[0].toLowerCase();
    if (!/(campus|university|college|school|main|building|facility|logo|crest)/.test(tag)) continue;
    const url = absolute(match[1], base);
    if (url && !/\.svg(?:$|\?)/i.test(url)) return url;
  }
  return null;
};

export const Route = createFileRoute("/api/institution-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const target = requestUrl.searchParams.get("url");
        if (!target || !isSafeUrl(target)) {
          return Response.json({ error: "A valid HTTPS institutional website is required." }, { status: 400 });
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 7000);
        try {
          const response = await fetch(target, {
            signal: controller.signal,
            headers: {
              Accept: "text/html,application/xhtml+xml",
              "User-Agent": "GhanaPathFinder/1.0 institutional-media-fetcher",
            },
          });
          if (!response.ok) {
            return Response.json({ error: "Institution website could not be read." }, { status: 502 });
          }

          const contentType = response.headers.get("content-type") ?? "";
          if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
            return Response.json({ error: "Institution website did not return HTML." }, { status: 502 });
          }

          const html = (await response.text()).slice(0, 1_500_000);
          const base = new URL(target).toString();
          const logo = absolute(
            firstMeta(html, "og:logo") ?? firstMeta(html, "twitter:image") ?? firstIcon(html, base) ?? "",
            base,
          );
          const campusImage = absolute(
            firstMeta(html, "og:image") ?? firstMeta(html, "twitter:image") ?? firstUsefulImage(html, base) ?? "",
            base,
          );

          return Response.json(
            {
              source: target,
              logo: logo || null,
              campusImage: campusImage || null,
              fetchedAt: new Date().toISOString(),
            },
            {
              headers: {
                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
              },
            },
          );
        } catch {
          return Response.json({ error: "Institution website could not be reached." }, { status: 502 });
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
