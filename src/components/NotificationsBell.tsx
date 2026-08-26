import { useEffect, useRef, useState } from "react";
import { Bell } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications, requestNotificationPermission } from "@/hooks/useNotifications";

/** Live notification bell: shows GhanaPathFinder messages for the signed-in user. */
const NotificationsBell = ({ className = "h-9 w-9" }: { className?: string }) => {
  const { user } = useAuth();
  const { items, unread, markAllRead, remove } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        className={`relative grid place-items-center rounded-full text-muted-foreground hover:text-primary hover:bg-secondary transition-colors ${className}`}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 grid place-items-center rounded-full bg-primary text-primary-foreground text-[10px] font-semibold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[85vw] rounded-xl bg-card border border-border shadow-lg p-2 z-50">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void requestNotificationPermission()}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                Enable alerts
              </button>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAllRead.mutate()}
                  className="text-xs text-primary hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto mt-1">
            {items.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-2 px-2 py-2 rounded-lg ${
                    n.read_at ? "" : "bg-secondary/60"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {n.link ? (
                      <a href={n.link} className="text-sm font-medium text-foreground hover:text-primary">
                        {n.title}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                    )}
                    {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Dismiss notification"
                    onClick={() => remove.mutate(n.id)}
                    className="text-xs text-muted-foreground hover:text-primary px-1"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsBell;
