import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { Heart, MessageCircle, Volume2, VolumeX } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const categories = ["For You", "Scholarships", "Programmes", "Education", "Tech", "Startup", "Science", "Culture", "Ghana"];

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
};

type FeedResource = {
  id: string;
  title: string;
  description: string | null;
  category: "Scholarships" | "Programmes";
  href: string;
  externalUrl: string | null;
  meta: string[];
  deadline: string | null;
};

function ResourceCard({ item }: { item: FeedResource }) {
  const expired = item.deadline ? new Date(item.deadline) < new Date(new Date().toDateString()) : false;

  return (
    <article className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">{item.category}</span>
        {item.meta.slice(0, 2).map((meta) => (
          <span key={meta} className="text-xs text-muted-foreground">{meta}</span>
        ))}
      </div>
      <h2 className="mt-3 text-base font-semibold leading-snug text-foreground sm:text-lg">
        <Link to={item.href} className="hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">{item.title}</Link>
      </h2>
      {item.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.description}</p>}
      {item.deadline && (
        <p className={`mt-3 text-xs ${expired ? "text-muted-foreground" : "text-foreground"}`}>
          {expired ? "Past listed deadline. Check the official page for the next cycle." : `Listed deadline: ${new Date(item.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to={item.href} className="inline-flex min-h-10 items-center rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground hover:opacity-90">
          View details
        </Link>
        {item.externalUrl && (
          <a href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center rounded-lg border border-border px-3.5 text-xs font-medium text-foreground hover:bg-secondary">
            Official source ↗
          </a>
        )}
      </div>
    </article>
  );
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [resources, setResources] = useState<FeedResource[]>([]);
  const [category, setCategory] = useState("For You");
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const refs = useRef<Record<string, HTMLVideoElement | null>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadFeed() {
      setLoading(true);
      setLoadError(false);

      const postResult = await supabase
        .from("feed_posts")
        .select("id,title,description,video_url,youtube_url,thumbnail_url,tags,category,likes_count,comments_count,views_count,is_published,created_at")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(60);

      if (cancelled) return;
      if (!postResult.error && (postResult.data?.length ?? 0) > 0) {
        setPosts(postResult.data as Post[]);
        setResources([]);
        setLoading(false);
        return;
      }

      // A new/empty social feed should still help people discover real catalogue
      // records. These cards come from published database records, not dummy posts.
      const [scholarshipResult, programmeResult] = await Promise.all([
        supabase
          .from("scholarships")
          .select("id,slug,name,provider,description,deadline_date,deadline_text,study_level,location,funding_type,website_url,application_url")
          .order("updated_at", { ascending: false })
          .limit(40),
        supabase
          .from("programmes")
          .select("id,slug,name,description,degree_type,field,programme_url,application_url,university_id")
          .not("programme_url", "is", null)
          .order("updated_at", { ascending: false })
          .limit(40),
      ]);

      if (cancelled) return;
      const scholarshipItems: FeedResource[] = (scholarshipResult.data ?? []).map((item) => ({
        id: `scholarship-${item.id}`,
        title: item.name,
        description: item.description,
        category: "Scholarships",
        href: `/scholarships/${item.slug}`,
        externalUrl: item.application_url || item.website_url,
        meta: [item.provider, item.study_level, item.location, item.funding_type].filter((value): value is string => Boolean(value)),
        deadline: item.deadline_date,
      }));
      const programmeItems: FeedResource[] = (programmeResult.data ?? []).map((item) => ({
        id: `programme-${item.id}`,
        title: item.name,
        description: item.description || "Explore this listed programme and confirm current course details with the institution.",
        category: "Programmes",
        href: `/programme/${item.slug}`,
        externalUrl: item.application_url || item.programme_url,
        meta: [item.degree_type, item.field].filter((value): value is string => Boolean(value)),
        deadline: null,
      }));
      setPosts([]);
      setResources([...scholarshipItems, ...programmeItems]);
      setLoadError(Boolean(scholarshipResult.error && programmeResult.error));
      setLoading(false);
    }

    void loadFeed();
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => {
    if (category === "For You") return posts;
    return posts.filter((post) =>
      post.category.toLowerCase() === category.toLowerCase() ||
      post.tags.some((tag) => tag.toLowerCase() === category.toLowerCase()),
    );
  }, [posts, category]);

  const visibleResources = useMemo(() => {
    if (category === "For You") return resources;
    if (category === "Education") return resources.filter((item) => item.category === "Scholarships" || item.category === "Programmes");
    if (category === "Scholarships" || category === "Programmes") return resources.filter((item) => item.category === category);
    return [];
  }, [resources, category]);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting) void video.play().catch(() => {});
        else video.pause();
      });
    }, { threshold: 0.65 });
    visible.forEach((post) => {
      const video = refs.current[post.id];
      if (video) observer.observe(video);
    });
    return () => observer.disconnect();
  }, [visible]);

  async function like(postId: string) {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    const result = await supabase.rpc("toggle_feed_like", { p_post_id: postId });
    if (result.error) return;
    setPosts((current) => current.map((post) =>
      post.id === postId ? { ...post, likes_count: Math.max(0, post.likes_count + (result.data ? 1 : -1)) } : post,
    ));
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-0 pb-24 pt-14 sm:px-4">
        <Seo title="Feed | GhanaPathFinder" description="Discover real education, scholarship and career pathways from GhanaPathFinder." path="/feed" />
        <header className="border-b border-border px-4 py-4 sm:px-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Your feed</h1>
          <p className="mt-1 text-sm text-muted-foreground">Education, opportunities and ideas worth your attention.</p>
        </header>

        <nav aria-label="Feed categories" className="sticky top-14 z-30 border-y border-border bg-background/95 px-3 py-2 backdrop-blur">
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item}
                className={`min-h-9 shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${category === item ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>
                {item}
              </button>
            ))}
          </div>
        </nav>

        <nav aria-label="Important sections" className="border-b border-border px-3 py-3 sm:px-0">
          <div className="flex gap-2 overflow-x-auto">
            {[
              ["/search?kind=university", "Universities"],
              ["/programmes", "Programmes"],
              ["/careers", "Careers"],
              ["/skills", "Skills"],
              ["/scholarships", "Scholarships"],
            ].map(([href, label]) => (
              <Link key={href} to={href} className="inline-flex min-h-10 shrink-0 items-center rounded-lg bg-secondary px-3 text-xs font-medium text-foreground hover:bg-primary/10">
                {label}
              </Link>
            ))}
          </div>
        </nav>

        <section aria-label="Feed items" className="space-y-3 px-3 py-4 sm:px-0">
          {loading && <p className="py-8 text-center text-sm text-muted-foreground">Loading the latest items…</p>}

          {!loading && visible.map((post) => {
            const hasMedia = Boolean(post.video_url || post.youtube_url || post.thumbnail_url);
            return (
              <article key={post.id} className={hasMedia ? "relative min-h-[65dvh] overflow-hidden rounded-xl bg-black" : "relative rounded-xl border border-border bg-card p-4 sm:p-5"}>
                {hasMedia ? (
                  <>
                    <div className="absolute inset-0">
                      {post.video_url ? (
                        <video ref={(element) => { refs.current[post.id] = element; }} className="h-full w-full object-cover" src={post.video_url} poster={post.thumbnail_url || undefined} muted={muted} playsInline loop preload="metadata" />
                      ) : post.thumbnail_url ? (
                        <img src={post.thumbnail_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : post.youtube_url ? (
                        <a href={post.youtube_url} target="_blank" rel="noopener noreferrer" className="grid h-full place-items-center bg-zinc-900 p-6 text-center text-white"><span className="text-sm">Watch video on YouTube ↗</span></a>
                      ) : null}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-5 pt-24 text-white">
                      <p className="text-xs uppercase tracking-wide opacity-80">{post.category}</p>
                      <h2 className="mt-1 text-xl font-semibold">{post.title || "GhanaPathFinder community"}</h2>
                      <p className="mt-2 max-w-2xl text-sm text-white/80">{post.description || ""}</p>
                    </div>
                    <div className="absolute bottom-5 right-4 flex flex-col gap-2">
                      <button type="button" onClick={() => { void like(post.id); }} className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur" aria-label="Like post"><Heart className="h-5 w-5" /></button>
                      <button type="button" onClick={() => setMuted((value) => !value)} className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur" aria-label="Toggle video sound">{muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}</button>
                      <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white/70 backdrop-blur" aria-label={`${post.comments_count} comments`}><MessageCircle className="h-5 w-5" /></button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{post.category}</p>
                    <h2 className="mt-2 text-lg font-semibold text-foreground">{post.title || "GhanaPathFinder update"}</h2>
                    {post.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{post.description}</p>}
                  </>
                )}
              </article>
            );
          })}

          {!loading && visibleResources.map((item) => <ResourceCard key={item.id} item={item} />)}

          {!loading && !loadError && visible.length === 0 && visibleResources.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium text-foreground">Nothing in this category yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Try For You, Scholarships or Programmes, or explore the directories above.</p>
            </div>
          )}

          {!loading && loadError && visibleResources.length === 0 && visible.length === 0 && (
            <div className="rounded-xl border border-dashed border-border p-6 text-center">
              <p className="text-sm text-muted-foreground">Feed items could not be loaded. Check your connection and try again.</p>
              <Link to="/search" className="mt-3 inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground">Explore catalogues</Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
