import { supabase } from "@/integrations/supabase/client";

/**
 * Privacy-conscious usage analytics.
 * We store an anonymous, rotating session id and (when signed in) the user id
 * so aggregate counts can be produced. No names, emails or grades are stored.
 */
const KEY = "ghanapath_session_id";

export const getSessionId = (): string => {
  if (typeof window === "undefined") return "server";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(KEY, id);
  }
  return id;
};

export type AnalyticsEvent =
  | "page_view"
  | "recommendation_run"
  | "programme_view"
  | "university_view"
  | "scholarship_view";

export async function track(
  event: AnalyticsEvent,
  opts: { path?: string; refType?: string; refId?: string } = {},
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const { data } = await supabase.auth.getSession();
    await supabase.from("analytics_events" as never).insert({
      event_type: event,
      user_id: data.session?.user.id ?? null,
      session_id: getSessionId(),
      path: opts.path ?? window.location.pathname,
      ref_type: opts.refType ?? null,
      ref_id: opts.refId ?? null,
    } as never);
  } catch {
    // Analytics must never break the app.
  }
}
