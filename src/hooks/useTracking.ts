import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { track, type AnalyticsEvent } from "@/lib/analytics";
import { USAGE_STATS_KEY } from "@/hooks/useUsageStats";

/** Records one anonymous page view per navigation, then refreshes the live counter. */
export const usePageViews = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  useEffect(() => {
    let cancelled = false;
    void track("page_view", { path: pathname }).then(() => {
      if (!cancelled) void qc.invalidateQueries({ queryKey: USAGE_STATS_KEY });
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, qc]);
};

/** Records a single view event for a programme, university or scholarship. */
export const useTrackView = (event: AnalyticsEvent, refType: string, refId?: string) => {
  useEffect(() => {
    if (!refId) return;
    void track(event, { refType, refId });
  }, [event, refType, refId]);
};
