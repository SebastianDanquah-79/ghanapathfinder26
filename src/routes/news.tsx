import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const categories=["all","tech","startup","business","politics","education","health","entertainment"] as const;
const categoryFilters: Record<(typeof categories)[number], { exact?: string[]; terms?: string[] }> = {
  all: {},
  tech: { exact: ["Technology"], terms: ["technology","AI","artificial intelligence","software","robotics","cybersecurity","semiconductor"] },
  startup: { exact: ["Startups"], terms: ["startup","funding","founder","venture capital","accelerator"] },
  business: { exact: ["Business","Business and Politics","Africa Business"], terms: ["business","economy","finance","investment","market"] },
  politics: { exact: ["Public Affairs","Business and Politics"], terms: ["government","president","parliament","election","policy","politics"] },
  education: { terms: ["education","university","school","scholarship","student","research"] },
  health: { exact: ["Health"], terms: ["health","medical","hospital","disease","healthcare"] },
  entertainment: { terms: ["music","film","culture","fashion","entertainment","artist"] },
};

export const Route=createFileRoute("/news")({component:News});

function News() {
  const [category,setCategory]=useState<(typeof categories)[number]>("all");
  const [ghanaOnly,setGhanaOnly]=useState(false);
  const [newCount,setNewCount]=useState(0);

  const query=useInfiniteQuery({
    queryKey:["news",category,ghanaOnly],
    initialPageParam:0,
    queryFn:async({pageParam})=>{
      let request=supabase.from("news_articles").select("id,title,excerpt,original_url,image_url,category,country_code,published_at,source_id").gte("published_at",new Date(Date.now() - 90*24*60*60*1000).toISOString()).order("published_at",{ascending:false}).range(pageParam,pageParam+19);
      const filter=categoryFilters[category];
      if(filter?.exact?.length) request=request.in("category",filter.exact);
      else if(filter?.terms?.length) {
        const or=filter.terms.flatMap(term=>[
          `title.ilike.%${term}%`,
          `excerpt.ilike.%${term}%`,
        ]).join(",");
        request=request.or(or);
      }
      if(ghanaOnly) request=request.eq("country_code","GH");
      const {data,error}=await request;
      if(error) throw error;
      return data??[];
    },
    getNextPageParam:(last,allPages)=>last.length===20?allPages.length*20:undefined,
    staleTime:120000,
  });

  useEffect(()=>{
    const channel=supabase.channel("news-live").on("postgres_changes",{event:"INSERT",schema:"public",table:"news_articles"},()=>setNewCount(x=>x+1)).subscribe();
    return()=>{void supabase.removeChannel(channel)};
  },[]);

  const articles=useMemo(()=>query.data?.pages.flat()??[],[query.data]);

  const share=async(url:string,title:string)=>{
    if(navigator.share) await navigator.share({title,url}).catch(()=>undefined);
    else await navigator.clipboard?.writeText(url);
  };

  return <div className="min-h-dvh bg-background"><Navbar/><main className="px-4 pb-14 pt-20 sm:px-8"><div className="mx-auto max-w-7xl">
    <p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">Global news · Verified recent coverage</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">News happening around Africa and the world</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Every article remains linked to its original publisher. GhanaPathFinder links to the original publisher and does not republish third-party reporting.</p>
    <div className="mt-6 flex gap-2 overflow-x-auto pb-1">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={"shrink-0 rounded-full border px-3 py-2 text-xs font-medium capitalize "+(category===c?"border-primary bg-primary/10 text-primary":"border-border text-muted-foreground")}>{c}</button>)}</div>
    <label className="mt-4 inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={ghanaOnly} onChange={e=>setGhanaOnly(e.target.checked)}/> Ghana Focus</label>
    {newCount>0&&<button onClick={()=>{setNewCount(0);void query.refetch()}} className="ml-4 mt-4 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">{newCount} new article{newCount===1?"":"s"} · refresh</button>}
    {query.isError&&<div className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm">News could not be loaded. Try again.</div>}
    <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{query.isLoading?Array.from({length:9}).map((_,i)=><div key={i} className="h-72 animate-pulse rounded-xl bg-secondary"/>):articles.map((a,index)=><article key={a.id} className={"overflow-hidden rounded-xl border border-border bg-card "+(index===0?"md:col-span-2 lg:col-span-3":"")}>{a.image_url&&<img src={a.image_url} alt="" loading={index===0?"eager":"lazy"} className={index===0?"h-64 w-full object-cover sm:h-80":"h-44 w-full object-cover"}/>}<div className="p-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wide text-primary">{a.category||"Africa"}</p><button onClick={()=>void share(a.original_url,a.title)} className="text-xs text-muted-foreground hover:text-foreground" aria-label={"Share "+a.title}>Share</button></div><h2 className={index===0?"mt-2 text-2xl font-bold":"mt-2 font-semibold leading-6"}>{a.title}</h2>{a.excerpt&&<p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">{a.excerpt}</p>}<div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted-foreground"><span>{a.country_code||"Africa"} · {a.published_at?new Date(a.published_at).toLocaleDateString("en-GB"):"Recently"}</span><a href={a.original_url} target="_blank" rel="noreferrer" className="text-primary hover:underline">Read source</a></div></div></article>)}</div>
    {!query.isLoading&&!articles.length&&<div className="mt-8 rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No verified news is currently available for this filter. Try another topic or country.</div>}
    {query.hasNextPage&&<button onClick={()=>void query.fetchNextPage()} disabled={query.isFetchingNextPage} className="mx-auto mt-8 block rounded-lg border border-border px-5 py-2.5 text-sm font-medium">{query.isFetchingNextPage?"Loading...":"Load more"}</button>}
  </div></main><Footer/></div>;
}
