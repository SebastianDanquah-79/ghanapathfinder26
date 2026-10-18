import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { Bell, CheckCheck, CheckCircle2, Loader2 } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Notification = {
  id: string;
  title: string | null;
  body: string | null;
  message: string;
  read: boolean;
  is_read: boolean | null;
  created_at: string;
  link: string | null;
  action_url: string | null;
  category?: string | null;
  type?: string | null;
};

type PushPreferences = {
  breaking_news: boolean;
  top_stories: boolean;
  messages: boolean;
  platform_updates: boolean;
  saved_items: boolean;
};

const DEFAULT_PREFERENCES: PushPreferences = {
  breaking_news: true,
  top_stories: true,
  messages: true,
  platform_updates: true,
  saved_items: true,
};

const PREFERENCE_OPTIONS: { key: keyof PushPreferences; title: string; description: string }[] = [
  { key: "breaking_news", title: "Breaking news", description: "Urgent, important developments." },
  { key: "top_stories", title: "Top stories", description: "Major headlines and significant announcements." },
  { key: "messages", title: "Messages", description: "New messages sent to you on GhanaPathFinder." },
  { key: "platform_updates", title: "Platform updates", description: "Important account and GhanaPathFinder updates." },
  { key: "saved_items", title: "Saved items", description: "Alerts generated for your saved opportunities and items." },
];

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

function PushNotificationSettings({ userId }: { userId: string }) {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscribed, setSubscribed] = useState(false);
  const [endpoint, setEndpoint] = useState("");
  const [preferences, setPreferences] = useState<PushPreferences>(DEFAULT_PREFERENCES);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (typeof window === "undefined") return;
      const browserSupportsPush =
        window.isSecureContext &&
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window;

      if (!active) return;
      setSupported(browserSupportsPush);
      setPermission("Notification" in window ? Notification.permission : "unsupported");

      if (!browserSupportsPush) {
        setLoadingSettings(false);
        return;
      }

      try {
        await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (!active) return;

        if (subscription) {
          setEndpoint(subscription.endpoint);
          const { data, error } = await supabase.functions.invoke("web-push", {
            body: { action: "get_settings", endpoint: subscription.endpoint },
          });
          if (!error && active) {
            setSubscribed(Boolean(data?.subscribed));
            if (data?.preferences) {
              setPreferences({ ...DEFAULT_PREFERENCES, ...data.preferences });
            }
          } else if (active) {
            setSubscribed(false);
          }
        }
      } catch (error) {
        console.error("Could not load phone notification settings", error);
      } finally {
        if (active) setLoadingSettings(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [userId]);

  const updatePreference = async (key: keyof PushPreferences) => {
    const next = { ...preferences, [key]: !preferences[key] };
    setPreferences(next);
    if (!subscribed || !endpoint) return;

    const { error } = await supabase.functions.invoke("web-push", {
      body: { action: "update_preferences", endpoint, preferences: next },
    });

    if (error) {
      setPreferences(preferences);
      toast.error("Could not save this notification preference. Please try again.");
      console.error("Push preference update failed", error);
    }
  };

  const enableNotifications = async () => {
    if (!supported || busy) return;
    setBusy(true);
    try {
      let currentPermission = Notification.permission;
      if (currentPermission !== "granted") {
        currentPermission = await Notification.requestPermission();
      }
      setPermission(currentPermission);

      if (currentPermission !== "granted") {
        toast.error(
          currentPermission === "denied"
            ? "Notifications are blocked for this site. Open your browser's site settings and allow notifications."
            : "Allow notifications to receive GhanaPathFinder alerts.",
        );
        return;
      }

      const { data: keyData, error: keyError } = await supabase.functions.invoke("web-push", {
        body: { action: "get_public_key" },
      });
      if (keyError || !keyData?.publicKey) {
        throw new Error("The push notification service is not ready yet.");
      }

      await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.publicKey) as BufferSource,
        });
      }

      const { data, error } = await supabase.functions.invoke("web-push", {
        body: {
          action: "subscribe",
          subscription: subscription.toJSON(),
          preferences,
          userAgent: navigator.userAgent,
        },
      });
      if (error || !data?.ok) throw new Error(error?.message || "Could not save this phone subscription.");

      setEndpoint(subscription.endpoint);
      setSubscribed(true);
      setPermission(Notification.permission);
      toast.success("Phone notifications are enabled.");
    } catch (error) {
      console.error("Could not enable phone notifications", error);
      toast.error(error instanceof Error ? error.message : "Could not enable phone notifications.");
    } finally {
      setBusy(false);
    }
  };

  const disableNotifications = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      const activeEndpoint = subscription?.endpoint || endpoint;

      if (activeEndpoint) {
        const { error } = await supabase.functions.invoke("web-push", {
          body: { action: "unsubscribe", endpoint: activeEndpoint },
        });
        if (error) throw error;
      }

      if (subscription) await subscription.unsubscribe();
      setSubscribed(false);
      setEndpoint("");
      toast.success("Phone notifications are turned off.");
    } catch (error) {
      console.error("Could not disable phone notifications", error);
      toast.error("Could not turn notifications off. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const sendTestNotification = async () => {
    if (!endpoint || busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("web-push", {
        body: { action: "test", endpoint },
      });
      if (error) throw error;
      toast.success("Test notification sent. Check your phone's notification shade.");
    } catch (error) {
      console.error("Test push notification failed", error);
      toast.error("Could not send a test notification. Check your permission and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-6 border border-border bg-card p-4 sm:p-5" aria-labelledby="phone-alerts-title">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-secondary">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 id="phone-alerts-title" className="text-lg font-semibold">Phone notifications</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Get alerts in your phone's notification shade, even when GhanaPathFinder is closed.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className={`inline-flex items-center gap-1 border px-2 py-1 ${subscribed ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-700" : "border-border text-muted-foreground"}`}>
              {subscribed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />}
              {loadingSettings ? "Checking status…" : subscribed ? "Enabled on this phone" : "Not enabled"}
            </span>
            {permission === "denied" && <span className="text-destructive">Blocked by browser settings</span>}
          </div>
        </div>
      </div>

      {!supported && (
        <div className="mt-4 border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
          This browser does not support web push notifications here. Open GhanaPathFinder in Chrome or another supported browser on HTTPS.
        </div>
      )}

      {supported && permission === "denied" && (
        <div className="mt-4 border border-border bg-secondary/50 p-3 text-sm text-muted-foreground">
          Notifications are currently blocked. In your phone's browser settings, open Site settings, choose Notifications, and allow GhanaPathFinder. Then return here.
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!subscribed ? (
          <button
            type="button"
            onClick={() => void enableNotifications()}
            disabled={!supported || busy || loadingSettings}
            className="inline-flex min-h-10 items-center gap-2 bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Enable phone notifications
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void sendTestNotification()}
              disabled={busy}
              className="inline-flex min-h-10 items-center gap-2 border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Send test alert
            </button>
            <button
              type="button"
              onClick={() => void disableNotifications()}
              disabled={busy}
              className="min-h-10 border border-border px-4 py-2 text-sm font-semibold text-muted-foreground disabled:opacity-50"
            >
              Turn off
            </button>
          </>
        )}
      </div>

      <div className="mt-5 border-t border-border pt-4">
        <h3 className="text-sm font-semibold">Choose which alerts you receive</h3>
        <p className="mt-1 text-xs text-muted-foreground">These settings apply to this phone. You can turn off any category.</p>
        <div className="mt-3 divide-y divide-border">
          {PREFERENCE_OPTIONS.map((option) => (
            <div key={option.key} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">{option.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{option.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences[option.key]}
                aria-label={option.title}
                onClick={() => void updatePreference(option.key)}
                disabled={busy || loadingSettings}
                className={`relative h-6 w-11 shrink-0 border transition-colors disabled:opacity-50 ${preferences[option.key] ? "border-primary bg-primary" : "border-border bg-secondary"}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 bg-background transition-transform ${preferences[option.key] ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
        {!subscribed && (
          <p className="mt-2 text-xs text-muted-foreground">Your choices will be saved when you enable notifications on this phone.</p>
        )}
      </div>
    </section>
  );
}

export default function Notifications() {
  const { user, loading } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    async function load() {
      const result = await supabase
        .from("notifications")
        .select("id,title,body,message,read,is_read,created_at,link,action_url,category,type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (active && result.data) setItems(result.data as Notification[]);
    }

    void load();
    const channel = supabase
      .channel("gpf-notifications-" + user.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: "user_id=eq." + user.id },
        (payload) => {
          setItems((current) => [payload.new as Notification, ...current].slice(0, 50));
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading) {
    return <div className="min-h-dvh grid place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }
  if (!user) return null;

  async function markAll() {
    const unread = items.filter((item) => !(item.is_read ?? item.read)).map((item) => item.id);
    if (!unread.length) return;

    await supabase
      .from("notifications")
      .update({ is_read: true, read: true, read_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .in("id", unread);

    setItems((current) => current.map((item) => ({ ...item, is_read: true, read: true })));
  }

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-20 sm:px-6">
        <Seo title="Notifications | GhanaPathFinder" description="Your GhanaPathFinder notifications and phone alert settings." path="/notifications" />
        <div className="flex items-center justify-between gap-3 border-b border-border pb-5">
          <div>
            <p className="text-sm font-semibold text-primary">Inbox</p>
            <h1 className="mt-1 text-3xl font-bold">Notifications</h1>
          </div>
          <button
            type="button"
            onClick={() => void markAll()}
            className="inline-flex min-h-9 items-center gap-2 border border-border px-3 py-2 text-xs font-semibold"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        </div>

        <PushNotificationSettings userId={user.id} />

        <div className="mt-6">
          <h2 className="text-lg font-semibold">Recent notifications</h2>
          <div className="mt-3 space-y-2">
            {items.map((item) => {
              const unread = !(item.is_read ?? item.read);
              const destination = item.link || item.action_url || "/notifications";
              return (
                <a
                  key={item.id}
                  href={destination}
                  className={"block border border-border bg-card p-4 " + (unread ? "border-primary/40 bg-primary/[0.03]" : "")}
                >
                  <div className="flex justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-semibold">{item.title || item.message}</p>
                      {item.body && <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>}
                    </div>
                    <time className="shrink-0 text-[11px] text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString("en-GH")}
                    </time>
                  </div>
                </a>
              );
            })}
            {!items.length && (
              <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">
                You are all caught up. New messages and eligible major news alerts will appear here.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
