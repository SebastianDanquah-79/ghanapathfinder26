import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { Globe2, Bookmark, Users, Compass } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const MyAfrica = () => {
  const { user } = useAuth();
  const { data: prefs } = useQuery({ queryKey: ["user_preferences", user?.id], enabled: !!user, queryFn: async () => { const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user!.id).maybeSingle(); if (error) throw error; return data; } });
  const { data: follows = [] } = useQuery({ queryKey: ["user_follows", user?.id], enabled: !!user, queryFn: async () => { const { data, error } = await supabase.from("user_follows").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }); if (error) throw error; return data ?? []; } });
  const { data: saved = [] } = useQuery({ queryKey: ["my-africa-saved", user?.id], enabled: !!user, queryFn: async () => { const { data, error } = await supabase.from("saved_items").select("id,item_type,item_key,title,subtitle,created_at").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(100); if (error) throw error; return data ?? []; } });

  if (!user) return <div className="min-h-screen bg-background pt-24 px-4"><Navbar /><main className="mx-auto max-w-xl text-center"><h1 className="text-3xl font-bold">My Africa</h1><p className="mt-2 text-sm text-muted-foreground">Sign in to build a personal map of the countries, topics and opportunities you follow.</p><Link to="/auth" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Sign in</Link></main></div>;

  return <div className="min-h-screen bg-background pt-20 pb-24"><Navbar /><main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <header className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Personal discovery</p><h1 className="mt-2 text-3xl font-bold">My Africa</h1><p className="mt-2 text-sm text-muted-foreground">Your explicit interests, follows and saved items. This is a personal discovery profile, not an official identity document.</p></header>
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-xl border border-border bg-card p-5"><Globe2 className="h-5 w-5 text-primary" /><h2 className="mt-3 font-semibold">Interests</h2><div className="mt-3 flex flex-wrap gap-2">{(prefs?.interests ?? []).map((x: string) => <span key={x} className="rounded-full bg-secondary px-3 py-1.5 text-xs">{x}</span>)}{!prefs?.interests?.length && <p className="text-sm text-muted-foreground">No interests selected yet.</p>}</div></section>
      <section className="rounded-xl border border-border bg-card p-5"><Users className="h-5 w-5 text-primary" /><h2 className="mt-3 font-semibold">Following</h2><div className="mt-3 space-y-2">{follows.slice(0, 10).map(x => <div key={x.id} className="rounded-lg bg-secondary/50 p-3 text-sm"><span className="font-medium">{x.entity_type}</span><span className="text-muted-foreground"> · {x.entity_key}</span></div>)}{!follows.length && <p className="text-sm text-muted-foreground">Nothing followed yet.</p>}</div></section>
      <section className="rounded-xl border border-border bg-card p-5"><Bookmark className="h-5 w-5 text-primary" /><h2 className="mt-3 font-semibold">Saved</h2><div className="mt-3 space-y-2">{saved.slice(0, 10).map(x => <div key={x.id} className="rounded-lg bg-secondary/50 p-3 text-sm"><p className="font-medium">{x.title}</p><p className="text-xs text-muted-foreground">{x.item_type}</p></div>)}{!saved.length && <p className="text-sm text-muted-foreground">Nothing saved yet.</p>}</div></section>
    </div>
    <div className="mt-5 flex flex-wrap gap-2"><Link to="/preferences" className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium">Edit preferences</Link><Link to="/for-you" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"><Compass className="mr-2 inline h-4 w-4" />Continue discovering</Link></div>
  </main></div>;
};
export default MyAfrica;
