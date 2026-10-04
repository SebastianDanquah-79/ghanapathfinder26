import { supabase } from "@/integrations/supabase/client";

/** Privacy-conscious usage analytics. Never store names, emails, grades, or search text. */
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
  | "scholarship_view"
  | "sign_up"
  | "sign_in"
  | "onboarding_completed"
  | "search_performed"
  | "opportunity_saved"
  | "opportunity_removed"
  | "cv_saved"
  | "cv_exported";

const getDeviceType = (): "mobile" | "desktop" | "tablet" => {
  const ua = navigator.userAgent.toLowerCase();
  if (/ipad|tablet|kindle|silk|playbook/.test(ua) || (/android/.test(ua) && !/mobile/.test(ua))) {
    return "tablet";
  }
  if (/mobi|iphone|ipod|android.*mobile/.test(ua)) return "mobile";
  return "desktop";
};

const cleanCampaignValue = (value: string | null): string | null => {
  const cleaned = value?.trim().replace(/[<>]/g, "").slice(0, 120);
  return cleaned || null;
};

export async function track(
  event: AnalyticsEvent,
  opts: { path?: string; refType?: string; refId?: string } = {},
): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    if (navigator.doNotTrack === "1") return;
    const { data } = await supabase.auth.getSession();
    const params = new URLSearchParams(window.location.search);
    let referrerHost: string | null = null;
    try {
      referrerHost = document.referrer ? new URL(document.referrer).hostname.slice(0, 255) : null;
    } catch {
      referrerHost = null;
    }
    const { error } = await supabase.from("analytics_events" as never).insert({
      event_type: event,
      user_id: data.session?.user.id ?? null,
      session_id: getSessionId(),
      path: opts.path ?? window.location.pathname,
      ref_type: opts.refType ?? null,
      ref_id: opts.refId ?? null,
      device_type: getDeviceType(),
      referrer_host: referrerHost,
      utm_source: cleanCampaignValue(params.get("utm_source")),
      utm_medium: cleanCampaignValue(params.get("utm_medium")),
      utm_campaign: cleanCampaignValue(params.get("utm_campaign")),
    } as never);
    if (error) {
      // Analytics failures must never interrupt core product actions.
      console.debug("Analytics event was not recorded:", error.message);
    }
  } catch {
    // Analytics must never break the app.
  }
}
