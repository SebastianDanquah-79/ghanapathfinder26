import { createFileRoute } from "@tanstack/react-router";
import { createPublicSupabase } from "@/lib/public-supabase.server";

const RECHECK_MS = 30 * 24 * 60 * 60 * 1000;
const LOGO_PATTERN = /logo|crest|emblem|favicon|icon|seal|badge|brand|sprite|avatar|placeholder/i;

const isSafeHttps = (value: string) => {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return false;
    const h = u.hostname.toLowerCase();
    if (h === "localhost" || h.includes("[") || /^\d+\.\d+\.\d+\.\d+$/.test(h)) return false;
    return true;
  } catch {
    return false;
  }
};

const metaContent = (html: string, key: string) => {
  const k = key.replace(/[.:]/g, "\\$&");
  const a = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${k}["'][^>]+content=["']([^"']+)["']`, "i"));
  const b = html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${k}["']`, "i"));
  return (a?.[1] ?? b?.[1] ?? "").trim() || null;
};

const timedFetch = async (url: string, init: RequestInit = {}, ms = 7000) => {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: c.signal, redirect: "follow" });
  } finally {
    clearTimeout(t);
  }
};

/** Official-website og:image, only if it looks like a real photo rather than the logo. */
const resolveFromWebsite = async (website: string, logoUrls: string[]) => {
  const res = await timedFetch(website, {
    headers: { Accept: "text/html", "User-Agent": "GhanaPathFinder/1.0 campus-image" },
  });
  if (!res.ok || !(res.headers.get("content-type") ?? "").includes("html")) return null;
  const html = (await res.text()).slice(0, 1_500_000);
  const raw = metaContent(html, "og:image") ?? metaContent(html, "twitter:image");
  if (!raw) return null;
  let img: string;
  try {
    img = new URL(raw, res.url || website).toString();
  } catch {
    return null;
  }
  if (!isSafeHttps(img) || LOGO_PATTERN.test(img) || /\.(svg|ico|gif)(\?|$)/i.test(img)) return null;
  if (logoUrls.some((l) => l && img.split("?")[0] === l.split("?")[0])) return null;
  const head = await timedFetch(img, { method: "GET", headers: { Range: "bytes=0-0" } }, 5000).catch(() => null);
  if (!head || !(head.ok || head.status === 206)) return null;
  if (!(head.headers.get("content-type") ?? "").startsWith("image/")) return null;
  return img;
};

export const Route = createFileRoute("/api/campus-image")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const slug = (new URL(request.url).searchParams.get("slug") ?? "").trim().slice(0, 160);
        if (!/^[a-z0-9-]{2,160}$/.test(slug)) {
          return Response.json({ url: null }, { status: 400 });
        }
        const cacheHeaders = { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800" };
        try {
          const db = createPublicSupabase();
          if (!db) return Response.json({ url: null });
          const { data: uni } = await db
            .from("universities")
            .select("id, website_url, logo_url, logo_source_url, campus_image_url, campus_image_source_url, campus_image_resolved_at")
            .eq("slug", slug)
            .maybeSingle();
          if (!uni) return Response.json({ url: null }, { status: 404 });

          const fresh = uni.campus_image_resolved_at && Date.now() - new Date(uni.campus_image_resolved_at).getTime() < RECHECK_MS;
          if (uni.campus_image_url || fresh) {
            return Response.json(
              { url: uni.campus_image_url, source: uni.campus_image_source_url },
              { headers: cacheHeaders },
            );
          }
          if (!uni.website_url || !isSafeHttps(uni.website_url)) return Response.json({ url: null }, { headers: cacheHeaders });

          const url = await resolveFromWebsite(uni.website_url, [uni.logo_url ?? "", uni.logo_source_url ?? ""]).catch(() => null);

          // Cache the result (including "nothing found") when the server has write access.
          if (process.env["SUPABASE_SERVICE_ROLE_KEY"]) {
            try {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              await supabaseAdmin
                .from("universities")
                .update({
                  campus_image_url: url,
                  campus_image_source_url: url ? uni.website_url : null,
                  campus_image_resolved_at: new Date().toISOString(),
                })
                .eq("id", uni.id);
            } catch (e) {
              console.error("Campus image cache write failed", e);
            }
          }
          return Response.json({ url, source: url ? uni.website_url : null }, { headers: cacheHeaders });
        } catch (error) {
          console.error("Campus image lookup failed", error);
          return Response.json({ url: null });
        }
      },
    },
  },
});
