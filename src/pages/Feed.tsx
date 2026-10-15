import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { Heart, MessageCircle, Volume2, VolumeX } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { feedVideoLibrary } from "@/lib/feedVideoLibrary";
import { CalendarClock, ExternalLink, Play, RefreshCw, Search, Video } from "lucide-react";

const HOUR = 60 * 60 * 1000;
const categories = [
  "For You",
  "AI & Technology",
  "Programming",
  "Mathematics",
  "Science",
  "Engineering",
  "Education",
  "Business & Entrepreneurship",
  "Finance & Economics",
  "Politics & News",
  "History",
  "Culture & Arts",
  "Psychology",
  "Health",
  "Environment",
  "Agriculture",
  "Law & Society",
  "Design",
  "Languages",
  "Sports",
  "Careers & Skills",
  "Ghana & Africa",
];

type Post = {
  id: string;
  title: string | null;
  description: string | null;
  video_url: string | null;
  youtube_url: string | null;
  thumbnail_url: string | null;
  tags: string[];
  category: string;
  likes_count: number;
  comments_count: number;
  views_count: number;
  is_published: boolean;
  created_at: string;
  source?: string;
  isLibrary?: boolean;
  published_at?: string | null;
};

type CuratedVideoRow = {
  id: string;
  youtube_id: string;
  title: string;
  description: string | null;
  channel_name: string;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  published_at: string | null;
};

type CuratedQueryResult = { data: CuratedVideoRow[] | null; error: { message: string } | null };
type CuratedQuery = {
  select: (columns: string) => CuratedQuery;
  eq: (column: string, value: unknown) => CuratedQuery;
  order: (column: string, options?: { ascending?: boolean }) => CuratedQuery;
  limit: (count: number) => PromiseLike<CuratedQueryResult>;
};
type CuratedVideoClient = { from: (table: string) => CuratedQuery };
const videoDb = supabase as unknown as CuratedVideoClient;

const curatedPosts: Post[] = feedVideoLibrary.map((video) => ({
  id: "library-" + video.videoId,
  title: video.title,
  description: "Video from " + video.channel + ". Opens from the original YouTube publisher.",
  video_url: null,
  youtube_url: "https://www.youtube.com/watch?v=" + video.videoId,
  thumbnail_url: "https://i.ytimg.com/vi/" + video.videoId + "/hqdefault.jpg",
  tags: video.tags,
  category: video.category,
  likes_count: 0,
  comments_count: 0,
  views_count: 0,
  is_published: true,
  created_at: "2026-10-14T00:00:00.000Z",
  published_at: "2026-10-14T00:00:00.000Z",
  source: video.channel,
  isLibrary: true,
}));

function getYoutubeId(url: string | null | undefined) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|shorts\/|live\/|watch\?(?:.*&)?v=))([A-Za-z0-9_-]{11})/i
  );
  return match?.[1] ?? null;
}

function normalizePosts(community: Post[], databaseVideos: Post[], library: Post[]) {
  const result: Post[] = [];
  const seen = new Set<string>();
  for (const post of [...community, ...databaseVideos, ...library]) {
    const youtubeId = getYoutubeId(post.youtube_url) ?? getYoutubeId(post.video_url);
    const key = youtubeId ? "youtube:" + youtubeId : post.video_url ? "video:" + post.video_url : "post:" + post.id;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(post);
  }
  return result;
}

function topicMatches(post: Post, topic: string) {
  if (topic === "For You") return true;
  const text = [post.category, post.title, post.description, ...(post.tags || []), post.source]
    .filter(Boolean).join(" ").toLowerCase();
  const terms: Record<string, string[]> = {
    "AI & Technology": ["ai", "artificial intelligence", "technology", "tech", "robotics", "digital", "cybersecurity", "machine learning", "software", "innovation"],
    "Programming": ["programming", "computer science", "computing", "coding", "code", "python", "javascript", "web development", "software engineering", "algorithm"],
    "Mathematics": ["math", "mathematics", "algebra", "calculus", "geometry", "statistics", "probability", "equation", "derivative"],
    "Science": ["science", "scientific", "research", "physics", "chemistry", "biology", "space", "astronomy", "nature", "experiment"],
    "Engineering": ["engineering", "engineer", "mechanical", "electrical", "civil engineering", "robotics", "manufacturing", "construction"],
    "Education": ["education", "learning", "study", "school", "teacher", "student", "university", "course", "academic", "classroom", "khan academy", "ted-ed", "crashcourse"],
    "Business & Entrepreneurship": ["business", "entrepreneur", "startup", "founder", "company", "leadership", "management", "marketing", "strategy", "sales"],
    "Finance & Economics": ["finance", "financial", "economics", "economic", "money", "investing", "investment", "banking", "market", "budget", "inflation", "trade"],
    "Politics & News": ["politics", "political", "news", "government", "election", "parliament", "president", "policy", "public affairs", "international relations", "civic"],
    "History": ["history", "historical", "ancient", "civilization", "heritage", "past", "archaeology", "world war"],
    "Culture & Arts": ["culture", "arts", "art", "artist", "music", "film", "movie", "cinema", "literature", "fashion", "dance", "theatre", "philosophy", "design", "ted"],
    "Psychology": ["psychology", "psychological", "human behaviour", "human behavior", "mind", "brain", "mental", "personality", "social science"],
    "Health": ["health", "medical", "medicine", "doctor", "clinical", "wellness", "nutrition", "disease", "public health", "who"],
    "Environment": ["environment", "climate", "ecology", "sustainability", "conservation", "wildlife", "renewable", "energy", "planet"],
    "Agriculture": ["agriculture", "farming", "farmer", "crop", "soil", "food production", "agribusiness", "livestock", "agritech"],
    "Law & Society": ["law", "legal", "justice", "court", "constitution", "rights", "society", "ethics", "eagle"],
    "Design": ["design", "creative", "creativity", "illustration", "architecture", "visual", "animation", "user experience", "ux", "graphic"],
    "Languages": ["language", "languages", "english", "french", "writing", "grammar", "linguistics", "communication", "reading", "literacy"],
    "Sports": ["sports", "sport", "football", "soccer", "basketball", "athletics", "training", "fitness", "olympic"],
    "Careers & Skills": ["career", "careers", "skills", "professional", "resume", "interview", "job", "workplace", "productivity", "personal development"],
    "Ghana & Africa": ["ghana", "africa", "african", "west africa", "african union", "accra", "kumasi", "pan-african"],
  };
  return (terms[topic] || [topic.toLowerCase()]).some((term) => text.includes(term));
}

function toPost(video: CuratedVideoRow): Post {
  const publishedAt = video.published_at || new Date().toISOString();
  return {
    id: "curated-" + video.youtube_id,
    title: video.title,
    description: video.description || "A video from " + video.channel_name + ".",
    video_url: null,
    youtube_url: "https://www.youtube.com/watch?v=" + video.youtube_id,
    thumbnail_url: video.thumbnail_url || "https://i.ytimg.com/vi/" + video.youtube_id + "/hqdefault.jpg",
    tags: video.tags || [],
    category: video.category || "Education",
    likes_count: 0,
    comments_count: 0,
    views_count: 0,
    is_published: true,
    created_at: publishedAt,
    published_at: publishedAt,
    source: video.channel_name,
    isLibrary: true,
  };
}

function postDate(post: Post) {
  const value = new Date(post.published_at || post.created_at).getTime();
  return Number.isFinite(value) ? value : 0;
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(curatedPosts);
  const [category, setCategory] = useState("For You");
  const [search, setSearch] = useState("");
  const [muted, setMuted] = useState(true);
  const [activeYoutubePost, setActiveYoutubePost] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadContent = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const [videosResult, communityResult] = await Promise.all([
        videoDb.from("curated_videos")
          .select("id,youtube_id,title,description,channel_name,category,tags,thumbnail_url,published_at")
          .eq("is_active", true)
          .order("published_at", { ascending: false })
          .limit(1000),
        supabase.from("feed_posts")
          .select("id,title,description,video_url,youtube_url,thumbnail_url,tags,category,likes_count,comments_count,views_count,is_published,created_at")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(250),
      ]);

      const dynamicPosts = !videosResult.error && videosResult.data ? videosResult.data.map(toPost) : [];
      const communityPosts = !communityResult.error && communityResult.data
        ? (communityResult.data as Post[]).map((post) => ({ ...post, source: "GhanaPathFinder community" }))
        : [];
      setPosts(normalizePosts(communityPosts, dynamicPosts, curatedPosts).sort((a, b) => postDate(b) - postDate(a)));
      setLastUpdated(new Date());
    } catch {
      // Keep the original curated catalogue visible when the live database is unavailable.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadContent();
    const hourly = window.setInterval(() => void loadContent(), HOUR);
    const onFocus = () => void loadContent();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(hourly);
      window.removeEventListener("focus", onFocus);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [loadContent]);

  useEffect(() => {
    const channel = supabase
      .channel("gpf-curated-video-updates")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "curated_videos" }, () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => void loadContent(), 1000);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [loadContent]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory = topicMatches(post, category);
      const searchable = [post.title, post.description, post.category, post.source, ...(post.tags || [])]
        .filter(Boolean).join(" ").toLowerCase();
      return matchesCategory && (!term || searchable.includes(term));
    });
  }, [posts, category, search]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) void video.play().catch(() => {});
          else video.pause();
        });
      },
      { threshold: 0.65 },
    );
    visible.forEach((post) => {
      const video = refs.current[post.id];
      if (video) observer.observe(video);
    });
    return () => observer.disconnect();
  }, [visible]);

  async function like(post: Post) {
    if (post.isLibrary) return;
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    const { data, error } = await supabase.rpc("toggle_feed_like", { p_post_id: post.id });
    if (error) return;
    setPosts((current) => current.map((item) =>
      item.id === post.id
        ? { ...item, likes_count: Math.max(0, item.likes_count + (data ? 1 : -1)) }
        : item
    ));
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-0 pb-24 pt-14 sm:px-4">
        <Seo
          title="Video Library | GhanaPathFinder"
          description="Explore videos across technology, programming, mathematics, science, engineering, business, finance, politics, history, culture, health, agriculture, law, languages and careers."
          path="/feed"
        />
        <header className="border-b border-border px-4 py-5 sm:px-0">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Learn across every field</p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Video Library</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                One place for useful videos in technology, education, business, science, society, the arts and many other fields.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadContent(true)}
              disabled={refreshing}
              className="inline-flex shrink-0 items-center gap-2 border border-border px-3 py-2 text-xs font-semibold hover:border-primary disabled:opacity-60 sm:px-4 sm:text-sm"
            >
              <RefreshCw className={"h-4 w-4 " + (refreshing ? "animate-spin" : "")} />
              <span className="hidden sm:inline">{refreshing ? "Updating" : "Refresh"}</span>
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Automatic updates enabled
            </span>
            <span className="inline-flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> Updated hourly</span>
            <span className="inline-flex items-center gap-1.5"><Video className="h-3.5 w-3.5" /> {posts.length} videos available</span>
            {lastUpdated && <span>Last checked {lastUpdated.toLocaleTimeString("en-GH", { hour: "2-digit", minute: "2-digit" })}</span>}
          </div>
        </header>

        <div className="sticky top-14 z-30 border-y border-border bg-background/95 px-3 py-3 backdrop-blur">
          <div className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search videos, topics or channels"
              aria-label="Search videos, topics or channels"
              className="w-full border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => { setCategory(item); setActiveYoutubePost(null); }}
                aria-pressed={category === item}
                className={"shrink-0 border px-3 py-2 text-xs font-semibold transition " +
                  (category === item ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/60")}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 py-2 text-xs text-muted-foreground" aria-live="polite">
          {loading && posts.length <= curatedPosts.length
            ? "Loading the full video collection…"
            : `${visible.length} videos match this view. Select any video to watch it.`}
        </div>

        <div className="mt-1 space-y-3">
          {visible.map((post) => {
            const youtubeId = getYoutubeId(post.youtube_url) ?? getYoutubeId(post.video_url);
            return (
              <article key={post.id} className="relative min-h-[66dvh] overflow-hidden bg-black sm:min-h-[70dvh]">
                <div className="absolute inset-0">
                  {youtubeId ? (
                    activeYoutubePost === post.id ? (
                      <iframe
                        className="h-full w-full border-0"
                        src={"https://www.youtube-nocookie.com/embed/" + youtubeId + "?controls=1&rel=0&playsinline=1"}
                        title={post.title || "Learning video"}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveYoutubePost(post.id)}
                        className="group relative h-full w-full text-left"
                        aria-label={"Play " + (post.title || "learning video")}
                      >
                        {post.thumbnail_url
                          ? <img src={post.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                          : <div className="h-full w-full bg-neutral-900" />}
                        <span className="absolute inset-0 grid place-items-center bg-black/15 transition group-hover:bg-black/30">
                          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-black shadow-lg">
                            <Play className="ml-1 h-7 w-7 fill-current" />
                          </span>
                        </span>
                        <span className="sr-only">Play video</span>
                      </button>
                    )
                  ) : post.video_url ? (
                    <video
                      ref={(element) => { refs.current[post.id] = element; }}
                      className="h-full w-full object-cover"
                      src={post.video_url}
                      poster={post.thumbnail_url || undefined}
                      muted={muted}
                      playsInline
                      loop
                      preload="metadata"
                      controls
                    />
                  ) : post.thumbnail_url ? (
                    <img src={post.thumbnail_url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : <div className="h-full w-full bg-neutral-900" />}
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent p-5 pt-28 text-white sm:p-6 sm:pt-32">
                  <p className="text-xs uppercase tracking-wide text-white/75">
                    {post.category} · {post.source || "GhanaPathFinder"}
                  </p>
                  <h2 className="mt-1 max-w-[calc(100%-3rem)] text-xl font-semibold leading-snug sm:text-2xl">
                    {post.title || "GhanaPathFinder community video"}
                  </h2>
                  {post.description && <p className="mt-2 line-clamp-3 max-w-2xl text-sm text-white/80">{post.description}</p>}
                  {post.published_at && (
                    <p className="mt-2 text-xs text-white/65">
                      {new Date(post.published_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>

                <div className="absolute bottom-5 right-4 flex flex-col gap-2">
                  {post.isLibrary ? (
                    <a
                      href={post.youtube_url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
                      aria-label="Open original video on YouTube"
                      title="Open original video on YouTube"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void like(post)}
                        className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
                        aria-label={"Like video, " + (post.title || "")}
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { window.location.href = "/community"; }}
                        className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
                        aria-label="Discuss video"
                      >
                        <MessageCircle className="h-5 w-5" />
                      </button>
                      {post.video_url && !youtubeId && (
                        <button
                          type="button"
                          onClick={() => setMuted((value) => !value)}
                          className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
                          aria-label="Toggle sound"
                        >
                          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </article>
            );
          })}

          {!visible.length && !loading && (
            <div className="border border-dashed border-border p-7 text-sm text-muted-foreground">
              No videos match this topic yet. Try a related category or search a different term.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
