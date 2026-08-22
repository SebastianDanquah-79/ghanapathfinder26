import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  useAddComment,
  useDeleteComment,
  useInsightComments,
  useMyCommentLikes,
  useToggleCommentLike,
} from "@/hooks/useComments";

const timeAgo = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString();
};

const Avatar = ({ label }: { label: string }) => (
  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
    {label.slice(0, 2).toUpperCase()}
  </span>
);

interface Props {
  insightId: string;
  /** Render the composer + list only when the thread is open. */
  open: boolean;
}

const CommentThread = ({ insightId, open }: Props) => {
  const { user } = useAuth();
  const { data: comments, isLoading } = useInsightComments(insightId, open);
  const { data: myLikes } = useMyCommentLikes();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const toggleLike = useToggleCommentLike();

  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");

  const { roots, repliesOf } = useMemo(() => {
    const all = comments ?? [];
    const map = new Map<string, typeof all>();
    for (const c of all) {
      if (!c.parent_id) continue;
      map.set(c.parent_id, [...(map.get(c.parent_id) ?? []), c]);
    }
    return { roots: all.filter((c) => !c.parent_id), repliesOf: map };
  }, [comments]);

  if (!open) return null;

  const post = (body: string, parentId: string | null, reset: () => void) => {
    if (!user) {
      toast.error("Please sign in to join the discussion.");
      return;
    }
    if (!body.trim()) return;
    addComment.mutate(
      { insight_id: insightId, body, parent_id: parentId },
      {
        onSuccess: reset,
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Could not post your comment."),
      },
    );
  };

  const like = (commentId: string) =>
    toggleLike.mutate(
      { comment_id: commentId, insight_id: insightId },
      {
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Could not save your like."),
      },
    );

  const remove = (id: string) => {
    if (!window.confirm("Delete this comment?")) return;
    deleteComment.mutate(
      { id, insight_id: insightId },
      {
        onSuccess: () => toast.success("Comment deleted."),
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Could not delete the comment."),
      },
    );
  };

  return (
    <div className="mt-3 border-t border-border pt-3 space-y-3">
      {/* Composer */}
      <div className="flex items-start gap-2">
        <Avatar label={user ? "Me" : "?"} />
        <div className="flex-1">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder={user ? "Write a comment…" : "Sign in to comment"}
            disabled={!user}
            className="w-full resize-none rounded-2xl bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
          />
          <div className="mt-1 flex justify-end">
            <button
              onClick={() => post(draft, null, () => setDraft(""))}
              disabled={!user || addComment.isPending || !draft.trim()}
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {addComment.isPending ? "Posting…" : "Comment"}
            </button>
          </div>
        </div>
      </div>

      {isLoading && <p className="text-xs text-muted-foreground">Loading comments…</p>}
      {!isLoading && roots.length === 0 && (
        <p className="text-xs text-muted-foreground">No comments yet — start the discussion.</p>
      )}

      {roots.map((c) => (
        <div key={c.id} className="space-y-2">
          <div className="flex items-start gap-2">
            <Avatar label={c.author_label} />
            <div className="flex-1">
              <div className="rounded-2xl bg-secondary px-3 py-2">
                <p className="text-xs font-semibold text-foreground">{c.author_label}</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{c.body}</p>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 pl-1 text-[11px]">
                <button
                  onClick={() => like(c.id)}
                  aria-pressed={myLikes?.has(c.id) ?? false}
                  className={`font-medium ${myLikes?.has(c.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Like{c.like_count ? ` · ${c.like_count}` : ""}
                </button>
                <button
                  onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                  className="font-medium text-muted-foreground hover:text-foreground"
                >
                  Reply
                </button>
                <span className="text-muted-foreground">{timeAgo(c.created_at)}</span>
                {user?.id === c.user_id && (
                  <button
                    onClick={() => remove(c.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    Delete
                  </button>
                )}
              </div>

              {replyTo === c.id && (
                <div className="mt-2 flex items-start gap-2">
                  <Avatar label={user ? "Me" : "?"} />
                  <div className="flex-1">
                    <input
                      value={replyDraft}
                      onChange={(e) => setReplyDraft(e.target.value)}
                      placeholder={user ? `Reply to ${c.author_label}…` : "Sign in to reply"}
                      disabled={!user}
                      className="w-full rounded-full bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          post(replyDraft, c.id, () => {
                            setReplyDraft("");
                            setReplyTo(null);
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              )}

              {(repliesOf.get(c.id) ?? []).map((r) => (
                <div key={r.id} className="mt-2 flex items-start gap-2 pl-4">
                  <Avatar label={r.author_label} />
                  <div className="flex-1">
                    <div className="rounded-2xl bg-secondary px-3 py-2">
                      <p className="text-xs font-semibold text-foreground">{r.author_label}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{r.body}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-3 pl-1 text-[11px]">
                      <button
                        onClick={() => like(r.id)}
                        aria-pressed={myLikes?.has(r.id) ?? false}
                        className={`font-medium ${myLikes?.has(r.id) ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        Like{r.like_count ? ` · ${r.like_count}` : ""}
                      </button>
                      <span className="text-muted-foreground">{timeAgo(r.created_at)}</span>
                      {user?.id === r.user_id && (
                        <button
                          onClick={() => remove(r.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentThread;
