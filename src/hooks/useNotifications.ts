import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Notification = {
  id: string;
  title: string;
  body: string | null;
  action_url: string | null;
  is_read: boolean;
  created_at: string;
  type: string;
};

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnread(0);
      return;
    }
    const { data, error } = await supabase
      .from("notifications")
      .select("id,title,body,action_url,is_read,created_at,type")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return;
    const rows = (data ?? []) as Notification[];
    setNotifications(rows);
    setUnread(rows.filter((n) => !n.is_read).length);
  }, [user]);

  useEffect(() => {
    void refresh();
    if (!user) return;

    const channel = supabase
      .channel("notifications:" + user.id)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: "user_id=eq." + user.id },
        (payload) => {
          const next = payload.new as Notification;
          setNotifications((current) => [next, ...current].slice(0, 50));
          setUnread((current) => current + (next.is_read ? 0 : 1));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refresh, user]);

  const markAllRead = useCallback(async () => {
    if (!user) return;
    const { error } = await supabase.from("notifications").update({ is_read: true, read: true }).eq("user_id", user.id);
    if (error) return;
    setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    setUnread(0);
  }, [user]);

  return { notifications, unread, markAllRead, refresh };
}
