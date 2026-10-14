import { createFileRoute } from "@tanstack/react-router";
import { checkApiRateLimit, rateLimitResponse } from "@/lib/api-rate-limit";

const MAX_PHOTOS = 4;
const MAX_GOOGLE_PHOTOS = 2;
const TTL_MS = 6 * 60 * 60 * 1000;

type Photo = {
  url: string;
  attribution: string;
  attributionUrl: string | null;
  title: string;
  license: string;
  source?: "Wikimedia Commons" | "Openverse";
  authorAttributions?: Array<{ displayName: string; uri: string | null }>;
};
type Entry = { photos: Photo[]; expires: number };
type CommonsPage = {
  title?: string;
  imageinfo?: Array<{
    thumburl?: string;
    url?: string;
    descriptionurl?: string;
    mime?: string;
    extmetadata?: Record<string, { value?: string }>;
  }>;
};

const cache = new Map<string, Entry>();
const STOP_WORDS = new Set(["the", "and", "for", "university", "technical", "college", "school", "of", "technology", "science", "institute", "ghana", "national", "campus"]);
const clean = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/&#160;/g, " ").replace(/\s+/g, " ").trim();
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const tokensFor = (name: string) => normalize(name).split(/\s+/).filter((token) => token.length >= 3 && !STOP_WORDS.has(token));

const isFreeLicense = (value: string) => {
  const license = value.toLowerCase().replace(/\s+/g, " ");
  if (!license || /non.?commercial|\bnc\b|no.?derivatives|\bnd\b|all rights reserved|fair use|copyrighted|unknown/.test(license)) return false;
  return /cc0|public domain|cc by(?:-sa)?(?:\s|-)?[0-9]|creative commons attribution(?:-sharealike)?/.test(license);
};

const scorePage = (page: CommonsPage, name: string) => {
  const title = page.title ?? "";
  const normalizedTitle = normalize(title);
  const tokens = tokensFor(name);
  const matched = tokens.filter((token) => normalizedTitle.includes(token));
  const aliases: Record<string, string[]> = {
    "ghana communication technology university": ["gctu"],
    "university of ghana": ["ug legon", "university of ghana"],
    "kwame nkrumah university of science and technology": ["knust"],
    "university of cape coast": ["ucc"],
    "university of mines and technology": ["umat"],
    "koforidua technical university": ["ktu"],
    "accra technical university": ["atu"],
    "university of education winneba": ["uew"],
    "university for development studies": ["uds"],
  };
  const normalizedName = normalize(name);
  const aliasMatch = (aliases[normalizedName] ?? []).some((alias) => normalizedTitle.includes(normalize(alias)));
  // Allow one distinctive name token for small institutions (for example, Abetifi College of Education).
  if (!aliasMatch && matched.length < 1) return -100;
  if (/logo|crest|seal|emblem|coat of arms|favicon|icon/i.test(title)) return -100;
  if (!/campus|hostel|dormitory|hall|residence|library|administration|block|building|gate|entrance|auditorium|laboratory|faculty|lecture|courtyard|grounds|sports|university|college|school|institute/i.test(title)) return -100;
  let score = matched.length * 3 + (aliasMatch ? 5 : 0);
  if (/campus|administration|library|hostel|hall|building|gate|entrance/i.test(title)) score += 4;
  if (/ghana/i.test(title)) score += 2;
  return score;
};

async function findCommonsPhotos(name: string, location: string): Promise<Photo[]> {
  const queries = [
    `"${name}" campus ${location}`,
    `"${name}" university building Ghana`,
    `${name} campus Ghana`,
  ];
  const collected: Array<{ photo: Photo; score: number }> = [];

  for (const queryText of queries) {
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      generator: "search",
      gsrsearch: queryText,
      gsrnamespace: "6",
      gsrlimit: "20",
      prop: "imageinfo",
      iiprop: "url|extmetadata",
      iiurlwidth: "1200",
      redirects: "1",
    });
    try {
      const response = await fetch(`https://commons.wikimedia.org/w/api.php?${params.toString()}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "GhanaPathFinder/1.0 (institutional campus media; public contact via ghanapathfinder.com)",
        },
      });
      if (!response.ok) continue;
      const payload = await response.json() as { query?: { pages?: Record<string, CommonsPage> } };
      for (const page of Object.values(payload.query?.pages ?? {})) {
        const score = scorePage(page, name);
        if (score < 0) continue;
        const info = page.imageinfo?.[0];
        if (!info || info.mime?.startsWith("image/svg")) continue;
        const meta = info.extmetadata ?? {};
        const license = clean(meta["LicenseShortName"]?.value ?? meta["UsageTerms"]?.value ?? "");
        if (!isFreeLicense(license)) continue;
        const url = info.thumburl ?? info.url;
        if (!url) continue;
        const artist = clean(meta["Artist"]?.value ?? meta["Credit"]?.value ?? "Wikimedia Commons contributor");
        collected.push({
          score,
          photo: {
            url,
            attribution: artist || "Wikimedia Commons contributor",
            attributionUrl: info.descriptionurl ?? null,
            title: (page.title ?? name).replace(/^File:/i, ""),
            license,
            source: "Wikimedia Commons",
          },
        });
      }
    } catch {
      // A public media lookup must never make an institution page fail.
    }
  }

  const unique = new Map<string, { photo: Photo; score: number }>();
  for (const item of collected.sort((a, b) => b.score - a.score)) {
    if (!unique.has(item.photo.url)) unique.set(item.photo.url, item);
  }
  return [...unique.values()].slice(0, MAX_PHOTOS).map((item) => item.photo);
}



type OpenverseResult = {
  title?: string;
  url?: string;
  thumbnail?: string;
  creator?: string | null;
  license?: string;
  license_version?: string | null;
  foreign_landing_url?: string | null;
  provider?: string | null;
  source?: string | null;
  tags?: Array<{ name?: string }>;
  detail_url?: string | null;
};

const openverseLicenseAllowed = (license?: string) =>
  Boolean(license && ["cc0", "pdm", "by", "by-sa"].includes(license.toLowerCase()));

const openverseCampusScore = (item: OpenverseResult, name: string) => {
  const title = item.title ?? "";
  const searchable = normalize([title, ...(item.tags ?? []).map((tag) => tag.name ?? "")].join(" "));
  const identityTokens = tokensFor(name);
  const matchCount = identityTokens.filter((token) => searchable.includes(token)).length;
  if (identityTokens.length && matchCount === 0) return -100;
  if (/(logo|crest|seal|emblem|coat of arms|favicon|icon|portrait|headshot|wedding|hotel|restaurant|airport)/i.test(title)) return -100;

  let score = matchCount * 5;
  if (/(campus|university|college|school|education|library|hostel|hall|building|administration|lecture|faculty|entrance|gate)/i.test(title)) score += 4;
  if (/(ghana|abetifi|kumasi|legon|cape coast|accra|winneba|tarkwa|sunyani|koforidua)/i.test(searchable)) score += 2;
  if ((item.tags ?? []).some((tag) => /campus|university|college|school|education|building/i.test(tag.name ?? ""))) score += 2;
  return score;
};

async function findOpenversePhotos(name: string, location: string): Promise<Photo[]> {
  const queries = [
    `"${name}" campus ${location} Ghana`,
    `${name} college university buildings Ghana`,
    `${name} ${location} institution campus`,
  ];
  const collected: Array<{ photo: Photo; score: number }> = [];

  for (const queryText of queries) {
    const params = new URLSearchParams({
      q: queryText,
      page_size: "20",
      license: "cc0,pdm,by,by-sa",
      mature: "false",
    });
    try {
      const response = await fetch(`https://api.openverse.org/v1/images/?${params.toString()}`, {
        headers: { Accept: "application/json", "User-Agent": "GhanaPathFinder/1.0" },
      });
      if (!response.ok) continue;
      const payload = await response.json() as { results?: OpenverseResult[] };
      for (const item of payload.results ?? []) {
        const score = openverseCampusScore(item, name);
        if (score < 5 || !openverseLicenseAllowed(item.license)) continue;
        const imageUrl = item.thumbnail || item.url;
        if (!imageUrl || !/^https?:\/\//i.test(imageUrl)) continue;
        const licenseLabel = item.license_version
          ? `${item.license?.toUpperCase()} ${item.license_version}`
          : item.license?.toUpperCase() ?? "Open license";
        collected.push({
          score,
          photo: {
            url: imageUrl,
            attribution: (item.creator ?? "").trim() || item.provider || item.source || "Openverse contributor",
            attributionUrl: item.foreign_landing_url ?? item.detail_url ?? item.url ?? null,
            title: item.title ?? `${name} campus photo`,
            license: licenseLabel,
            source: "Openverse",
          },
        });
      }
    } catch {
      // Openverse is optional; keep searching other public sources.
    }
  }

  const unique = new Map<string, { photo: Photo; score: number }>();
  for (const item of collected.sort((a, b) => b.score - a.score)) {
    if (!unique.has(item.photo.url)) unique.set(item.photo.url, item);
  }
  return [...unique.values()].slice(0, MAX_PHOTOS).map((item) => item.photo);
}

export const Route = createFileRoute("/api/campus-photos")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const rate = checkApiRateLimit(request, "campus-photos", 60, 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);
        const url = new URL(request.url);
        const name = (url.searchParams.get("name") ?? "").trim().slice(0, 120);
        const location = (url.searchParams.get("location") ?? "").trim().slice(0, 80);
        const placeId = null; // Campus images use keyless public sources; no Google Maps API is required.
        if (name.length < 3) {
          return Response.json({ error: "An institution name is required." }, { status: 400 });
        }

        const key = `${normalize(name)}|${normalize(location)}`;
        const cached = cache.get(key);
        if (cached && cached.expires > Date.now()) {
          return Response.json({ placeId: null, photos: cached.photos }, {
            headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
          });
        }

        let photos = await findCommonsPhotos(name, location);
        if (photos.length === 0) photos = await findOpenversePhotos(name, location);
        cache.set(key, { photos, expires: Date.now() + TTL_MS });
        return Response.json({ placeId: null, photos }, {
          headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
        });
      },
    },
  },
});
