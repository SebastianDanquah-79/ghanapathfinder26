import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { Heart, MessageCircle, Volume2, VolumeX } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { feedVideoLibrary } from "@/lib/feedVideoLibrary";

const categories = ["For You", "Tech", "Education", "Startup", "Science", "Culture", "Ghana"];

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
};

const curatedPosts: Post[] = feedVideoLibrary.map((video) => ({
  id: "library-" + video.videoId,
  title: video.title,
  description: "Free learning video from " + video.channel + ".",
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

function mergePosts(community: Post[], library: Post[]) {
  const result: Post[] = [];
  const seen = new Set<string>();
  for (const post of [...community, ...library]) {
    const youtubeId = getYoutubeId(post.youtube_url) ?? getYoutubeId(post.video_url);
    const key = youtubeId ? "youtube:" + youtubeId : post.video_url ? "video:" + post.video_url : "post:" + post.id;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(post);
  }
  return result;
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>(curatedPosts);
  const [category, setCategory] = useState("For You");
  const [muted, setMuted] = useState(true);
  const [activeYoutubePost, setActiveYoutubePost] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadCommunityPosts() {
      const { data, error } = await supabase
        .from("feed_posts")
        .select("id,title,description,video_url,youtube_url,thumbnail_url,tags,category,likes_count,comments_count,views_count,is_published,created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(100);

      if (cancelled || error || !data) return;

      const communityPosts = (data as Post[]).map((post) => ({
        ...post,
        source: post.source || "GhanaPathFinder community",
      }));
      setPosts(mergePosts(communityPosts, curatedPosts));
    }

    void loadCommunityPosts().catch(() => {
      // Keep the curated catalogue visible if the community feed is unavailable.
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(() => {
    if (category === "For You") return posts;
    return posts.filter((post) =>
      post.category.toLowerCase() === category.toLowerCase() ||
      post.tags.some((tag) => tag.toLowerCase() === category.toLowerCase())
    );
  }, [posts, category]);

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
      { threshold: 0.65 }
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
    setPosts((current) =>
      current.map((item) =>
        item.id === post.id
          ? { ...item, likes_count: Math.max(0, item.likes_count + (data ? 1 : -1)) }
          : item
      )
    );
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-0 pb-24 pt-14 sm:px-4">
        <Seo
          title="Feed | GhanaPathFinder"
          description="A curated video feed for education, technology, startups, science and Ghanaian culture."
          path="/feed"
        />
        <div className="sticky top-14 z-30 border-y border-border bg-background/95 px-3 py-2 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setCategory(item);
                  setActiveYoutubePost(null);
                }}
                className={
                  "shrink-0 border px-3 py-1.5 text-xs " +
                  (category === item
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border")
                }
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="px-3 py-2 text-xs text-muted-foreground" aria-live="polite">
          {visible.length} videos available. Select a video to play it.
        </div>

        <div className="mt-1 space-y-3">
          {visible.map((post) => {
            const youtubeId = getYoutubeId(post.youtube_url) ?? getYoutubeId(post.video_url);
            return (
              <article
                key={post.id}
                className="relative min-h-[70dvh] overflow-hidden bg-black"
              >
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
                        {post.thumbnail_url ? (
                          <img
                            src={post.thumbnail_url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-neutral-900" />
                        )}
                        <span className="absolute inset-0 grid place-items-center bg-black/15 transition group-hover:bg-black/30">
                          <span className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-2xl text-black shadow-lg">
                            ▶
                          </span>
                        </span>
                        <span className="sr-only">Play video</span>
                      </button>
                    )
                  ) : post.video_url ? (
                    <video
                      ref={(element) => {
                        refs.current[post.id] = element;
                      }}
                      className="h-full w-full object-cover"
                      src={post.video_url}
                      poster={post.thumbnail_url || undefined}
                      muted={muted}
                      playsInline
                      loop
                      preload="metadata"
                    />
                  ) : post.thumbnail_url ? (
                    <img
                      src={post.thumbnail_url}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-neutral-900" />
                  )}
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pt-28 text-white">
                  <p className="text-xs uppercase tracking-wide opacity-80">
                    {post.category} · {post.source || "GhanaPathFinder"}
                  </p>
                  <h2 className="mt-1 max-w-[calc(100%-4rem)] text-xl font-semibold">
                    {post.title || "GhanaPathFinder community"}
                  </h2>
                  {post.description && (
                    <p className="mt-2 max-w-2xl text-sm text-white/80">{post.description}</p>
                  )}
                </div>

                <div className="absolute bottom-5 right-4 flex flex-col gap-2">
                  {post.isLibrary ? (
                    <a
                      href={post.youtube_url || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-xs text-white backdrop-blur"
                      aria-label="Open video on YouTube"
                      title="Open video on YouTube"
                    >
                      ↗
                    </a>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => void like(post)}
                        className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
                        aria-label="Like"
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
                        aria-label="Comments"
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

          {!visible.length && (
            <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">
              No videos are available in this category yet.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
