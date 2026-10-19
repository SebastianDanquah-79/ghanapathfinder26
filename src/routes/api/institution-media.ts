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
  const matches = html.matchAll(/<link[^>]+(?:rel=["'][^"']*(?:icon|apple-touch-icon)[^"']*)[^>]+href=["']([^"']+)["'][^>]*>/gi);
  let best: { url: string; score: number } | null = null;
  for (const match of matches) {
    const tag = (match[0] ?? "").toLowerCase();
    const url = absolute(match[1] ?? "", base);
    if (!url) continue;
    // Prefer the largest declared icon: apple-touch icons are usually the real mark, not a 16px favicon.
    let score = 0;
    if (tag.includes("apple-touch-icon")) score += 6;
    const sizes = tag.match(/sizes=["'](\d+)x\d+["']/);
    if (sizes?.[1]) score += Math.min(Number(sizes[1]) / 32, 8);
    if (/\.png(?:$|\?)/i.test(url)) score += 2;
    if (/favicon\.ico(?:$|\?)/i.test(url)) score -= 3;
    if (!best || score > best.score) best = { url, score };
  }
  return best?.url ?? null;
};

/** Site header logos are almost always an <img> whose markup mentions "logo". */
const findLogoImage = (html: string, base: string) => {
  const matches = html.matchAll(/<img[^>]+(?:src|data-src|data-lazy-src|data-original)=["']([^"']+)["'][^>]*>/gi);
  let best: { url: string; score: number } | null = null;
  for (const match of matches) {
    const tag = (match[0] ?? "").toLowerCase();
    const url = absolute(match[1] ?? "", base);
    if (!url) continue;
    const haystack = `${tag} ${url.toLowerCase()}`;
    if (!/logo|crest|emblem|brand/.test(haystack)) continue;
    let score = 5;
    if (/header|site-?logo|navbar|brand/.test(haystack)) score += 3;
    if (/footer/.test(haystack)) score -= 2;
    if (/placeholder|dummy|sprite|spinner|loader/.test(haystack)) continue;
    if (/\.svg(?:$|\?)/i.test(url)) score += 1;
    if (!best || score > best.score) best = { url, score };
  }
  return best?.url ?? null;
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
    const url = absolute(match[1] ?? "", base);
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
      const parsed = JSON.parse(script[1] ?? "null") as unknown;
      const nodes = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of nodes) {
        if (!node || typeof node !== "object") continue;
        const image = (node as Record<string, unknown>)["image"];
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

type WikimediaAsset = {
  url: string;
  sourceUrl: string;
  title: string;
  attribution: string;
  license: string;
};

const hasReusableLicense = (value: string) => {
  const license = value.toLowerCase().replace(/\s+/g, " ").trim();
  if (!license || /non.?commercial|\bnc\b|no.?derivatives|\bnd\b|all rights reserved|fair use|copyrighted|unknown/.test(license)) return false;
  return /cc0|public domain|cc by(?:-sa)?(?:\s|-)?[0-9]|creative commons attribution(?:-sharealike)?/.test(license);
};

const plainText = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

const firstWikimedia = async (name: string, kind: "campus" | "logo"): Promise<WikimediaAsset | null> => {
  try {
    const queries = kind === "logo"
      ? [`"${name}" logo crest`, `${name} emblem`]
      : [`"${name}" campus Ghana`, `"${name}" Ghana campus`, `${name} university building Ghana`];

    for (const queryText of queries) {
      const params = new URLSearchParams({
        action: "query",
        format: "json",
        generator: "search",
        gsrsearch: queryText,
        gsrnamespace: "6",
        gsrlimit: "20",
        prop: "imageinfo",
        iiprop: "url|mime|extmetadata",
        iiurlwidth: "1400",
        redirects: "1",
      });
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "GhanaPathFinder/1.0 institutional-media",
        },
      });
      if (!response.ok) continue;
      const json = await response.json() as {
        query?: { pages?: Record<string, {
          title?: string;
          imageinfo?: Array<{
            thumburl?: string;
            url?: string;
            mime?: string;
            descriptionurl?: string;
            extmetadata?: Record<string, { value?: string }>;
          }>;
        }> };
      };
      const pages = Object.values(json.query?.pages ?? {});
      const nameTokens = name.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 3);
      const ranked = pages.flatMap((page) => {
        const title = page.title ?? "";
        const lowerTitle = title.toLowerCase();
        const info = page.imageinfo?.[0];
        const url = info?.thumburl ?? info?.url;
        if (!info || !url || info.mime?.startsWith("image/svg")) return [];
        if (kind === "logo" && !/(logo|crest|seal|emblem|coat of arms|insignia)/i.test(title)) return [];
        if (kind === "campus" && /(logo|crest|seal|emblem|coat of arms|insignia)/i.test(title)) return [];
        const metadata = info.extmetadata ?? {};
        const license = plainText(metadata["LicenseShortName"]?.value ?? metadata["UsageTerms"]?.value ?? "");
        if (!hasReusableLicense(license)) return [];

        let score = 0;
        if (kind === "logo" && /(logo|crest|seal|emblem|coat of arms|insignia)/i.test(title)) score += 7;
        if (kind === "campus" && /(campus|administration|library|hostel|hall|building|gate|entrance|faculty|lecture)/i.test(title)) score += 5;
        for (const token of nameTokens) if (lowerTitle.includes(token)) score += 3;
        if (score < (kind === "logo" ? 4 : 3)) return [];

        const rawArtist = metadata["Artist"]?.value ?? metadata["Credit"]?.value ?? "Wikimedia Commons contributor";
        const attribution = plainText(rawArtist);
        return [{
          score,
          asset: {
            url,
            sourceUrl: info.descriptionurl ?? `https://commons.wikimedia.org/wiki/${encodeURIComponent(title.replace(/^File:/i, "").replace(/ /g, "_"))}`,
            title: title.replace(/^File:/i, ""),
            attribution: attribution || "Wikimedia Commons contributor",
            license,
          } satisfies WikimediaAsset,
        }];
      }).sort((a, b) => b.score - a.score);
      if (ranked[0]) return ranked[0].asset;
    }
  } catch {
    // Image discovery is optional; failure must not break the institution profile.
  }
  return null;
};

const commonsFallback = async (name: string, source: string | null, includeCampus = true) => {
  const [logo, campus] = await Promise.all([
    firstWikimedia(name, "logo"),
    includeCampus ? firstWikimedia(name, "campus") : Promise.resolve(null),
  ]);
  return {
    source,
    logo: logo?.url ?? null,
    logoSourceUrl: logo?.sourceUrl ?? null,
    logoAttribution: logo?.attribution ?? null,
    logoLicense: logo?.license ?? null,
    campusImage: campus?.url ?? null,
    campusSourceUrl: campus?.sourceUrl ?? null,
    campusAttribution: campus?.attribution ?? null,
    campusLicense: campus?.license ?? null,
    fetchedAt: new Date().toISOString(),
  };
};

export const Route = createFileRoute("/api/institution-media")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const target = requestUrl.searchParams.get("url");
        const name = (requestUrl.searchParams.get("name") ?? "Ghanaian tertiary institution").trim().slice(0, 120);
        const logoOnly = requestUrl.searchParams.get("kind") === "logo";
        if (!target) {
          return Response.json(await commonsFallback(name, null, !logoOnly), {
            headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
          });
        }
        if (!isSafeUrl(target)) {
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
            return Response.json(await commonsFallback(name, target, !logoOnly), {
              headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
            });
          }

          const contentType = response.headers.get("content-type") ?? "";
          if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
            return Response.json({ error: "Institution website did not return HTML." }, { status: 502 });
          }

          const html = (await response.text()).slice(0, 2_500_000);
          const base = new URL(target).toString();

          const logoCandidate =
            firstMeta(html, ["og:logo"]) ?? findLogoImage(html, base) ?? firstIcon(html, base);
          const logo = logoCandidate ? absolute(logoCandidate, base) : null;
          const jsonImages = jsonLdImages(html, base);
          const campusCandidate =
            firstMeta(html, ["og:image", "twitter:image", "twitter:image:src"]) ??
            jsonImages[0] ??
            findImage(html, base, name);
          const campusImage = campusCandidate ? absolute(campusCandidate, base) : null;

          const [wikiLogo, wikiCampus] = await Promise.all([
            logo ? Promise.resolve(null) : firstWikimedia(name, "logo"),
            (logoOnly || campusImage) ? Promise.resolve(null) : firstWikimedia(name, "campus"),
          ]);

          return Response.json(
            {
              source: target,
              logo: logo || wikiLogo?.url || null,
              logoSourceUrl: wikiLogo?.sourceUrl ?? null,
              logoAttribution: wikiLogo?.attribution ?? null,
              logoLicense: wikiLogo?.license ?? null,
              campusImage: campusImage || wikiCampus?.url || null,
              campusSourceUrl: wikiCampus?.sourceUrl ?? null,
              campusAttribution: wikiCampus?.attribution ?? null,
              campusLicense: wikiCampus?.license ?? null,
              fetchedAt: new Date().toISOString(),
            },
            {
              headers: {
                "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
              },
            },
          );
        } catch {
            return Response.json(await commonsFallback(name, target), {
              headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" },
            });
        } finally {
          clearTimeout(timer);
        }
      },
    },
  },
});
