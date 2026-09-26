
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { ExternalLink, RefreshCw } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";

type Article={id:string;title:string;excerpt:string|null;original_url:string|null;country_code:string|null;category:string|null;published_at:string|null;source_name:string|null};

const categories=["All","Ghana","Business","Technology","Education","Science","Culture","Politics"];

export default function NewsHub({title="Africa Now",subtitle="Current Africa stories already available in GhanaPathFinder, with the original source preserved."}:{title?:string;subtitle?:string}){
  const [articles,setArticles]=useState<Article[]>([]);
  const [category,setCategory]=useState("All");
  const [ghanaOnly,setGhanaOnly]=useState(false);
  const [newCount,setNewCount]=useState(0);
  const [page,setPage]=useState(1);
  const pageSize=40;

  async function load(limit:number,replace=true){
    let query=supabase.from("news_articles").select("id,title,excerpt,original_url,country_code,category,published_at,source_name").order("published_at",{ascending:false}).range(0,limit-1);
    if(category!=="All") query=query.ilike("category",category);
    if(ghanaOnly) query=query.eq("country_code","GH");
    const {data,error}=await query;
    if(error) throw error;
    setArticles(function(current){return replace ? (data||[]) as Article[] : current.concat((data||[]) as Article[]);});
  }

  useEffect(function(){setPage(1);setNewCount(0);void load(pageSize,true);},[category,ghanaOnly]);
  useEffect(function(){
    const channel=supabase.channel("gpf-news-live").on("postgres_changes",{event:"INSERT",schema:"public",table:"news_articles"},function(payload){
      const item=payload.new as Article;
      setNewCount(function(count){return count+1;});
      setArticles(function(current){return [item].concat(current);});
    }).subscribe();
    return function(){void supabase.removeChannel(channel);};
  },[]);

  const featured=articles[0];
  const visible=useMemo(function(){return articles.slice(0,Math.min(articles.length,page*pageSize));},[articles,page]);

  return <div className="min-h-dvh bg-background pt-20 pb-24"><Navbar/><main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8"><Seo title={title+" | GhanaPathFinder"} description={subtitle} path="/news"/><header className="mb-7 border-b border-border pb-6"><p className="text-sm font-semibold text-primary">Africa news</p><h1 className="mt-2 text-3xl font-bold">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{subtitle}</p><div className="mt-5 flex flex-wrap gap-2">{categories.map(function(item){return <button key={item} type="button" onClick={function(){setCategory(item);}} className={"border px-3 py-1.5 text-xs " + (category===item ? "border-primary bg-primary text-primary-foreground" : "border-border")}>{item}</button>;})}<button type="button" onClick={function(){setGhanaOnly(function(value){return !value;});}} className={"border px-3 py-1.5 text-xs " + (ghanaOnly ? "border-primary bg-primary text-primary-foreground" : "border-border")}>Ghana focus</button></div>{newCount>0&&<button type="button" onClick={function(){setNewCount(0);window.scrollTo({top:0,behavior:"smooth"});}} className="mt-4 inline-flex items-center gap-2 border border-primary/40 bg-primary/[0.04] px-3 py-2 text-xs font-semibold text-primary">{newCount} new article{newCount===1?"":"s"}<RefreshCw className="h-3.5 w-3.5"/></button>}</header>

  {featured&&<article className="mb-5 border border-border bg-card p-5 sm:p-7"><p className="text-xs font-semibold text-primary">{featured.category||"Africa"} · {featured.source_name||"Source"}</p><h2 className="mt-2 text-2xl font-semibold leading-tight">{featured.title}</h2>{featured.excerpt&&<p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{featured.excerpt}</p>}{featured.original_url&&<a href={featured.original_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Read the original source <ExternalLink className="h-4 w-4"/></a>}</article>}

  <div className="grid gap-3 md:grid-cols-2">{visible.slice(1).map(function(x){return <article key={x.id} className="border border-border bg-card p-4"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold text-primary">{x.category||"Africa"}</span><span className="text-xs text-muted-foreground">{x.published_at?new Date(x.published_at).toLocaleDateString("en-GH"):""}</span></div><h2 className="mt-2 font-semibold">{x.title}</h2>{x.excerpt&&<p className="mt-2 text-sm text-muted-foreground line-clamp-3">{x.excerpt}</p>}<p className="mt-3 text-xs text-muted-foreground">{x.source_name||"Source"}{x.country_code?" · "+x.country_code:""}</p>{x.original_url&&<a href={x.original_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">Read source <ExternalLink className="h-3.5 w-3.5"/></a>}</article>;})}</div>

  {articles.length>=page*pageSize&&<div className="mt-6 flex justify-center"><button type="button" onClick={function(){const next=page+1;setPage(next);void load(next*pageSize,false);}} className="border border-border px-4 py-2 text-sm font-semibold">Load more</button></div>}
  {!articles.length&&<div className="border border-dashed border-border p-6 text-sm text-muted-foreground">No published news records match this view.</div>}
  </main></div>;
}
