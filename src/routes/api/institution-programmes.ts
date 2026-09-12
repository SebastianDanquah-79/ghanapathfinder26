import { createFileRoute } from "@tanstack/react-router";

const blocked = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const safe = (value: string) => {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:") return false;
    if (blocked.has(u.hostname.toLowerCase())) return false;
    return !/^(10|127)\.|^192\.168\.|^169\.254\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(u.hostname);
  } catch { return false; }
};
const abs = (value: string, base: string) => { try { return new URL(value, base).toString(); } catch { return null; } };
const clean = (value: string) => value.replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();

export const Route = createFileRoute("/api/institution-programmes")({
  server: { handlers: { GET: async ({ request }) => {
    const url = new URL(request.url).searchParams.get("url");
    if (!url || !safe(url)) return Response.json({ programmes: [] }, { status: 400 });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, { signal: controller.signal, headers: { Accept: "text/html,application/xhtml+xml", "User-Agent": "GhanaPathFinder/1.0 official-programme-indexer" } });
      if (!response.ok) return Response.json({ programmes: [] });
      const html = (await response.text()).slice(0, 2_500_000);
      const base = new URL(url).toString();
      const results = new Map<string, { name: string; url: string | null }>();
      const add = (name: string, href: string | null) => {
        const value = clean(name).replace(/^(programme|program|course)\s*[:|-]\s*/i, "");
        if (value.length < 8 || value.length > 150) return;
        if (!/(bachelor|master|phd|degree|diploma|certificate|hnd|bsc|ba\b|bed\b|llb\b|m\.?sc|m\.?a|engineering|nursing|midwifery|computer|accounting|business|education|science|technology|health|medicine|law|agriculture)/i.test(value)) return;
        if (/^(programmes?|courses?|academic programmes?|undergraduate programmes?)$/i.test(value)) return;
        const key = value.toLowerCase();
        if (!results.has(key)) results.set(key, { name: value, url: href });
      };

      for (const match of html.matchAll(/<(?:h[1-6]|li|p|a)[^>]*>([\s\S]*?)<\/(?:h[1-6]|li|p|a)>/gi)) {
        const text = clean(match[1].replace(/<[^>]+>/g, " "));
        const hrefMatch = match[0].match(/href=["']([^"']+)["']/i);
        add(text, hrefMatch ? abs(hrefMatch[1], base) : null);
        if (results.size >= 80) break;
      }

      return Response.json({ programmes: Array.from(results.values()).slice(0, 60), source: url }, { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" } });
    } catch {
      return Response.json({ programmes: [] });
    } finally { clearTimeout(timer); }
  } } }
});
