import { Users } from "lucide-react";
import { PUBLIC_METRICS, useUsageStats } from "@/hooks/useUsageStats";

/**
 * Real, verified usage counter. The number always comes from stored analytics
 * in the GhanaPath database — never a hardcoded marketing figure. Aggregate
 * only: no individual student is ever identifiable.
 */
const UsageCounter = ({ className = "" }: { className?: string }) => {
  const { data } = useUsageStats();
  if (!data) return null;

  const chosen = PUBLIC_METRICS.find((m) => m.key === data.metric) ?? PUBLIC_METRICS[0]!;
  const value = Number(data[chosen.field] ?? 0);
  if (!value) return null;

  const noun =
    chosen.key === "website_visits"
      ? "website visits"
      : chosen.key === "recommendation_runs"
        ? "recommendation runs on GhanaPath"
        : "students exploring their future with GhanaPath";

  return (
    <p
      className={`inline-flex items-center gap-2 text-xs sm:text-sm text-muted-foreground ${className}`}
    >
      <Users className="h-4 w-4 text-primary shrink-0" />
      <span>
        <span className="font-semibold text-foreground">{value.toLocaleString("en-GB")}</span> {noun}
      </span>
    </p>
  );
};

export default UsageCounter;
