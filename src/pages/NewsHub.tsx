import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, ExternalLink, Flame, RefreshCw, TrendingUp } from "lucide-react";

type Article = {
  id: string;
  title: string;
  excerpt: string | null;
  original_url: string;
  image_url: string | null;
  country_code: string | null;
  category: string | null;
  published_at: string | null;
  source_name: string | null;
  fetched_at: string;
};

type NewsRpcClient = {
  rpc: (
    functionName: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

const newsDb = supabase as unknown as NewsRpcClient;
const categories = ["All", "Politics", "Culture", "Education", "Science", "Ghana", "Business", "Technology", "Sports", "Africa"];
const PAGE_SIZE = 40;
const HOUR = 60 * 60 * 1000;

function articleTime(article: Article) {
  const value = article.published_at ? new Date(article.published_at).getTime() : 0;
  return Number.isFinite(value) ? value : 0;
}

function ageLabel(article: Article) {
  const time = articleTime(article);
  if (!time) return "Recently published";
  const minutes = Math.max(0, Math.floor((Date.now() - time) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(time).toLocaleDateString("en-GH", { day: "numeric", month: "short" });
}

function headlineScore(article: Article) {
  const text = `${article.title} ${article.excerpt ?? ""}`.toLowerCase();
  const age = Date.now() - articleTime(article);
  const topics: Array<[RegExp, number]> = [
    [/president|head of state|parliament|election|court ruling|supreme court|government policy|cabinet|minister resign|national budget|national security/, 5],
    [/university|education|school|scholarship|science|research|breakthrough|technology|climate|public health/, 3],
    [/launches|announces|approves|signs|wins|secures|investigation|report finds|new law|funding|agreement/, 2],
    [/ghana|africa|african|west africa/, 1],
  ];
  const relevance = topics.reduce((total, [pattern, score]) => total + (pattern.test(text) ? score : 0), 0);
  const freshness = age <= 3 * HOUR ? 5 : age <= 12 * HOUR ? 3 : age <= 24 * HOUR ? 1 : 0;
  return relevance + freshness;
}

function isBreaking(article: Article) {
  const published = articleTime(article);
  if (!published || Date.now() - published > 6 * HOUR || published > Date.now() + 5 * 60 * 1000) return false;
  const text = `${article.title} ${article.excerpt ?? ""}`.toLowerCase();
  return /\b(breaking|just in|developing story|live updates?|urgent)\b/.test(article.title.toLowerCase())
    || /\b(coup|earthquake|major explosion|major fire|plane crash|state of emergency|mass casualty|terror attack|president has died|national emergency|outbreak declared)\b/.test(text);
}

function StoryImage({ article, className = "" }: { article: Article; className?: string }) {
  if (article.image_url) {
    return (
      <img
        src={article.image_url}
        alt=""
        loading="lazy"
        referrerPolicy="no-referrer"
        className={"h-full w-full object-cover " + className}
      />
    );
  }
  return (
    <div className={"grid h-full min-h-44 w-full place-items-center bg-gradient-to-br from-primary/15 via-muted to-muted-foreground/10 " + className}>
      <TrendingUp className="h-10 w-10 text-primary/50" aria-hidden="true" />
    </div>
  );
}

function SourceLine({ article, light = false }: { article: Article; light?: boolean }) {
  return (
    <div className={"flex flex-wrap items-center gap-x-2 gap-y-1 text-xs " + (light ? "text-white/75" : "text-muted-foreground")}>
      <span className="font-semibold">{article.source_name || "News source"}</span>
      <span aria-hidden="true">·</span>
      <span>{article.category || "Africa"}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.published_at || undefined}>{ageLabel(article)}</time>
    </div>
  );
}

function StoryLink({ article, label = "Read full story" }: { article: Article; label?: string }) {
  return (
    <a
      href={article.original_url}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
    >
      {label} <ExternalLink className="h-4 w-4" />
    </a>
  );
}

export default function NewsHub({
  title = "Africa Now",
  subtitle = "Breaking developments, daily headlines and reporting from sources across Ghana and Africa.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [category, setCategory] = useState("All");
  const [ghanaOnly, setGhanaOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const lastUpdatedAt = useRef(0);
  const realtimeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (
    replace = true,
    targetCategory = category,
    targetGhanaOnly = ghanaOnly,
    requestedOffset = 0,
  ) => {
    if (replace) setRefreshing(true);
    try {
      const { data, error } = await newsDb.rpc("gpf_news_feed", {
        p_category: targetCategory,
        p_country_code: targetGhanaOnly ? "GH" : null,
        p_limit: PAGE_SIZE,
        p_offset: requestedOffset,
      });
      if (error) throw new Error(error.message);
      const rows = Array.isArray(data) ? data as Article[] : [];
      setArticles((current) => {
        if (replace) return rows;
        const seen = new Set(current.map((item) => item.id));
        return current.concat(rows.filter((item) => !seen.has(item.id)));
      });
      setHasMore(rows.length === PAGE_SIZE);
      setErrorMessage("");
      lastUpdatedAt.current = Date.now();
      setLastUpdated(new Date(lastUpdatedAt.current));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "News could not be loaded.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, ghanaOnly]);

  useEffect(() => {
    setArticles([]);
    setHasMore(true);
    setLoading(true);
    void load(true, category, ghanaOnly, 0);
  }, [category, ghanaOnly, load]);

  // Refresh open pages hourly. Database Realtime catches newly inserted articles sooner.
  useEffect(() => {
    const hourly = window.setInterval(() => {
      void load(true, category, ghanaOnly, 0);
    }, HOUR);
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && Date.now() - lastUpdatedAt.current >= HOUR) {
        void load(true, category, ghanaOnly, 0);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(hourly);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [load, category, ghanaOnly]);

  useEffect(() => {
    const channel = supabase
      .channel("gpf-news-live-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "news_articles" }, () => {
        if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
        realtimeTimer.current = setTimeout(() => {
          void load(true, category, ghanaOnly, 0);
        }, 1200);
      })
      .subscribe();
    return () => {
      if (realtimeTimer.current) clearTimeout(realtimeTimer.current);
      void supabase.removeChannel(channel);
    };
  }, [load, category, ghanaOnly]);

  const breakingStory = useMemo(() => {
    return articles
      .filter(isBreaking)
      .sort((a, b) => headlineScore(b) - headlineScore(a) || articleTime(b) - articleTime(a))[0] ?? null;
  }, [articles]);

  const bigStoryToday = useMemo(() => {
    const nonBreaking = articles.filter((item) => item.id !== breakingStory?.id);
    const fresh = nonBreaking.filter((item) => {
      const published = articleTime(item);
      return published > 0 && published <= Date.now() + 5 * 60 * 1000 && Date.now() - published < 24 * HOUR;
    });
    return [...(fresh.length ? fresh : nonBreaking)].sort(
      (a, b) => headlineScore(b) - headlineScore(a) || articleTime(b) - articleTime(a),
    )[0] ?? null;
  }, [articles, breakingStory]);

  const loadMore = async () => {
    await load(false, category, ghanaOnly, articles.length);
  };

  return (
    <div className="min-h-dvh bg-background pb-24 pt-20">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Seo title={title + " | GhanaPathFinder"} description={subtitle} path="/news" />

        <header className="mb-6 border-b border-border pb-5">
          <p className="text-sm font-semibold text-primary">GhanaPathFinder · Newsroom</p>
          <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Automatic updates enabled
                </span>
                <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Refreshes hourly</span>
                {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void load(true, category, ghanaOnly, 0)}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary disabled:opacity-60"
            >
              <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
              {refreshing ? "Updating..." : "Refresh news"}
            </button>
          </div>
        </header>

        <nav aria-label="News topics" className="sticky top-14 z-30 -mx-4 mb-6 border-y border-border bg-background/95 px-4 py-3 backdrop-blur sm:mx-0">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={category === item}
                onClick={() => setCategory(item)}
                className={"shrink-0 border px-3.5 py-2 text-xs font-semibold transition " +
                  (category === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/60")}
              >
                {item}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={ghanaOnly}
              onClick={() => setGhanaOnly((value) => !value)}
              className={"shrink-0 border px-3.5 py-2 text-xs font-semibold " +
                (ghanaOnly ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card")}
            >
              Ghana focus
            </button>
          </div>
        </nav>

        {breakingStory && (
          <section aria-label="Breaking news" className="mb-6 overflow-hidden border-2 border-red-600 bg-red-950 text-white shadow-sm">
            <div className="flex items-center gap-2 bg-red-700 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em]">
              <Flame className="h-4 w-4" /> Breaking news
              <span className="ml-auto font-medium normal-case tracking-normal">{ageLabel(breakingStory)}</span>
            </div>
            <div className="grid md:grid-cols-[1.15fr_1fr]">
              <div className="min-h-56 md:min-h-80">
                <StoryImage article={breakingStory} />
              </div>
              <div className="flex flex-col justify-center p-5 sm:p-7">
                <SourceLine article={breakingStory} light />
                <h2 className="mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">{breakingStory.title}</h2>
                {breakingStory.excerpt && <p className="mt-3 text-sm leading-6 text-white/80">{breakingStory.excerpt}</p>}
                <StoryLink article={breakingStory} label="Follow breaking story" />
              </div>
            </div>
          </section>
        )}

        {bigStoryToday && (
          <section aria-label="Big news of the day" className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold sm:text-xl">The big news of the day</h2>
              <span className="ml-auto border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Top story</span>
            </div>
            <article className="grid overflow-hidden border border-border bg-card md:grid-cols-[1.2fr_1fr]">
              <a href={bigStoryToday.original_url} target="_blank" rel="noreferrer" className="group block min-h-56 overflow-hidden md:min-h-[25rem]" aria-label={"Read " + bigStoryToday.title}>
                <StoryImage article={bigStoryToday} className="transition duration-300 group-hover:scale-[1.02]" />
              </a>
              <div className="flex flex-col justify-center p-5 sm:p-8">
                <SourceLine article={bigStoryToday} />
                <h3 className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">{bigStoryToday.title}</h3>
                {bigStoryToday.excerpt && <p className="mt-3 text-sm leading-6 text-muted-foreground">{bigStoryToday.excerpt}</p>}
                <StoryLink article={bigStoryToday} />
              </div>
            </article>
          </section>
        )}

        {loading && articles.length === 0 && <p className="border border-border p-5 text-sm text-muted-foreground">Loading the latest stories…</p>}
        {errorMessage && (
          <div role="alert" className="mb-5 border border-amber-500/50 bg-amber-500/5 p-4 text-sm">
            News could not be refreshed. {errorMessage}
            <button type="button" className="ml-2 font-semibold underline" onClick={() => void load(true, category, ghanaOnly, 0)}>Try again</button>
          </div>
        )}

        <section aria-label="Latest news">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">{category === "All" ? "Latest news" : "Latest in " + category}</h2>
              <p className="mt-1 text-xs text-muted-foreground">Source-linked reporting, ordered by publication time.</p>
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">{articles.length} stories loaded</span>
          </div>
          {articles.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles
                .filter((item) => item.id !== breakingStory?.id && item.id !== bigStoryToday?.id)
                .map((article) => (
                  <article key={article.id} className="flex min-w-0 flex-col overflow-hidden border border-border bg-card">
                    <a href={article.original_url} target="_blank" rel="noreferrer" className="block h-44 overflow-hidden bg-muted" aria-label={"Read " + article.title}>
                      <StoryImage article={article} />
                    </a>
                    <div className="flex flex-1 flex-col p-4">
                      <SourceLine article={article} />
                      <h3 className="mt-2 text-base font-semibold leading-snug">{article.title}</h3>
                      {article.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-5 text-muted-foreground">{article.excerpt}</p>}
                      <div className="mt-auto pt-3">
                        <StoryLink article={article} label="Read story" />
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          )}
          {!loading && !articles.length && !errorMessage && (
            <div className="border border-dashed border-border p-7 text-sm text-muted-foreground">
              No stories are available in this category right now. Check back after the next source refresh or try another topic.
            </div>
          )}
          {hasMore && articles.length > 0 && (
            <div className="mt-6 flex justify-center">
              <button type="button" onClick={() => void loadMore()} disabled={refreshing} className="border border-border px-5 py-2.5 text-sm font-semibold hover:border-primary disabled:opacity-60">
                Load more stories
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
