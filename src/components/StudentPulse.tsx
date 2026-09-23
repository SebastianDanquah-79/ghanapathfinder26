import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const learning = [
  ["Khan Academy","https://www.khanacademy.org/","Free learning across maths, computing and more."],
  ["MIT OpenCourseWare","https://ocw.mit.edu/","University-level course materials from MIT."],
  ["ALX","https://www.alxafrica.com/","Career-focused technology and professional learning."],
  ["edX","https://www.edx.org/","University and professional courses from global institutions."],
];

export default function StudentPulse(){
  const {user}=useAuth();
  const profile=useQuery({queryKey:["student-pulse-profile",user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await supabase.from("profiles").select("full_name,interests,target_career,program").eq("id",user!.id).maybeSingle();if(error)throw error;return data;}});
  const deadlines=useQuery({queryKey:["student-pulse-deadlines",user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await supabase.from("deadlines").select("id,title,due_date").gte("due_date",new Date().toISOString()).order("due_date").limit(3);if(error)throw error;return data??[];}});
  const news=useQuery({queryKey:["student-pulse-news"],queryFn:async()=>{const {data,error}=await supabase.from("news_articles").select("id,title,original_url,category").in("category",["education","tech"]).order("published_at",{ascending:false}).limit(5);if(error)throw error;return data??[];},staleTime:300000});
  const feed=useQuery({queryKey:["student-pulse-feed"],queryFn:async()=>{const {data,error}=await supabase.from("feed_posts").select("id,title,category,thumbnail_url,youtube_url").eq("is_published",true).order("created_at",{ascending:false}).limit(3);if(error)throw error;return data??[];},staleTime:300000});
  if(!user)return null;
  return <section className="border-b border-border bg-secondary/30 px-4 py-6 sm:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Your Pathfinder</p><h2 className="mt-1 text-2xl font-bold">Good morning{profile.data?.full_name?", "+profile.data.full_name.split(" ")[0]:""}. Here's what's new for you.</h2><p className="mt-1 text-sm text-muted-foreground">{profile.data?.target_career||profile.data?.program||"Complete your profile to improve your matches."}</p></div><Link to="/profile" className="text-sm font-medium text-primary">Edit profile</Link></div>
    <div className="mt-5 grid gap-4 lg:grid-cols-3"><section className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Deadlines</h3><Link to="/applications" className="text-xs text-primary">View all</Link></div><div className="mt-3 space-y-2">{deadlines.data?.map(d=><div key={d.id} className="rounded-lg bg-secondary/60 p-3"><p className="text-sm font-medium">{d.title}</p><p className="text-xs text-muted-foreground">{new Date(d.due_date).toLocaleDateString("en-GB")}</p></div>)}{!deadlines.data?.length&&<p className="text-sm text-muted-foreground">No upcoming deadlines recorded.</p>}</div></section>
    <section className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Learning Hub</h3><Link to="/skills" className="text-xs text-primary">Skills</Link></div><div className="mt-3 space-y-2">{learning.map(([name,url,text])=><a key={name} href={url} target="_blank" rel="noreferrer" className="block rounded-lg bg-secondary/60 p-3 hover:bg-secondary"><p className="text-sm font-medium">{name}</p><p className="text-xs text-muted-foreground">{text}</p></a>)}</div></section>
    <div className="space-y-4"><section className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Latest education & tech</h3><Link to="/news" className="text-xs text-primary">News</Link></div><div className="mt-3 space-y-2">{news.data?.map(a=><a key={a.id} href={a.original_url} target="_blank" rel="noreferrer" className="block text-sm hover:text-primary">{a.title}</a>)}{!news.data?.length&&<p className="text-sm text-muted-foreground">No verified articles yet.</p>}</div></section><section className="rounded-xl border border-border bg-card p-4"><div className="flex items-center justify-between"><h3 className="font-semibold">Innovation videos</h3><Link to="/feed" className="text-xs text-primary">Watch more</Link></div><div className="mt-3 space-y-2">{feed.data?.map(v=><Link key={v.id} to="/feed" className="block rounded-lg bg-secondary/60 p-3 text-sm font-medium">{v.title||"African innovation"}</Link>)}{!feed.data?.length&&<p className="text-sm text-muted-foreground">No verified videos yet.</p>}</div></section></div></div>
  </div></section>;
}
