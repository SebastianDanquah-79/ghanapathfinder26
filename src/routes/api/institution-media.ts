import { createFileRoute } from "@tanstack/react-router";

const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

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
  return absolute("/favicon.ico", base);
};

const firstUsefulImage = (html: string, base: string) => {
  const matches = html.matchAll(/<img[^>]+(?:src|data-src)=["']([^"']+)["'][^>]*>/gi);
  const candidates: string[] = [];
  for (const match of matches) {
    const tag = match[0].toLowerCase();
    const url = absolute(match[1], base);
    if (!url || /\.svg(?:$|\?)/i.test(url)) continue;
    if (/(logo|icon|avatar|favicon)/.test(tag)) continue;
    if (/(campus|university|college|school|main|building|facility|library|hostel|lecture|administration|student)/.test(tag)) return url;
    candidates.push(url);
  }
  return candidates[0] ?? null;
};

const firstJsonLdImage = (html: string, base: string) => {
  const scripts = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1]) as Record<string, unknown> | Array<Record<string, unknown>>;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        const image = node.image;
        const value = typeof image === "string" ? image : Array.isArray(image) ? image[0] : null;
        if (typeof value === "string") {
          const url = absolute(value, base);
          if (url) return url;
        }
      }
    } catch {
      // Continue when a site embeds invalid JSON-LD.
    }
  }
  return null;
};

const firstWikimediaImage = async (name: string) => {
  try {
    const query = encodeURIComponent(`${name} Ghana campus`);
    const response = await fetch(
      `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=5&prop=imageinfo&iiprop=url&iiurlwidth=1200&format=json`,
      { headers: { Accept: "application/json", "User-Agent": "GhanaPathFinder/1.0" } },
    );
    if (!response.ok) return null;
    const json = (await response.json()) as {
      query?: { pages?: Record<string, { imageinfo?: Array<{ thumburl?: string; url?: string }> }> };
    };
    const pages = Object.values(json.query?.pages ?? {});
    for (const page of pages) {
      const image = page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url;
      if (image && !/\.svg(?:$|\?)/i.test(image)) return image;
    }
  } catch {
    return null;
  }
  return null;
};

export const Route = createFileRoute("/api/institution-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const target = requestUrl.searchParams.get("url");
        const name = requestUrl.searchParams.get("name") ?? "Ghana university";
        if (!target || !isSafeUrl(target)) {
          return Response.json({ error: "A valid HTTPS institutional website is required." }, { status: 400 });
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(target, {
            signal: controller.signal,
            headers: {
              Accept: "text/html,application/xhtml+xml",
              "User-Agent": "GhanaPathFinder/1.0 institutional-media-fetcher",
            },
          });
          if (!response.ok) {
            const wiki = await firstWikimediaImage(name);
            return Response.json({ source: target, logo: null, campusImage: wiki, fetchedAt: new Date().toISOString() });
          }

          const contentType = response.headers.get("content-type") ?? "";
          if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
            return Response.json({ error: "Institution website did not return HTML." }, { status: 502 });
          }

          const html = (await response.text()).slice(0, 2_000_000);
          const base = new URL(target).toString();
          const logo = absolute(firstMeta(html, "og:logo") ?? firstIcon(html, base) ?? "", base);
          const campusImage =
            absolute(
              firstMeta(html, "og:image") ??
                firstMeta(html, "twitter:image") ??
                firstJsonLdImage(html, base) ??
                firstUsefulImage(html, base) ??
                "",
              base,
            ) ?? (await firstWikimediaImage(name));

          return Response.json(
            { source: target, logo: logo || null, campusImage: campusImage || null, fetchedAt: new Date().toISOString() },
            { headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" } },
          );
        } catch {
          const wiki = await firstWikimediaImage(name);
          return Response.json({ source: target, logo: null, campusImage: wiki, fetchedAt: new Date().toISOString() });
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
