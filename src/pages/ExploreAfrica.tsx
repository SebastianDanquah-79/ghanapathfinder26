import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { ExternalLink, BriefcaseBusiness, Newspaper, Rocket, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const ExploreAfrica = () => {
  const { data: opportunities = [] } = useQuery({
    queryKey: ["explore", "opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id,title,company_name,organisation,country,city,work_mode,remote,opportunity_type,type,category,source_name,source_url,apply_url,deadline_date,verified,is_active,published")
        .or("is_active.eq.true,published.eq.true")
        .order("posted_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: news = [] } = useQuery({
    queryKey: ["explore", "news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news_articles")
        .select("id,title,excerpt,original_url,country_code,category,published_at,source_name")
        .order("published_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: startups = [] } = useQuery({
    queryKey: ["explore", "startups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("african_startups")
        .select("id,company_name,country,city,sector,stage,official_url,source_url,source_name,last_verified_at,active_status")
        .order("last_verified_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: leaders = [] } = useQuery({
    queryKey: ["explore", "leaders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("africa_leaders")
        .select("id,name,country_name,title,role,official_source_url,verified_at,is_current,verification_status,source_urls,social_links,last_checked_at")
        .eq("is_current", true)
        .order("country_name")
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 md:pb-12">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">GhanaPathFinder</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Explore Africa</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Discover verified opportunities, African companies, current news and public information from one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/onboarding" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Personalise my path</Link>
            <Link to="/internships" className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-foreground">Internships</Link>
            <Link to="/skills" className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-foreground">Skills</Link>
          </div>
        </header>

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Work & opportunities</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {opportunities.map((item) => {
              const apply = item.apply_url || item.source_url;
              return (
                <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.company_name || item.organisation || "Organisation"} · {item.country || "Africa"}
                        {item.city ? ` · ${item.city}` : ""}
                      </p>
                    </div>
                    {item.verified && <span className="shrink-0 text-[11px] font-medium text-primary">Verified</span>}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {item.work_mode || (item.remote ? "Remote" : null) || item.type || item.opportunity_type || item.category || "Opportunity"}
                  </p>
                  {apply && (
                    <a href={apply} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                      View source / apply <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </article>
              );
            })}
          </div>
          {!opportunities.length && <p className="rounded-xl border border-border p-5 text-sm text-muted-foreground">No verified opportunities are available right now.</p>}
        </section>

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Africa news</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {news.map((item) => (
              <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                {item.excerpt && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{item.excerpt}</p>}
                <p className="mt-2 text-xs text-muted-foreground">{item.source_name || "Source"}{item.category ? ` · ${item.category}` : ""}</p>
                {item.original_url && (
                  <a href={item.original_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    Read original <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">African startups</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {startups.map((item) => (
              <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">{item.company_name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{item.city ? `${item.city}, ` : ""}{item.country || "Africa"}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.sector || "Technology"}{item.stage ? ` · ${item.stage}` : ""}</p>
                {(item.official_url || item.source_url) && (
                  <a href={item.official_url || item.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                    Source <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Live web discovery</h2>
          </div>
          <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
            These source links open current public searches and publisher pages. GhanaPathFinder only promotes a record into its database when the source can be verified; search results themselves are labelled as discovery sources.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["LinkedIn jobs in Ghana","Current jobs, internships and hiring activity","https://gh.linkedin.com/jobs"],
              ["LinkedIn African startups","Public company and startup updates","https://www.linkedin.com/search/results/companies/?keywords=African%20startup"],
              ["Google News — Ghana technology","Current Ghana technology and startup reporting","https://news.google.com/search?q=Ghana%20technology%20startup"],
              ["Disrupt Africa","African startup and funding reporting","https://disruptafrica.com/"],
              ["MyJoyOnline — technology","Ghana technology and business reporting","https://www.myjoyonline.com/category/technology/"],
              ["Graphic Online — technology","Ghana technology and innovation reporting","https://www.graphic.com.gh/news/general-news.html"]
            ].map(([label,desc,url])=><a key={url} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/50">
              <h3 className="font-semibold text-foreground">{label}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">Open source <ExternalLink className="h-3.5 w-3.5"/></span>
            </a>)}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Public information</h2>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">Public-office records are informational. A record is labelled verified only when its source has been checked. Social links are never inferred as official.</p>
          <p className="mb-3 text-xs text-muted-foreground">Google, LinkedIn and TikTok discovery links help locate possible public profiles. A search result is not evidence that a profile belongs to the office-holder.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {leaders.map((item) => {
              const query = encodeURIComponent(`${item.name} ${item.title || item.role || "public official"} ${item.country_name || "Africa"}`);
              const social = (item.social_links || {}) as Record<string, string>;
              const status = item.verification_status || "needs_review";
              return (
                <article key={item.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{item.title || item.role || "Public official"} · {item.country_name || "Africa"}</p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-semibold uppercase tracking-wide ${status === "verified" ? "text-primary" : "text-muted-foreground"}`}>
                      {status === "verified" ? "Verified" : status === "stale" ? "Stale" : "Needs review"}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.official_source_url && <a href={item.official_source_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary">Official source</a>}
                    {Array.isArray(item.source_urls) && item.source_urls.slice(0, 3).map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="text-xs font-medium text-foreground underline">Source</a>)}
                    {social.linkedin && <a href={social.linkedin} target="_blank" rel="noreferrer" className="text-xs font-medium text-foreground underline">LinkedIn</a>}
                    {social.tiktok && <a href={social.tiktok} target="_blank" rel="noreferrer" className="text-xs font-medium text-foreground underline">TikTok</a>}
                    <a href={`https://www.google.com/search?q=${query}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-foreground underline">Google</a>
                    <a href={`https://www.linkedin.com/search/results/all/?keywords=${query}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-foreground underline">LinkedIn search</a>
                    <a href={`https://www.tiktok.com/search?q=${query}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-foreground underline">TikTok search</a>
                  </div>
                  {item.last_checked_at && <p className="mt-3 text-[11px] text-muted-foreground">Last checked: {new Date(item.last_checked_at).toLocaleDateString()}</p>}
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ExploreAfrica;
