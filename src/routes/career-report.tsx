import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Link } from "@/lib/router-compat";
import { nanoid } from "nanoid";
import { toast } from "sonner";
import { Copy, Share2 } from "lucide-react";

export const Route = createFileRoute("/career-report")({ ssr: false, component: CareerReport });

function CareerReport(){
 const {user}=useAuth(); const [busy,setBusy]=useState(false); const [shareUrl,setShareUrl]=useState("");
 const {data:profile}=useQuery({queryKey:["report-profile",user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await supabase.from("profiles").select("full_name,target_career,interests,education_level,university,program,country_code").eq("id",user!.id).maybeSingle();if(error)throw error;return data;}});
 const {data:goals=[]}=useQuery({queryKey:["report-goals",user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await supabase.from("path_goals").select("title,progress,status").eq("user_id",user!.id).order("created_at",{ascending:false}).limit(5);if(error)throw error;return data??[];}});
 const create=async()=>{if(!user||!profile)return;setBusy(true);const slug=nanoid(10);const payload={profile,goals,generated_at:new Date().toISOString()};const {error}=await supabase.from("shareable_reports").insert({user_id:user.id,slug,report_type:"career",title:`${profile.full_name||"My"} Career Report`,payload,is_public:true});setBusy(false);if(error){toast.error(error.message);return;}const url=`${window.location.origin}/career-report/${slug}`;setShareUrl(url);toast.success("Shareable report created.");};
 return <div className="min-h-screen bg-background pt-20 pb-24"><Navbar/><main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"><section className="rounded-2xl border border-border bg-card p-6 sm:p-8"><p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Shareable Career Report</p><h1 className="mt-2 text-3xl font-bold">Turn your path into something you can share.</h1><p className="mt-2 text-muted-foreground">Create a public snapshot of your current education, career goal and path progress. Only information in this report is shared.</p><div className="mt-6 rounded-xl border border-border/70 p-4"><p className="text-sm font-semibold">{profile?.full_name||"Your name"}</p><p className="mt-1 text-sm text-muted-foreground">{profile?.target_career||"No target career yet"}</p><p className="mt-3 text-xs text-muted-foreground">{goals.length} active/recent goals</p></div><button onClick={()=>void create()} disabled={busy||!user} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Share2 className="h-4 w-4"/>{busy?"Creating...":"Create shareable report"}</button>{shareUrl&&<div className="mt-5 flex gap-2"><input readOnly value={shareUrl} className="min-h-11 flex-1 rounded-xl border border-border bg-background px-3 text-sm"/><button onClick={()=>void navigator.clipboard.writeText(shareUrl)} className="grid h-11 w-11 place-items-center rounded-xl border border-border" aria-label="Copy report link"><Copy className="h-4 w-4"/></button></div>}</section></main></div>
}
export default CareerReport;