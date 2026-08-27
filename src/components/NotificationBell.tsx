import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import { scholarships } from "@/data/scholarships";
import { estimateDeadlineDate } from "@/lib/scholarshipDates";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Notice {
  id: string;
  title: string;
  body: string;
  href: string;
  unread: boolean;
  /** Database row id, when the notice comes from the notifications table. */
  rowId?: string;
}

const daysUntil = (date: Date) => Math.ceil((date.getTime() - Date.now()) / 86_400_000);

const buildDeadlineNotices = (): Notice[] =>
  scholarships
    .map((s) => ({ s, date: estimateDeadlineDate(s.deadline) }))
    .filter((x): x is { s: (typeof scholarships)[number]; date: Date } => {
      if (!x.date) return false;
      const d = daysUntil(x.date);
      return d >= 0 && d <= 60;
    })
    .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
    .slice(0, 6)
    .map(({ s, date }) => {
      const d = daysUntil(date);
      return {
        id: `deadline:${s.name}`,
        title: s.name,
        body: d === 0 ? "Deadline is today" : `Deadline in about ${d} day${d === 1 ? "" : "s"}`,
        href: "/scholarships",
        unread: true,
      };
    });

/** Ask once for browser notification permission so alerts reach the phone's notification area. */
const ensureSystemPermission = async () => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") toast.success("Notifications enabled — alerts will appear on your phone.");
    } catch {
      /* ignore */
    }
  }
};

const pushSystemNotifications = (notices: Notice[]) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const seenKey = "gp-notified";
  let seen: string[] = [];
  try {
    seen = JSON.parse(localStorage.getItem(seenKey) ?? "[]");
  } catch {
    /* ignore */
  }
  const fresh = notices.filter((n) => n.unread && !seen.includes(n.id)).slice(0, 3);
  fresh.forEach((n) => {
    try {
      new Notification(n.title, { body: n.body, icon: "/app-icon-192.png", tag: n.id });
      seen.push(n.id);
    } catch {
      /* ignore */
    }
  });
  if (fresh.length) localStorage.setItem(seenKey, JSON.stringify(seen.slice(-80)));
};

const NotificationBell = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [dbNotices, setDbNotices] = useState<Notice[]>([]);
  const [deadlineNotices, setDeadlineNotices] = useState<Notice[]>([]);
  const [deadlinesRead, setDeadlinesRead] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const loadDb = useCallback(async () => {
    if (!user) {
      setDbNotices([]);
      return [] as Notice[];
    }
    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, body, link, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) return [] as Notice[];
    const list: Notice[] = (data ?? []).map((n) => ({
      id: `db:${n.id}`,
      rowId: n.id,
      title: n.title,
      body: n.body ?? "",
      href: n.link ?? "/community",
      unread: !n.read_at,
    }));
    setDbNotices(list);
    return list;
  }, [user]);

  useEffect(() => {
    const deadlines = buildDeadlineNotices();
    setDeadlineNotices(deadlines);
    void (async () => {
      const fromDb = await loadDb();
      await ensureSystemPermission();
      pushSystemNotifications([...fromDb, ...deadlines]);
    })();
  }, [loadDb]);

  // Live updates: new replies, likes and other alerts arrive without a refresh.
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = payload.new as { id: string; title: string; body: string | null; link: string | null };
          const notice: Notice = {
            id: `db:${row.id}`,
            rowId: row.id,
            title: row.title,
            body: row.body ?? "",
            href: row.link ?? "/community",
            unread: true,
          };
          setDbNotices((prev) => [notice, ...prev].slice(0, 20));
          pushSystemNotifications([notice]);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const notices = [...dbNotices, ...deadlineNotices.map((n) => ({ ...n, unread: n.unread && !deadlinesRead }))];
  const unreadCount = notices.filter((n) => n.unread).length;

  const markAllRead = async () => {
    setDeadlinesRead(true);
    const unreadIds = dbNotices.filter((n) => n.unread && n.rowId).map((n) => n.rowId!);
    if (!unreadIds.length) return;
    setDbNotices((prev) => prev.map((n) => ({ ...n, unread: false })));
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", unreadIds);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((v) => {
            const next = !v;
            if (next) void markAllRead();
            return next;
          });
        }}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} new` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative grid place-items-center h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 h-4 min-w-4 px-0.5 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold"
          >
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl bg-card border border-border shadow-lg overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
              <span className="font-display font-semibold text-sm text-foreground">Notifications</span>
              {notices.length > 0 && (
                <span className="text-xs text-muted-foreground">{notices.length} recent</span>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto">
              {notices.length === 0 ? (
                <li className="px-4 py-6 text-sm text-muted-foreground text-center">
                  No notifications right now
                </li>
              ) : (
                notices.map((n) => (
                  <li key={n.id}>
                    <Link
                      to={n.href}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 hover:bg-secondary transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <div className="px-4 py-2 border-t border-border flex items-center justify-between">
              <Link
                to="/community"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline"
              >
                Go to community
              </Link>
              <Link
                to="/scholarships"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline"
              >
                All scholarships
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
