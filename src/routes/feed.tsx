import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Plus, Share2, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Post={id:string;author_id:string;title:string|null;description:string|null;video_url:string|null;youtube_url:string|null;thumbnail_url:string|null;tags:string[];category:string;likes_count:number;comments_count:number;shares_count:number;views_count:number;created_at:string};

export const Route=createFileRoute("/feed")({component:Feed});

const youtubeId=(url:string)=>{
  try{const u=new URL(url); if(u.hostname.includes("youtu.be")) return u.pathname.slice(1); if(u.hostname.includes("youtube.com")) return u.searchParams.get("v")||u.pathname.split("/").pop()||null;}catch{} return null;
};

function Feed(){
  const {user}=useAuth();
  const qc=useQueryClient();
  const [category,setCategory]=useState("For You");
  const [showCreate,setShowCreate]=useState(false);
  const [youtube,setYoutube]=useState("");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [tags,setTags]=useState("");
  const [uploading,setUploading]=useState(false);
  const categories=["For You","Tech","Education","Startup","Science","Culture","Ghana"];
  const q=useQuery({queryKey:["feed-posts",category],queryFn:async()=>{
    let request=supabase.from("feed_posts").select("id,author_id,title,description,video_url,youtube_url,thumbnail_url,tags,category,likes_count,comments_count,shares_count,views_count,created_at").eq("is_published",true).order("likes_count",{ascending:false}).order("created_at",{ascending:false}).limit(30);
    if(category!=="For You") request=request.eq("category",category.toLowerCase());
    const {data,error}=await request; if(error) throw error; return (data??[]) as Post[];
  }});
  const posts=q.data??[];
  const createYoutube=async()=>{
    if(!user){toast.error("Sign in to post.");return;}
    const id=youtubeId(youtube); if(!id){toast.error("Enter a valid YouTube URL.");return;}
    setUploading(true);
    const {error}=await supabase.from("feed_posts").insert({author_id:user.id,title:title.trim()||"Innovation video",description:description.trim()||null,youtube_url:youtube.trim(),thumbnail_url:"https://img.youtube.com/vi/"+id+"/hqdefault.jpg",tags:tags.split(",").map(x=>x.trim()).filter(Boolean),category:"general",is_published:true});
    setUploading(false); if(error){toast.error(error.message);return;}
    toast.success("Video published");setShowCreate(false);setYoutube("");setTitle("");setDescription("");setTags("");await qc.invalidateQueries({queryKey:["feed-posts"]});
  };
  const like=async(postId:string)=>{if(!user){toast.error("Sign in to like posts.");return;}const {error}=await supabase.rpc("toggle_feed_like",{p_post_id:postId});if(error)toast.error(error.message);else await qc.invalidateQueries({queryKey:["feed-posts"]});};
  const share=async(post:Post)=>{const url=window.location.origin+"/feed#"+post.id;if(navigator.share) await navigator.share({title:post.title??"GhanaPathFinder Feed",url}).catch(()=>undefined); else await navigator.clipboard?.writeText(url);};
  const sentinel=useRef<HTMLDivElement>(null);
  useEffect(()=>{const el=sentinel.current;if(!el)return;const observer=new IntersectionObserver(entries=>{if(entries[0]?.isIntersecting&&posts.length)void q.refetch();},{rootMargin:"400px"});observer.observe(el);return()=>observer.disconnect()},[posts.length,q]);
  const ordered=useMemo(()=>posts,[posts]);

  return <div className="min-h-dvh bg-[#08090d] text-white"><Navbar/><main className="pt-16 pb-20"><div className="sticky top-16 z-30 border-b border-white/10 bg-[#08090d]/95 px-4 py-3 backdrop-blur"><div className="mx-auto flex max-w-4xl items-center gap-2 overflow-x-auto">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={"shrink-0 rounded-full px-3 py-1.5 text-xs font-medium "+(category===c?"bg-[#FCD116] text-[#08090d]":"bg-white/5 text-white/65")}>{c}</button>)}{user&&<button onClick={()=>setShowCreate(true)} className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs"><Plus className="h-3.5 w-3.5"/> Post</button>}</div></div>
    <div className="mx-auto max-w-4xl">{q.isLoading?Array.from({length:4}).map((_,i)=><div key={i} className="my-4 h-[75dvh] animate-pulse rounded-2xl bg-white/5"/>):ordered.map(post=><FeedCard key={post.id} post={post} onLike={like} onShare={share}/>)}</div><div ref={sentinel} className="h-8"/>
    {!q.isLoading&&!posts.length&&<div className="mx-4 my-10 rounded-xl border border-white/10 p-10 text-center text-sm text-white/60">No verified innovation videos are published yet. Be the first to share a real project or talk.</div>}
  </main>
  {showCreate&&<div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4"><section className="w-full max-w-lg rounded-2xl border border-border bg-background p-5 text-foreground"><div className="flex items-center justify-between"><h2 className="font-semibold">Share an innovation video</h2><button onClick={()=>setShowCreate(false)} aria-label="Close"><X className="h-5 w-5"/></button></div><div className="mt-4 space-y-3"><input className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5" placeholder="YouTube URL" value={youtube} onChange={e=>setYoutube(e.target.value)}/><input className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)}/><textarea className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)}/><input className="w-full rounded-lg border border-border bg-secondary px-3 py-2.5" placeholder="Tags, comma separated" value={tags} onChange={e=>setTags(e.target.value)}/><button onClick={createYoutube} disabled={uploading} className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">{uploading?"Publishing...":"Publish video"}</button></div></section></div>}
  </div>;
}

function FeedCard({post,onLike,onShare}:{post:Post;onLike:(id:string)=>void;onShare:(post:Post)=>void}){
  const id=youtubeId(post.youtube_url??"");
  return <article id={post.id} className="relative my-4 flex min-h-[calc(100dvh-7rem)] snap-start flex-col justify-end overflow-hidden rounded-2xl border border-white/10 bg-black">
    {post.video_url?<video className="absolute inset-0 h-full w-full object-cover" controls playsInline muted loop src={post.video_url}/>:id?<iframe title={post.title??"Innovation video"} className="absolute inset-0 h-full w-full" src={"https://www.youtube.com/embed/"+id+"?autoplay=0&mute=1&rel=0"} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>:<>{post.thumbnail_url&&<img src={post.thumbnail_url} alt="" className="absolute inset-0 h-full w-full object-cover"/>}</>}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent pointer-events-none"/>
    <div className="relative z-10 flex items-end justify-between gap-4 p-5 sm:p-7"><div className="max-w-[75%]"><p className="text-xs font-semibold uppercase tracking-wider text-[#FCD116]">{post.category}</p><h2 className="mt-2 text-xl font-bold sm:text-2xl">{post.title}</h2>{post.description&&<p className="mt-2 line-clamp-3 text-sm text-white/75">{post.description}</p>}<div className="mt-3 flex flex-wrap gap-2">{post.tags.slice(0,6).map(tag=><span key={tag} className="rounded-full bg-white/10 px-2 py-1 text-[11px]">#{tag}</span>)}</div></div><div className="flex shrink-0 flex-col items-center gap-3"><button onClick={()=>onLike(post.id)} className="grid h-11 w-11 place-items-center rounded-full bg-black/50" aria-label="Like post"><Heart className="h-5 w-5"/></button><span className="text-xs">{post.likes_count}</span><button onClick={()=>onShare(post)} className="grid h-11 w-11 place-items-center rounded-full bg-black/50" aria-label="Share post"><Share2 className="h-5 w-5"/></button><span className="text-xs">{post.shares_count}</span><a href="#comments" className="grid h-11 w-11 place-items-center rounded-full bg-black/50" aria-label="Comments"><MessageCircle className="h-5 w-5"/></a><span className="text-xs">{post.comments_count}</span></div></div>
  </article>;
}
