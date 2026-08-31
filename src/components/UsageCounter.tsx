import { Users } from "@/lib/icons";
import { useLivePresence } from "@/hooks/useLivePresence";

/**
 * Real, verified usage counter. Both numbers come from the GhanaPathFinder
 * database: "Live now" is the count of genuinely active sessions in the last
 * 90 seconds, "total" is registered accounts. Aggregate only, so no individual
 * student is ever identifiable, and nothing is ever fabricated or padded.
 */
const UsageCounter = ({ className = "", inverse = false }: { className?: string; inverse?: boolean }) => {
  const { data, isError, isLoading } = useLivePresence();

  if (isError && !data) {
    return (
      <p className={`text-xs sm:text-sm text-muted-foreground ${className}`}>
        Live count unavailable
      </p>
    );
  }
  if (!data || isLoading) return null;


  return (
    <p
      suppressHydrationWarning
      className={`inline-flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs sm:text-sm text-muted-foreground ${className}`}
    >
      <span className="inline-flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="font-semibold text-foreground">
          {data.live_now.toLocaleString("en-GB")}
        </span>
        live now
      </span>
      <span aria-hidden className="text-border">|</span>
      <span className="inline-flex items-center gap-1.5">
        <Users className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-foreground">
          {data.total_users.toLocaleString("en-GB")}
        </span>
        students on GhanaPathFinder
      </span>
    </p>
  );
};

export default UsageCounter;
