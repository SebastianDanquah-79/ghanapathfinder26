
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { CheckCheck, Loader2 } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Notification={id:string;title:string|null;body:string|null;message:string;read:boolean;is_read:boolean|null;created_at:string;link:string|null;action_url:string|null};

export default function Notifications(){
  const {user,loading}=useAuth();
  const [items,setItems]=useState<Notification[]>([]);
  useEffect(function(){
    if(!user) return;
    let active=true;
    async function load(){const r=await supabase.from("notifications").select("id,title,body,message,read,is_read,created_at,link,action_url").eq("user_id",user.id).order("created_at",{ascending:false}).limit(50);if(active&&r.data)setItems(r.data as Notification[]);}
    void load();
    const channel=supabase.channel("gpf-notifications-" + user.id).on("postgres_changes",{event:"INSERT",schema:"public",table:"notifications",filter:"user_id=eq." + user.id},function(payload){setItems(function(current){return [payload.new as Notification].concat(current).slice(0,50);});}).subscribe();
    return function(){active=false;void supabase.removeChannel(channel);};
  },[user]);
  if(loading) return <div className="min-h-dvh grid place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary"/></div>;
  if(!user) return null;
  async function markAll(){const unread=items.filter(function(x){return !(x.is_read ?? x.read);}).map(function(x){return x.id;});if(!unread.length)return;await supabase.from("notifications").update({is_read:true,read:true,read_at:new Date().toISOString()}).eq("user_id",user.id).in("id",unread);setItems(function(current){return current.map(function(x){return {...x,is_read:true,read:true};});});}
  return <div className="min-h-dvh bg-background"><Navbar/><main className="mx-auto max-w-3xl px-4 pb-24 pt-20 sm:px-6"><Seo title="Notifications | GhanaPathFinder" description="Your GhanaPathFinder notifications." path="/notifications"/><div className="flex items-center justify-between gap-3 border-b border-border pb-5"><div><p className="text-sm font-semibold text-primary">Inbox</p><h1 className="mt-1 text-3xl font-bold">Notifications</h1></div><button type="button" onClick={function(){void markAll();}} className="inline-flex items-center gap-2 border border-border px-3 py-2 text-xs font-semibold"><CheckCheck className="h-4 w-4"/>Mark all read</button></div><div className="mt-5 space-y-2">{items.map(function(item){const unread=!(item.is_read ?? item.read);return <a key={item.id} href={item.link||item.action_url||"#"} className={"block border border-border bg-card p-4 " + (unread ? "border-primary/40 bg-primary/[0.03]" : "")}><div className="flex justify-between gap-4"><div><p className="font-semibold">{item.title||item.message}</p>{item.body&&<p className="mt-1 text-sm text-muted-foreground">{item.body}</p>}</div><time className="shrink-0 text-[11px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString("en-GH")}</time></div></a>;})}{!items.length&&<div className="border border-dashed border-border p-6 text-sm text-muted-foreground">You are all caught up.</div>}</div></main></div>
}
