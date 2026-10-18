import { createClient } from "npm:@supabase/supabase-js@2.110.7";
import webpush from "npm:web-push@3.6.7";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase server environment is missing required credentials.");
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-gpf-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type PushPreferences = {
  breaking_news: boolean;
  top_stories: boolean;
  messages: boolean;
  platform_updates: boolean;
  saved_items: boolean;
};

type PushConfig = {
  id: number;
  public_key: string;
  private_key: string;
  webhook_secret: string;
};

type StoredSubscription = {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  preferences: PushPreferences;
  user_agent: string | null;
};

const DEFAULT_PREFERENCES: PushPreferences = {
  breaking_news: true,
  top_stories: true,
  messages: true,
  platform_updates: true,
  saved_items: true,
};

function respond(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function normalizePreferences(input: unknown): PushPreferences {
  const value = input && typeof input === "object" ? input as Record<string, unknown> : {};
  return {
    breaking_news: typeof value.breaking_news === "boolean" ? value.breaking_news : true,
    top_stories: typeof value.top_stories === "boolean" ? value.top_stories : true,
    messages: typeof value.messages === "boolean" ? value.messages : true,
    platform_updates: typeof value.platform_updates === "boolean" ? value.platform_updates : true,
    saved_items: typeof value.saved_items === "boolean" ? value.saved_items : true,
  };
}

function randomSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function getConfig(): Promise<PushConfig> {
  const { data: existing, error: readError } = await admin
    .from("web_push_config")
    .select("id,public_key,private_key,webhook_secret")
    .eq("id", 1)
    .maybeSingle();

  if (readError) throw readError;
  if (existing) return existing as PushConfig;

  const vapid = webpush.generateVAPIDKeys();
  const { error: insertError } = await admin.from("web_push_config").upsert(
    {
      id: 1,
      public_key: vapid.publicKey,
      private_key: vapid.privateKey,
      webhook_secret: randomSecret(),
    },
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (insertError) throw insertError;

  const { data: created, error: reloadError } = await admin
    .from("web_push_config")
    .select("id,public_key,private_key,webhook_secret")
    .eq("id", 1)
    .single();

  if (reloadError || !created) throw reloadError ?? new Error("Could not initialize push configuration.");
  return created as PushConfig;
}

async function authenticatedUser(request: Request) {
  const authorization = request.headers.get("Authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;

  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

function validEndpoint(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 4096) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function preferenceFor(notification: Record<string, unknown>): keyof PushPreferences {
  const category = String(notification.category ?? "").toLowerCase();
  const type = String(notification.type ?? "").toLowerCase();
  const title = String(notification.title ?? "").toLowerCase();
  const body = String(notification.body ?? notification.message ?? "").toLowerCase();
  const text = `${category} ${type} ${title} ${body}`;

  if (category.includes("breaking_news") || type.includes("breaking_news") || /\b(breaking|urgent)\b/.test(text)) {
    return "breaking_news";
  }
  if (category.includes("top_stories") || type.includes("top_stories") || /\b(top story|headline)\b/.test(text)) {
    return "top_stories";
  }
  if (category.includes("message") || type.includes("message") || /\b(chat|reply)\b/.test(text)) {
    return "messages";
  }
  if (category.includes("saved") || type.includes("saved") || /\b(bookmark|saved item|scholarship deadline|application deadline)\b/.test(text)) {
    return "saved_items";
  }
  return "platform_updates";
}

function safeNotificationUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "/notifications";
  try {
    const url = new URL(value, "https://www.ghanapathfinder.com");
    if (url.protocol !== "https:" && url.protocol !== "http:") return "/notifications";
    return value.startsWith("/") && !value.startsWith("//") ? value : url.href;
  } catch {
    return "/notifications";
  }
}

async function sendToSubscription(
  subscription: StoredSubscription,
  payload: Record<string, unknown>,
  config: PushConfig,
): Promise<boolean> {
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload),
      {
        TTL: 60 * 60,
        vapidDetails: {
          subject: "https://www.ghanapathfinder.com/",
          publicKey: config.public_key,
          privateKey: config.private_key,
        },
      },
    );
    return true;
  } catch (error) {
    const statusCode = Number((error as { statusCode?: number })?.statusCode ?? 0);
    if (statusCode === 404 || statusCode === 410) {
      await admin.from("web_push_subscriptions").delete().eq("endpoint", subscription.endpoint);
    } else {
      console.error("Web push delivery failed", statusCode, error);
    }
    return false;
  }
}

async function dispatchStoredNotification(notificationId: string) {
  const { data: notification, error } = await admin
    .from("notifications")
    .select("id,user_id,title,body,message,type,category,link,action_url,created_at")
    .eq("id", notificationId)
    .maybeSingle();

  if (error) throw error;
  if (!notification) return { delivered: 0, skipped: true };

  const { data: rows, error: subscriptionsError } = await admin
    .from("web_push_subscriptions")
    .select("id,user_id,endpoint,p256dh,auth,preferences,user_agent")
    .eq("user_id", notification.user_id);

  if (subscriptionsError) throw subscriptionsError;
  const preference = preferenceFor(notification as Record<string, unknown>);
  const subscriptions = (rows ?? []) as StoredSubscription[];
  const eligible = subscriptions.filter((row) => row.preferences?.[preference] !== false);
  if (!eligible.length) return { delivered: 0, skipped: true };

  const config = await getConfig();
  const payload = {
    title: String(notification.title || notification.message || "GhanaPathFinder"),
    body: String(notification.body || notification.message || "You have a new update."),
    url: safeNotificationUrl(notification.link || notification.action_url),
    tag: `gpf-${notification.id}`,
    notificationId: notification.id,
    icon: "/app-icon-192.png",
    badge: "/favicon.png",
  };

  const results = await Promise.all(eligible.map((subscription) => sendToSubscription(subscription, payload, config)));
  return { delivered: results.filter(Boolean).length, skipped: false };
}

async function handleRequest(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "Method not allowed." }, 405);

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return respond({ error: "Request body must be valid JSON." }, 400);
  }

  // Only the database trigger knows the per-project webhook secret.
  if (body.kind === "notification_created") {
    const config = await getConfig();
    const providedSecret = request.headers.get("x-gpf-webhook-secret") ?? "";
    if (!providedSecret || providedSecret !== config.webhook_secret) {
      return respond({ error: "Unauthorized." }, 401);
    }

    const notificationId = String(body.notification_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(notificationId)) return respond({ error: "Invalid notification ID." }, 400);
    const result = await dispatchStoredNotification(notificationId);
    return respond({ ok: true, ...result });
  }

  const action = String(body.action ?? "");
  if (action === "get_public_key") {
    const config = await getConfig();
    return respond({ publicKey: config.public_key });
  }

  const user = await authenticatedUser(request);
  if (!user) return respond({ error: "Sign in to manage phone notifications." }, 401);

  if (action === "subscribe") {
    const subscription = body.subscription as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } } | undefined;
    if (!subscription || !validEndpoint(subscription.endpoint) ||
      typeof subscription.keys?.p256dh !== "string" || typeof subscription.keys?.auth !== "string") {
      return respond({ error: "The browser returned an invalid push subscription." }, 400);
    }

    const { error } = await admin.from("web_push_subscriptions").upsert(
      {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        preferences: normalizePreferences(body.preferences),
        user_agent: typeof body.userAgent === "string" ? body.userAgent.slice(0, 500) : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    );
    if (error) throw error;
    return respond({ ok: true, preferences: normalizePreferences(body.preferences) });
  }

  const endpoint = body.endpoint;
  if (action !== "unsubscribe" && !validEndpoint(endpoint)) {
    return respond({ error: "A valid device subscription is required." }, 400);
  }

  if (action === "get_settings") {
    const { data, error } = await admin.from("web_push_subscriptions")
      .select("preferences")
      .eq("user_id", user.id)
      .eq("endpoint", endpoint as string)
      .maybeSingle();
    if (error) throw error;
    return respond({ subscribed: Boolean(data), preferences: normalizePreferences(data?.preferences) });
  }

  if (action === "update_preferences") {
    const preferences = normalizePreferences(body.preferences);
    const { data, error } = await admin.from("web_push_subscriptions")
      .update({ preferences, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("endpoint", endpoint as string)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    if (!data) return respond({ error: "This phone is not subscribed yet." }, 404);
    return respond({ ok: true, preferences });
  }

  if (action === "unsubscribe") {
    const url = typeof endpoint === "string" ? endpoint : "";
    if (url && !validEndpoint(url)) return respond({ error: "Invalid device endpoint." }, 400);
    if (url) {
      const { error } = await admin.from("web_push_subscriptions").delete()
        .eq("user_id", user.id)
        .eq("endpoint", url);
      if (error) throw error;
    }
    return respond({ ok: true });
  }

  if (action === "test") {
    const { data, error } = await admin.from("web_push_subscriptions")
      .select("id,user_id,endpoint,p256dh,auth,preferences,user_agent")
      .eq("user_id", user.id)
      .eq("endpoint", endpoint as string)
      .maybeSingle();
    if (error) throw error;
    if (!data) return respond({ error: "This phone is not subscribed yet." }, 404);

    const config = await getConfig();
    const delivered = await sendToSubscription(data as StoredSubscription, {
      title: "GhanaPathFinder notifications are on",
      body: "Your phone is ready to receive breaking news, important updates and messages.",
      url: "/notifications",
      tag: "gpf-push-test",
      icon: "/app-icon-192.png",
      badge: "/favicon.png",
    }, config);
    if (!delivered) return respond({ error: "The test notification could not be delivered. Please enable notifications for this site and try again." }, 502);
    return respond({ ok: true, delivered: 1 });
  }

  return respond({ error: "Unknown action." }, 400);
}

Deno.serve(async (request: Request) => {
  try {
    return await handleRequest(request);
  } catch (error) {
    console.error("GhanaPathFinder web-push request failed", error);
    return respond({ error: "The notification service could not complete the request. Please try again." }, 500);
  }
});
