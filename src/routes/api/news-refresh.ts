import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

function parseFeed(xml: string) {
  return [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].slice(0, 20).map(block => {
    const raw = block[0];
    const value = (tag: string) => {
      const m = raw.match(new RegExp("<" + tag + "[^>]*>([\\s\\S]*?)<\/" + tag + ">", "i"));
      return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim() : "";
    };
    return { title: value("title"), link: value("link"), description: value("description"), published_at: value("pubDate") || value("published") };
  }).filter(x => x.title && x.link);
}

export const Route = createFileRoute("/api/news-refresh")({
  server: { handlers: {
    GET: async ({ request }) => {
      const secret = process.env["CRON_SECRET"];
      if (secret && request.headers.get("authorization") !== "Bearer " + secret) return new Response("Unauthorized", { status: 401 });
      const url = process.env["VITE_SUPABASE_URL"], key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
      if (!url || !key) return new Response("News refresh is not configured", { status: 503 });
      const db = createClient(url, key, { auth: { persistSession: false } });
      const { data: sources, error } = await db.from("news_sources").select("id,name,url,category,country_code").eq("active", true);
      if (error) return Response.json({ error: error.message }, { status: 500 });
      const results: Record<string, number> = {};
      for (const source of sources ?? []) {
        try {
          const response = await fetch(source.url, { headers: { "user-agent": "GhanaPathFinder/1.0" } });
          if (!response.ok) throw new Error("HTTP " + response.status);
          const items = parseFeed(await response.text()); let inserted = 0;
          for (const item of items) {
            const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(item.link)).then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,"0")).join(""));
            const { error: e } = await db.from("news_articles").upsert({
              source_id: source.id,title:item.title,excerpt:item.description || null,original_url:item.link,country_code:source.country_code,
              category:source.category,published_at:item.published_at ? new Date(item.published_at).toISOString() : null,fetched_at:new Date().toISOString(),content_hash:hash
            }, { onConflict:"original_url" });
            if (!e) inserted++;
          }
          await db.from("news_sources").update({last_fetched_at:new Date().toISOString(),last_success_at:new Date().toISOString(),last_error:null}).eq("id",source.id);
          results[source.name]=inserted;
        } catch (e) {
          await db.from("news_sources").update({last_fetched_at:new Date().toISOString(),last_error:e instanceof Error ? e.message : "Unknown error"}).eq("id",source.id);
          results[source.name]=0;
        }
      }
      return Response.json({ok:true,refreshed_at:new Date().toISOString(),results});
    }
  }}
});
