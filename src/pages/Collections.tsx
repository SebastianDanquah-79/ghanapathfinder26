import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Link } from "@/lib/router-compat";
import { Bookmark, FolderOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Collections=()=>{
 const {user}=useAuth();
 const q=useQuery({queryKey:["collections",user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await supabase.from("saved_items").select("id,item_type,item_key,title,subtitle,metadata,created_at").eq("user_id",user!.id).order("created_at",{ascending:false}).limit(200);if(error)throw error;return data??[];}});
 const groups=Object.entries((q.data??[]).reduce((a:any,x:any)=>{const k=x.item_type||"other";(a[k]??=[]).push(x);return a;},{}));
 return <div className="min-h-screen bg-background pt-20 pb-24"><Navbar/><main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><header className="mb-8"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Your library</p><h1 className="mt-2 text-3xl font-bold">Collections</h1><p className="mt-2 text-sm text-muted-foreground">Your saved universities, programmes, scholarships, opportunities and other items, grouped from the existing saved-items system.</p></header>{!user?<div className="rounded-xl border border-dashed border-border p-6 text-sm">Sign in to view your collections. <Link to="/auth" className="font-semibold text-primary">Sign in</Link></div>:<div className="space-y-6">{groups.map(([kind,items]:any)=><section key={kind}><div className="mb-3 flex items-center gap-2"><FolderOpen className="h-4 w-4 text-primary"/><h2 className="font-semibold capitalize">{kind}</h2><span className="text-xs text-muted-foreground">({items.length})</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{items.map((x:any)=><article key={x.id} className="rounded-xl border border-border bg-card p-4"><Bookmark className="h-4 w-4 text-primary"/><h3 className="mt-2 font-semibold text-sm">{x.title||x.item_key}</h3>{x.subtitle&&<p className="mt-1 text-xs text-muted-foreground">{x.subtitle}</p>}</article>)}</div></section>)}{!groups.length&&<div className="rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">Nothing saved yet. Save an item and it will appear here.</div>}</div>}</main></div>;
};
export default Collections;
