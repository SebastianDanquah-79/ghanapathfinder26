import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/analytics";

export interface LivePresence {
  /** Distinct people active in the last 90 seconds (real backend state). */
  live_now: number;
  /** Total registered accounts. */
  total_users: number;
}

export const LIVE_PRESENCE_KEY = ["live_presence"] as const;

const HEARTBEAT_MS = 30_000;

const toPresence = (row: unknown): LivePresence => {
  const r = (row ?? {}) as Partial<LivePresence>;
  return {
    live_now: Number(r.live_now ?? 0),
    total_users: Number(r.total_users ?? 0),
  };
};

/**
 * Real-time active-user count.
 *
 * Every open browser sends a heartbeat for its (shared, per-browser) session id
 * to the database. The database counts each signed-in account once, no matter
 * how many tabs or devices it uses, and drops any session not seen for 90
 * seconds, so refreshes never inflate the number and closed browsers or lost
 * connections fall out on their own. Nothing is stored or shown per person.
 */
export const useLivePresence = () => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: LIVE_PRESENCE_KEY,
    queryFn: async (): Promise<LivePresence> => {
      const { data, error } = await supabase.rpc("live_presence" as never);
      if (error) throw error;
      return toPresence(data);
    },
    // Poll as a safety net; heartbeats keep the number fresh in between.
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
    retry: 2,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    // Read the id on every beat: if two tabs opened at once and raced to create
    // one, they converge on the stored value instead of counting twice.
    let sessionId = getSessionId();

    const beat = async () => {
      if (cancelled) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      if (typeof navigator !== "undefined" && navigator.onLine === false) return;
      const previous = sessionId;
      sessionId = getSessionId();
      try {
        if (previous !== sessionId) {
          void supabase.rpc("end_session" as never, { _session_id: previous } as never);
        }
        const { data, error } = await supabase.rpc("heartbeat_session" as never, {
          _session_id: sessionId,
        } as never);
        if (error) throw error;
        if (cancelled) return;
        const live = Number(data ?? 0);
        qc.setQueryData(LIVE_PRESENCE_KEY, (prev: LivePresence | undefined) => ({
          live_now: live,
          total_users: prev?.total_users ?? 0,
        }));
      } catch {
        // Network or database hiccup: keep the last known value, try again later.
      }
    };

    void beat();
    const timer = window.setInterval(() => void beat(), HEARTBEAT_MS);

    const onVisible = () => {
      if (document.visibilityState === "visible") void beat();
    };
    const onLeave = () => {
      // Best effort: drop this session immediately when the tab goes away.
      void supabase.rpc("end_session" as never, { _session_id: sessionId } as never);
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", onVisible);
    window.addEventListener("pagehide", onLeave);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", onVisible);
      window.removeEventListener("pagehide", onLeave);
    };
  }, [qc]);

  return query;
};
