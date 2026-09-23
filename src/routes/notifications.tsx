import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/notifications")({ component: Notifications });

function Notifications() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("id,title,body,action_url,is_read,created_at,type")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <div className="min-h-dvh bg-background">
      <Navbar />
      <main className="px-4 pb-14 pt-20 sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Updates</p>
          <h1 className="mt-2 text-3xl font-bold">Notifications</h1>
          {!user ? (
            <div className="mt-8 rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">Sign in to view your notifications.</div>
          ) : (
            <div className="mt-8 space-y-3">
              {query.isLoading && Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-secondary" />)}
              {query.data?.map((n) => (
                <article key={n.id} className={"rounded-xl border border-border p-4 " + (n.is_read ? "bg-card" : "bg-primary/5")}>
                  <h2 className="font-semibold">{n.title}</h2>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                  {n.action_url && <a href={n.action_url} className="mt-2 inline-block text-sm text-primary">Open</a>}
                  <p className="mt-2 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("en-GB")}</p>
                </article>
              ))}
              {!query.isLoading && !query.data?.length && <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No notifications yet.</div>}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
