import { createFileRoute } from "@tanstack/react-router";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/hooks/useAuth";

export const Route=createFileRoute("/notifications")({component:Notifications});

function Notifications(){
  const {user}=useAuth();
  const {notifications,unread,markAllRead}=useNotifications();
  return <div className="min-h-dvh bg-background"><Navbar/><main className="px-4 pb-14 pt-20 sm:px-8"><div className="mx-auto max-w-3xl">
    <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Updates</p><h1 className="mt-2 text-3xl font-bold">Notifications</h1><p className="mt-2 text-sm text-muted-foreground">{unread} unread</p></div>{user&&unread>0&&<button onClick={()=>void markAllRead()} className="rounded-lg border border-border px-3 py-2 text-xs font-medium">Mark all read</button>}</div>
    {!user?<div className="mt-8 rounded-xl border border-border p-8 text-center text-sm text-muted-foreground">Sign in to view your notifications.</div>:<div className="mt-8 space-y-2">{notifications.map(n=><article key={n.id} className={"rounded-xl border border-border p-4 "+(n.is_read?"bg-card":"bg-primary/5")}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{n.title}</h2>{n.body&&<p className="mt-1 text-sm leading-6 text-muted-foreground">{n.body}</p>}</div>{!n.is_read&&<span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" aria-label="Unread"/>}</div>{n.action_url&&<a href={n.action_url} className="mt-3 inline-block text-sm text-primary">Open</a>}<p className="mt-2 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("en-GB")}</p></article>)}{!notifications.length&&<div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No notifications yet. New matches, recommendations and feed activity will appear here.</div>}</div>}
  </div></main><Footer/></div>;
}
