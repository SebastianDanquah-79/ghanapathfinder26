import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface AppNotification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  category: string;
  read_at: string | null;
  created_at: string;
}

const showBrowserNotification = (n: AppNotification) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification("GhanaPathFinder", { body: n.title, icon: "/app-icon-192.png" });
  } catch {
    /* ignore */
  }
};

/** Live notifications from GhanaPathFinder for the signed-in user. */
export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const key = ["notifications", user?.id];

  const query = useQuery({
    queryKey: key,
    enabled: !!user,
    queryFn: async (): Promise<AppNotification[]> => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id, title, body, link, category, read_at, created_at")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as AppNotification[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
          if (payload.eventType === "INSERT") {
            const n = payload.new as AppNotification;
            toast.message(n.title, { description: n.body ?? undefined });
            showBrowserNotification(n);
          }
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const markAllRead = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .is("read_at", null);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const items = query.data ?? [];
  return {
    items,
    unread: items.filter((n) => !n.read_at).length,
    isLoading: query.isLoading,
    markAllRead,
    remove,
  };
};

export const requestNotificationPermission = async () => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    toast.error("Your browser does not support notifications.");
    return;
  }
  const result = await Notification.requestPermission();
  if (result === "granted") toast.success("Notifications from GhanaPathFinder are on.");
  else toast.message("Notifications stay off. You'll still see them in the bell menu.");
};
