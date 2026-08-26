import { useSiteRatingSummary } from "@/hooks/useSiteRating";

const Star = ({ fill }: { fill: number }) => {
  const id = `star-${Math.round(fill * 100)}`;
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="currentColor" />
          <stop offset={`${fill * 100}%`} stopColor="transparent" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.35 6.19 20.4 7.3 13.93 2.6 9.35l6.5-.95L12 2.5z"
        fill={`url(#${id})`}
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** Compact live average-rating badge shown in the hero and footer. */
const SiteRatingBadge = ({ className = "" }: { className?: string }) => {
  const { data } = useSiteRatingSummary();
  const average = data?.average ?? 0;
  const count = data?.count ?? 0;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full bg-glass px-3 py-1.5 ${className}`}
      aria-label={
        count > 0
          ? `Rated ${average.toFixed(1)} out of 5 by ${count} people`
          : "No ratings yet"
      }
    >
      <span className="flex items-center gap-0.5 text-primary">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} fill={Math.min(1, Math.max(0, average - (n - 1)))} />
        ))}
      </span>
      <span className="text-sm text-foreground font-medium">
        {count > 0 ? average.toFixed(1) : "—"}
      </span>
      <span className="text-xs text-muted-foreground">
        {count > 0 ? `${count} rating${count === 1 ? "" : "s"}` : "Be the first to rate"}
      </span>
    </div>
  );
};

export default SiteRatingBadge;
