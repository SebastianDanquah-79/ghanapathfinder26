import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@/lib/router-compat";
import { toast } from "sonner";

interface Summary {
  average: number;
  count: number;
}

const Star = ({ filled }: { filled: boolean }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
    <path
      d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4 7.3 13.93 2.6 9.35l6.5-.95L12 2.5z"
      className={filled ? "fill-primary" : "fill-transparent"}
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
  </svg>
);

/** Website rating: signed-in users rate 1-5 stars; everyone sees the live average. */
const SiteRating = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const summaryQuery = useQuery({
    queryKey: ["site-rating-summary"],
    queryFn: async (): Promise<Summary> => {
      const { data, error } = await supabase.rpc("site_rating_summary");
      if (error) throw error;
      const raw = (data ?? {}) as { average?: number | string; count?: number | string };
      return { average: Number(raw.average ?? 0), count: Number(raw.count ?? 0) };
    },
  });

  const mineQuery = useQuery({
    queryKey: ["site-rating-mine", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_ratings")
        .select("rating, comment")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (mineQuery.data) {
      setRating(mineQuery.data.rating ?? 0);
      setComment(mineQuery.data.comment ?? "");
    }
  }, [mineQuery.data]);

  const save = useMutation({
    mutationFn: async (value: number) => {
      if (!user) throw new Error("Sign in to rate GhanaPathFinder.");
      const { error } = await supabase
        .from("site_ratings")
        .upsert(
          { user_id: user.id, rating: value, comment: comment.trim() || null },
          { onConflict: "user_id" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks for rating GhanaPathFinder!");
      queryClient.invalidateQueries({ queryKey: ["site-rating-summary"] });
      queryClient.invalidateQueries({ queryKey: ["site-rating-mine", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not save your rating."),
  });

  const summary = summaryQuery.data;
  const average = summary?.average ?? 0;
  const shown = hover || rating || Math.round(average);

  return (
    <section
      aria-labelledby="site-rating-heading"
      className="mt-6 mx-auto max-w-md rounded-xl bg-glass p-4 text-center"
    >
      <h3 id="site-rating-heading" className="font-display font-semibold text-foreground">
        Rate GhanaPathFinder
      </h3>

      <p className="text-xs text-muted-foreground mt-1">
        {summary && summary.count > 0
          ? `${average.toFixed(1)} out of 5 · ${summary.count} rating${summary.count === 1 ? "" : "s"}`
          : "Be the first to rate this website"}
      </p>

      <div className="mt-3 flex items-center justify-center gap-1 text-muted-foreground">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={!user || save.isPending}
            aria-label={`Rate ${n} out of 5`}
            aria-pressed={rating === n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => {
              setRating(n);
              save.mutate(n);
            }}
            className="p-1 transition-transform hover:scale-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Star filled={n <= shown} />
          </button>
        ))}
      </div>

      {user ? (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Optional: tell us what works or what to improve"
            aria-label="Optional feedback about the website"
            className="mt-3 w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/50"
          />
          <button
            type="button"
            disabled={!rating || save.isPending}
            onClick={() => save.mutate(rating)}
            className="mt-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50"
          >
            {mineQuery.data ? "Update my rating" : "Submit rating"}
          </button>
        </>
      ) : (
        <p className="mt-3 text-xs text-muted-foreground">
          <Link to="/auth" className="text-primary hover:underline">
            Sign in
          </Link>{" "}
          to leave your rating.
        </p>
      )}
    </section>
  );
};

export default SiteRating;
