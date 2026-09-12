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

const firstMeta = (html: string, keys: string[]) => {
  for (const key of keys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const patterns = [
      new RegExp(`<meta[^>]+(?:property|name)=[\"']${escaped}[\"'][^>]+content=[\"']([^\"']+)[\"'][^>]*>`, "i"),
      new RegExp(`<meta[^>]+content=[\"']([^\"']+)[\"'][^>]+(?:property|name)=[\"']${escaped}[\"'][^>]*>`, "i"),
    ];
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match?.[1]) return match[1].trim();
    }
  }
  return null;
};

const firstIcon = (html: string, base: string) => {
  const matches = html.matchAll(/<link[^>]+(?:rel=[\"'][^\"']*(?:icon|apple-touch-icon)[^\"']*)[^>]+href=[\"']([^\"']+)[\"'][^>]*>/gi);
  for (const match of matches) {
    const url = absolute(match[1], base);
    if (url) return url;
  }
  return absolute("/favicon.ico", base);
};

const scoreImage = (tag: string, url: string, name: string) => {
  const haystack = `${tag} ${url}`.toLowerCase();
  const tokens = name.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3);
  let score = 0;
  if (/(campus|university|college|school|building|facility|library|hostel|lecture|administration|student|academic)/.test(haystack)) score += 5;
  if (/(logo|icon|avatar|favicon|sprite)/.test(haystack)) score -= 8;
  for (const token of tokens) if (haystack.includes(token)) score += 2;
  if (/\.(svg|gif)(?:$|\?)/i.test(url)) score -= 3;
  return score;
};

const findImage = (html: string, base: string, name: string) => {
  const matches = html.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src|data-original)=[\"']([^\"']+)[\"'][^>]*>/gi);
  let best: { url: string; score: number } | null = null;
  for (const match of matches) {
    const url = absolute(match[1], base);
    if (!url || /\.(svg|gif)(?:$|\?)/i.test(url)) continue;
    const score = scoreImage(match[0], url, name);
    if (!best || score > best.score) best = { url, score };
  }
  return best?.url ?? null;
};

const jsonLdImages = (html: string, base: string) => {
  const results: string[] = [];
  const scripts = html.matchAll(/<script[^>]+type=[\"']application\/ld\+json[\"'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const script of scripts) {
    try {
      const parsed = JSON.parse(script[1]) as unknown;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const image = (node as Record<string, unknown>).image;
        const values = typeof image === "string" ? [image] : Array.isArray(image) ? image : [];
        for (const value of values) {
          if (typeof value !== "string") continue;
          const url = absolute(value, base);
          if (url) results.push(url);
        }
      }
    } catch {
      // Ignore invalid JSON-LD and continue.
    }
  }
  return results;
};

const firstWikimedia = async (name: string, kind: "campus" | "logo") => {
  try {
    const queries = kind === "logo"
      ? [`${name} logo`, `\"${name}\" logo`]
      : [`${name} campus Ghana`, `\"${name}\" Ghana campus`, `${name} university Ghana`];

    for (const queryText of queries) {
      const query = encodeURIComponent(queryText);
      const response = await fetch(
        `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${query}&gsrnamespace=6&gsrlimit=10&prop=imageinfo&iiprop=url|mime&iiurlwidth=1400&format=json`,
        { headers: { Accept: "application/json", "User-Agent": "GhanaPathFinder/1.0 institutional-media" } },
      );
      if (!response.ok) continue;
      const json = (await response.json()) as {
        query?: { pages?: Record<string, { title?: string; imageinfo?: Array<{ thumburl?: string; url?: string; mime?: string }> }> };
      };
      const pages = Object.values(json.query?.pages ?? {});
      const nameTokens = name.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3);
      const ranked = pages
        .map((page) => {
          const title = (page.title ?? "").toLowerCase();
          const image = page.imageinfo?.[0];
          const url = image?.thumburl ?? image?.url;
          if (!url || image?.mime?.startsWith("image/svg")) return null;
          let score = kind === "logo" ? 0 : -2;
          if (title.includes("campus")) score += 5;
          if (title.includes("logo") || title.includes("crest") || title.includes("coat of arms")) score += kind === "logo" ? 7 : -4;
          for (const token of nameTokens) if (title.includes(token)) score += 3;
          return { url, score };
        })
        .filter(Boolean) as Array<{ url: string; score: number }>;
      ranked.sort((a, b) => b.score - a.score);
      if (ranked[0] && ranked[0].score >= (kind === "logo" ? 4 : 3)) return ranked[0].url;
    }
  } catch {
    // Public fallback only. Never make the institution page fail because media search failed.
  }
  return null;
};

export const Route = createFileRoute("/api/institution-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const target = requestUrl.searchParams.get("url");
        const name = requestUrl.searchParams.get("name") ?? "Ghanaian tertiary institution";
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
            return Response.json({
              source: target,
              logo: await firstWikimedia(name, "logo"),
              campusImage: await firstWikimedia(name, "campus"),
              fetchedAt: new Date().toISOString(),
            });
          }

          const contentType = response.headers.get("content-type") ?? "";
          if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
            return Response.json({ error: "Institution website did not return HTML." }, { status: 502 });
          }

          const html = (await response.text()).slice(0, 2_500_000);
          const base = new URL(target).toString();

          const logo = absolute(firstMeta(html, ["og:logo", "twitter:creator"] ) ?? firstIcon(html, base) ?? "", base);
          const jsonImages = jsonLdImages(html, base);
          const campusImage = absolute(
            firstMeta(html, ["og:image", "twitter:image", "twitter:image:src"]) ?? jsonImages[0] ?? findImage(html, base, name) ?? "",
            base,
          );

          const resolvedLogo = logo || (await firstWikimedia(name, "logo"));
          const resolvedCampus = campusImage || (await firstWikimedia(name, "campus"));

          return Response.json(
            {
              source: target,
              logo: resolvedLogo || null,
              campusImage: resolvedCampus || null,
              fetchedAt: new Date().toISOString(),
            },
            {
              headers: {
                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
              },
            },
          );
        } catch {
          return Response.json({
            source: target,
            logo: await firstWikimedia(name, "logo"),
            campusImage: await firstWikimedia(name, "campus"),
            fetchedAt: new Date().toISOString(),
          });
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
