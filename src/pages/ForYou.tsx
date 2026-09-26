import { useMemo } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BriefcaseBusiness, Building2, Newspaper, Rocket, ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const ForYou = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: prefs } = useQuery({
    queryKey: ["user_preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: opportunities = [] } = useQuery({
    queryKey: ["for-you", "opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("opportunities")
        .select("id,title,company_name,organisation,country,city,work_mode,opportunity_type,type,category,source_name,source_url,apply_url,deadline_date,verified,is_active,published,posted_at")
        .or("is_active.eq.true,published.eq.true").order("posted_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: startups = [] } = useQuery({
    queryKey: ["for-you", "startups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("african_startups")
        .select("id,company_name,country,city,sector,stage,official_url,source_url,source_name,last_verified_at,active_status")
        .order("last_verified_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ["for-you", "companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies")
        .select("id,name,slug,sector,location,region,website_url,careers_url,source_url,verified,last_verified_at")
        .eq("verified", true).order("last_verified_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: news = [] } = useQuery({
    queryKey: ["for-you", "news"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news_articles")
        .select("id,title,excerpt,original_url,country_code,category,published_at,source_name")
        .order("published_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const countrySet = useMemo(() => new Set((prefs?.followed_countries ?? []).map((x: string) => x.toLowerCase())), [prefs?.followed_countries]);
  const interestSet = useMemo(() => new Set((prefs?.interests ?? []).map((x: string) => x.toLowerCase())), [prefs?.interests]);

  const rankedOpportunities = useMemo(() => [...opportunities].sort((a, b) => {
    const score = (x: typeof a) => {
      let s = 0;
      if (x.country && countrySet.has(x.country.toLowerCase())) s += 4;
      const text = [x.title, x.category, x.type, x.opportunity_type, x.company_name].filter(Boolean).join(" ").toLowerCase();
      for (const i of interestSet) if (text.includes(i)) s += 2;
      if (x.verified) s += 1;
      return s;
    };
    return score(b) - score(a);
  }), [opportunities, countrySet, interestSet]);

  const save = async (itemType: string, itemKey: string, title: string, subtitle?: string | null) => {
    if (!user) { toast.info("Sign in to save this."); return; }
    const { error } = await supabase.from("saved_items").upsert(
      { user_id: user.id, item_type: itemType, item_key: itemKey, title, subtitle: subtitle ?? null, metadata: {} },
      { onConflict: "user_id,item_type,item_key" }
    );
    if (error) toast.error("Could not save this item.");
    else { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["saved_items"] }); }
  };

  const follow = async (entityType: string, entityKey: string) => {
    if (!user) { toast.info("Sign in to follow this."); return; }
    const { error } = await supabase.from("user_follows").upsert(
      { user_id: user.id, entity_type: entityType, entity_key: entityKey },
      { onConflict: "user_id,entity_type,entity_key" }
    );
    if (error) toast.error("Could not follow this.");
    else { toast.success("Following"); qc.invalidateQueries({ queryKey: ["user_follows"] }); }
  };

  const card = "rounded-xl border border-border bg-card p-4";

  return <div className="min-h-screen bg-background pt-20 pb-24 md:pb-12">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Discovery</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">For You</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">A source-aware Africa discovery feed built from your explicit interests, follows and saved choices. Sign in to personalise it.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/onboarding" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Personalise</Link>
          <Link to="/opportunities" className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium">Opportunity Radar</Link>
          <Link to="/my-africa" className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium">My Africa</Link>
        </div>
      </header>

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Relevant opportunities</h2></div>
        <div className="grid gap-3 md:grid-cols-2">
          {rankedOpportunities.slice(0, 8).map((x) => <article key={x.id} className={card}>
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="font-semibold">{x.title}</h3><p className="mt-1 text-xs text-muted-foreground">{x.company_name || x.organisation || "Organisation"} · {x.country || "Africa"}{x.city ? " · " + x.city : ""}</p></div>
              {x.verified && <span className="text-[11px] font-medium text-primary">Verified</span>}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{x.work_mode || x.type || x.opportunity_type || x.category || "Opportunity"}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {(x.apply_url || x.source_url) && <a href={x.apply_url || x.source_url || "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">Open source <ExternalLink className="h-3.5 w-3.5" /></a>}
              <button onClick={() => void save("opportunity", x.id, x.title, x.company_name || x.organisation)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground"><Bookmark className="h-3.5 w-3.5" />Save</button>
            </div>
          </article>)}
        </div>
        {!rankedOpportunities.length && <div className={card + " text-sm text-muted-foreground"}>No verified opportunities match the current feed. Try changing your interests or explore all opportunities.</div>}
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2"><Rocket className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Build in Africa</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {startups.map((x) => <article key={x.id} className={card}>
            <h3 className="font-semibold">{x.company_name}</h3><p className="mt-1 text-xs text-muted-foreground">{x.sector || "Sector unavailable"} · {x.country || "Africa"}</p>
            <div className="mt-3 flex gap-3"><button onClick={() => void follow("startup", x.id)} className="text-xs font-semibold">Follow</button>{(x.official_url || x.source_url) && <a href={x.official_url || x.source_url || "#"} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary">Source</a>}</div>
          </article>)}
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3 flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Verified companies</h2></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {companies.map((x) => <article key={x.id} className={card}>
            <h3 className="font-semibold">{x.name}</h3><p className="mt-1 text-xs text-muted-foreground">{x.sector} · {x.location || x.region || "Africa"}</p>
            <div className="mt-3 flex gap-3"><button onClick={() => void follow("company", x.id)} className="text-xs font-semibold">Follow</button>{x.website_url && <a href={x.website_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary">Website</a>}</div>
          </article>)}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2"><Newspaper className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Africa Now</h2></div>
        <div className="grid gap-3 md:grid-cols-2">
          {news.map((x) => <article key={x.id} className={card}><h3 className="font-semibold">{x.title}</h3>{x.excerpt && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{x.excerpt}</p>}<p className="mt-2 text-xs text-muted-foreground">{x.source_name || "Source"}{x.category ? " · " + x.category : ""}</p>{x.original_url && <a href={x.original_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">Read original <ExternalLink className="h-3.5 w-3.5" /></a>}</article>)}
        </div>
      </section>
    </main>
  </div>;
};

export default ForYou;
