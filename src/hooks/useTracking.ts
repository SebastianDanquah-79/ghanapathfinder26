import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Records one anonymous page view per navigation. */
export const usePageViews = () => {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    void track("page_view", { path: pathname });
  }, [pathname]);
};

/** Records a single view event for a programme, university or scholarship. */
export const useTrackView = (event: AnalyticsEvent, refType: string, refId?: string) => {
  useEffect(() => {
    if (!refId) return;
    void track(event, { refType, refId });
  }, [event, refType, refId]);
};
