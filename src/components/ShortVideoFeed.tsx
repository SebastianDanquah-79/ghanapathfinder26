import { useMemo, useState, type FormEvent } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, Loader2, MessageCircle, Play, Send, Upload, Video } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

type ClipComment = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  authorName: string;
};
type ClipPost = {
  id: string;
  author_id: string;
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
  created_at: string;
  authorName: string;
  authorAvatar: string | null;
  likedByMe: boolean;
  comments: ClipComment[];
};

function youtubeId(raw: string | null | undefined) {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "youtu.be") return url.pathname.split("/").filter(Boolean)[0] ?? null;
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (url.pathname === "/watch") return url.searchParams.get("v");
      if (["embed", "shorts", "live"].includes(parts[0] ?? "")) return parts[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

function validDirectVideoUrl(raw: string) {
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && /\.(mp4|webm|mov|m4v|ogv)$/i.test(url.pathname);
  } catch {
    return false;
  }
}

export default function ShortVideoFeed() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("learning");
  const [tagsText, setTagsText] = useState("");
  const [videoLink, setVideoLink] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [posting, setPosting] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [pendingLike, setPendingLike] = useState<string | null>(null);

  const clipsQuery = useQuery({
    queryKey: ["short-video-feed", user?.id],
    queryFn: async (): Promise<ClipPost[]> => {
      const postsResult = await supabase
        .from("feed_posts")
        .select("id,author_id,title,description,video_url,youtube_url,thumbnail_url,tags,category,likes_count,comments_count,views_count,created_at")
        .eq("is_published", true)
        .or("video_url.not.is.null,youtube_url.not.is.null")
        .order("created_at", { ascending: false })
        .limit(12);
      if (postsResult.error) throw postsResult.error;
      const posts = postsResult.data ?? [];
      if (!posts.length) return [];

      const ids = posts.map((post) => post.id);
      const authorIds = [...new Set(posts.map((post) => post.author_id))];
      const [profilesResult, commentsResult, likesResult] = await Promise.all([
        supabase.from("profiles").select("id,full_name,avatar_url").in("id", authorIds),
        supabase.from("feed_comments").select("id,post_id,author_id,content,created_at").in("post_id", ids).order("created_at", { ascending: true }).limit(60),
        supabase.from("feed_likes").select("post_id,user_id").in("post_id", ids),
      ]);
      if (commentsResult.error) throw commentsResult.error;
      if (likesResult.error) throw likesResult.error;
      const profiles = profilesResult.data ?? [];
      const comments = commentsResult.data ?? [];
      const commentAuthorIds = [...new Set(comments.map((comment) => comment.author_id))];
      const commentProfilesResult = commentAuthorIds.length
        ? await supabase.from("profiles").select("id,full_name").in("id", commentAuthorIds)
        : { data: [], error: null };
      const authorMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
      const commentAuthorMap = new Map((commentProfilesResult.data ?? []).map((profile) => [profile.id, profile.full_name]));
      const likedIds = new Set((likesResult.data ?? []).filter((like) => like.user_id === user?.id).map((like) => like.post_id));
      return posts.map((post) => ({
        ...post,
        tags: post.tags ?? [],
        authorName: authorMap.get(post.author_id)?.full_name ?? "Community member",
        authorAvatar: authorMap.get(post.author_id)?.avatar_url ?? null,
        likedByMe: likedIds.has(post.id),
        comments: comments.filter((comment) => comment.post_id === post.id).map((comment) => ({
          ...comment,
          authorName: commentAuthorMap.get(comment.author_id) ?? "Community member",
        })),
      })) as ClipPost[];
    },
    staleTime: 20_000,
  });

  const clips = useMemo(() => clipsQuery.data ?? [], [clipsQuery.data]);

  async function publishClip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      toast.info("Sign in to share a clip.");
      return;
    }
    if (!videoFile && !videoLink.trim()) {
      toast.error("Upload a short video or paste a YouTube or direct video link.");
      return;
    }
    if (videoFile && (!VIDEO_MIME_TYPES.has(videoFile.type) || videoFile.size > MAX_VIDEO_BYTES)) {
      toast.error("Use an MP4, WebM or MOV video under 100 MB.");
      return;
    }

    let storedPath: string | null = null;
    let uploadedUrl: string | null = null;
    let youtubeUrl: string | null = null;
    const link = videoLink.trim();
    if (!videoFile && link) {
      youtubeUrl = youtubeId(link) ? link : null;
      if (!youtubeUrl && !validDirectVideoUrl(link)) {
        toast.error("Use a YouTube link or a direct HTTPS link ending in MP4, WebM, MOV, M4V or OGV.");
        return;
      }
      if (!youtubeUrl) uploadedUrl = link;
    }

    setPosting(true);
    try {
      if (videoFile) {
        const safeName = videoFile.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-90) || "clip.mp4";
        storedPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const uploadResult = await supabase.storage.from("feed-videos").upload(storedPath, videoFile, {
          contentType: videoFile.type,
          upsert: false,
        });
        if (uploadResult.error) throw uploadResult.error;
        uploadedUrl = supabase.storage.from("feed-videos").getPublicUrl(storedPath).data.publicUrl;
      }

      const { error } = await supabase.from("feed_posts").insert({
        author_id: user.id,
        title: title.trim() || null,
        description: description.trim() || null,
        video_url: uploadedUrl,
        youtube_url: youtubeUrl,
        tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 8),
        category,
        is_published: true,
      });
      if (error) {
        if (storedPath) await supabase.storage.from("feed-videos").remove([storedPath]);
        throw error;
      }
      setTitle("");
      setDescription("");
      setTagsText("");
      setVideoLink("");
      setVideoFile(null);
      setComposerOpen(false);
      toast.success("Your clip is published.");
      await queryClient.invalidateQueries({ queryKey: ["short-video-feed"] });
    } catch (error) {
      console.error("Could not publish short video", error);
      toast.error("The clip could not be published. Check your connection and try again.");
    } finally {
      setPosting(false);
    }
  }

  async function toggleLike(post: ClipPost) {
    if (!user) {
      toast.info("Sign in to like a clip.");
      return;
    }
    if (pendingLike) return;
    setPendingLike(post.id);
    try {
      const result = post.likedByMe
        ? await supabase.from("feed_likes").delete().eq("user_id", user.id).eq("post_id", post.id)
        : await supabase.from("feed_likes").insert({ user_id: user.id, post_id: post.id });
      if (result.error) throw result.error;
      await queryClient.invalidateQueries({ queryKey: ["short-video-feed"] });
    } catch (error) {
      console.error("Could not update clip reaction", error);
      toast.error("Could not update your reaction.");
    } finally {
      setPendingLike(null);
    }
  }

  async function addComment(post: ClipPost) {
    if (!user) {
      toast.info("Sign in to comment.");
      return;
    }
    const content = (commentText[post.id] ?? "").trim();
    if (!content) return;
    setCommentingOn(post.id);
    const { error } = await supabase.from("feed_comments").insert({
      post_id: post.id,
      author_id: user.id,
      content: content.slice(0, 1000),
    });
    if (error) {
      toast.error("Your comment could not be posted.");
    } else {
      setCommentText((current) => ({ ...current, [post.id]: "" }));
      await queryClient.invalidateQueries({ queryKey: ["short-video-feed"] });
    }
    setCommentingOn(null);
  }

  return (
    <section className="mb-8 border-y border-border py-5" aria-label="Short videos and community clips">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Clips</p>
          <h2 className="mt-1 text-xl font-bold">Short videos from the community</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Quick lessons, campus life, career advice and founder stories. Videos are public when published; do not include private information.</p>
        </div>
        {user ? (
          <button type="button" onClick={() => setComposerOpen((value) => !value)} className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm font-semibold hover:border-primary">
            <Video className="h-4 w-4 text-primary" /> {composerOpen ? "Close" : "Post a clip"}
          </button>
        ) : (
          <Link to="/auth" className="inline-flex items-center gap-2 border border-border px-3 py-2 text-sm font-semibold hover:border-primary">Sign in to post</Link>
        )}
      </div>

      {composerOpen && user && (
        <form onSubmit={publishClip} className="mb-5 grid gap-3 border border-border bg-card p-4 sm:grid-cols-2">
          <label className="text-sm font-medium sm:col-span-2">Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} placeholder="What is this clip about?" className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">Caption
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={3} placeholder="Share the context or the lesson." className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium">Category
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm">
              <option value="learning">Learning</option><option value="campus">Campus life</option><option value="career">Career advice</option><option value="founder">Startup / founder</option><option value="community">Community</option>
            </select>
          </label>
          <label className="text-sm font-medium">Tags, separated by commas
            <input value={tagsText} onChange={(event) => setTagsText(event.target.value)} maxLength={200} placeholder="mathematics, coding, careers" className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">Upload a video (MP4, WebM or MOV, up to 100 MB)
            <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm file:mr-3 file:border file:border-border file:bg-background file:px-3 file:py-2" />
          </label>
          <label className="text-sm font-medium sm:col-span-2">Or use a YouTube / direct video link
            <input type="url" value={videoLink} onChange={(event) => setVideoLink(event.target.value)} placeholder="https://…" className="mt-1 w-full border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <p className="text-xs leading-5 text-muted-foreground sm:col-span-2">Choose either an upload or a video link. Posts are public and comments are visible to other visitors. Avoid showing other people without their permission.</p>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" disabled={posting || (!videoFile && !videoLink.trim())} className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {posting ? "Publishing…" : "Publish clip"}
            </button>
          </div>
        </form>
      )}

      {clipsQuery.isLoading && <p className="py-4 text-sm text-muted-foreground">Loading community clips…</p>}
      {clipsQuery.isError && <p role="alert" className="py-4 text-sm text-destructive">Clips could not be loaded right now.</p>}
      {!clipsQuery.isLoading && !clipsQuery.isError && clips.length === 0 && (
        <div className="border border-dashed border-border p-5 text-sm text-muted-foreground">
          No clips have been published yet. Be the first to share a short lesson, campus tip or career insight.
        </div>
      )}

      {clips.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clips.map((post) => {
            const embedId = youtubeId(post.youtube_url);
            return (
              <article key={post.id} className="min-w-0 overflow-hidden border border-border bg-card">
                <header className="flex items-center gap-3 p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-xs font-bold text-foreground">
                    {post.authorAvatar ? <img src={post.authorAvatar} alt="" className="h-full w-full object-cover" loading="lazy" /> : post.authorName.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{post.authorName}</p>
                    <p className="text-xs text-muted-foreground">{post.category} · {new Date(post.created_at).toLocaleDateString("en-GH")}</p>
                  </div>
                </header>
                {embedId ? (
                  <div className="aspect-[9/16] max-h-[560px] bg-black">
                    <iframe title={post.title || "Community short video"} src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(embedId)}`} className="h-full w-full" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />
                  </div>
                ) : post.video_url ? (
                  <video src={post.video_url} poster={post.thumbnail_url || undefined} className="aspect-[9/16] max-h-[560px] w-full bg-black object-contain" controls playsInline preload="metadata" />
                ) : null}
                <div className="p-4">
                  {post.title && <h3 className="font-semibold">{post.title}</h3>}
                  {post.description && <p className="mt-1 whitespace-pre-line text-sm leading-5 text-muted-foreground">{post.description}</p>}
                  {post.tags.length > 0 && <p className="mt-2 text-xs text-primary">{post.tags.map((tag) => "#" + tag.replace(/^#/, "")).join(" ")}</p>}
                  <div className="mt-3 flex items-center gap-4 border-t border-border pt-3">
                    <button type="button" disabled={pendingLike === post.id} onClick={() => void toggleLike(post)} aria-pressed={post.likedByMe} className={`inline-flex items-center gap-1.5 text-xs font-semibold ${post.likedByMe ? "text-primary" : "text-muted-foreground"}`}>
                      <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} /> {post.likes_count + (post.likedByMe ? 0 : 0)}
                    </button>
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><MessageCircle className="h-4 w-4" /> {post.comments_count}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {post.comments.slice(-2).map((comment) => <p key={comment.id} className="text-xs leading-5"><span className="font-semibold">{comment.authorName}: </span><span className="text-muted-foreground">{comment.content}</span></p>)}
                    <form onSubmit={(event) => { event.preventDefault(); void addComment(post); }} className="flex gap-2">
                      <input value={commentText[post.id] ?? ""} onChange={(event) => setCommentText((current) => ({ ...current, [post.id]: event.target.value }))} maxLength={1000} placeholder={user ? "Add a comment…" : "Sign in to comment"} disabled={!user || commentingOn === post.id} className="min-w-0 flex-1 border border-border bg-background px-2.5 py-2 text-xs disabled:opacity-60" />
                      <button type="submit" aria-label="Send comment" disabled={!user || !(commentText[post.id] ?? "").trim() || commentingOn === post.id} className="grid h-9 w-9 shrink-0 place-items-center bg-primary text-primary-foreground disabled:opacity-50"><Send className="h-4 w-4" /></button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <p className="mt-3 text-[11px] leading-5 text-muted-foreground">Keep clips short and helpful. Only share videos you own or are allowed to publish. This feed is community content, not official advice.</p>
    </section>
  );
}
