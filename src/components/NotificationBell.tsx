import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "@/lib/icons";
import { Link } from "@/lib/router-compat";
import { scholarships } from "@/data/scholarships";
import { toast } from "sonner";

interface Notice {
  id: string;
  title: string;
  body: string;
  href: string;
}

const daysUntil = (date: string) => {
  const diff = new Date(date).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
};

const buildNotices = (): Notice[] =>
  scholarships
    .filter((s) => {
      const d = daysUntil(s.deadline);
      return d >= 0 && d <= 60;
    })
    .sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline))
    .slice(0, 6)
    .map((s) => {
      const d = daysUntil(s.deadline);
      return {
        id: s.name,
        title: s.name,
        body: d === 0 ? "Deadline is today" : `Deadline in ${d} day${d === 1 ? "" : "s"}`,
        href: "/scholarships",
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
  const fresh = notices.filter((n) => !seen.includes(n.id)).slice(0, 2);
  fresh.forEach((n) => {
    try {
      new Notification(n.title, { body: n.body, icon: "/app-icon-192.png" });
      seen.push(n.id);
    } catch {
      /* ignore */
    }
  });
  if (fresh.length) localStorage.setItem(seenKey, JSON.stringify(seen.slice(-50)));
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [read, setRead] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = buildNotices();
    setNotices(list);
    ensureSystemPermission().then(() => pushSystemNotifications(list));
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          setRead(true);
        }}
        aria-label={`Notifications${notices.length && !read ? `, ${notices.length} new` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        className="relative grid place-items-center h-9 w-9 rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
      >
        <Bell className="h-[18px] w-[18px]" />
        {notices.length > 0 && !read && (
          <span
            aria-hidden="true"
            className="absolute top-1 right-1 h-4 min-w-4 px-0.5 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold"
          >
            {notices.length}
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
                <span className="text-xs text-muted-foreground">{notices.length} upcoming</span>
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
            <div className="px-4 py-2 border-t border-border">
              <Link
                to="/scholarships"
                onClick={() => setOpen(false)}
                className="text-xs text-primary hover:underline"
              >
                View all scholarships
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
