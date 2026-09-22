import { createFileRoute } from "@tanstack/react-router";

const newsQueries: Record<string,string> = {
 Tech:"technology AI software semiconductors",
 Startup:"startup funding entrepreneurship",
 Business:"business economy companies",
 Politics:"politics government",
 Education:"education universities schools",
 Health:"health medicine healthcare",
 Entertainment:"entertainment culture",
};
const innovationQueries: Record<string,string> = {
 AI:"artificial intelligence AI models agents",
 Robotics:"robotics robots automation",
 Semiconductors:"semiconductors chips silicon",
 Climate:"climate technology clean energy",
 HealthTech:"health technology digital health",
 FinTech:"fintech payments financial technology",
 Mobility:"electric mobility transportation",
 Space:"space technology satellites",
 "Deep Tech":"deep technology research",
 "African Startups":"African startups technology funding",
};
function decode(s:string){return s.replace(/&amp;/g,"&").replace(/&quot;/g,'\"').replace(/&#39;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">");}
function parse(xml:string,category:string){return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(m=>{const b=m[1];const tag=(n:string)=>{const x=b.match(new RegExp("<"+n+">([\\s\\S]*?)</"+n+">"));return x?decode(x[1].replace(/<!\[CDATA\[|\]\]>/g,"").trim()):""};return {category,title:tag("title"),url:tag("link"),publishedAt:tag("pubDate"),source:tag("source")||"Google News"};}).filter(x=>x.title&&x.url);}
export const Route=createFileRoute("/api/news-feed")({server:{handlers:{GET:async({request})=>{const type=new URL(request.url).searchParams.get("type")==="innovation"?"innovation":"news";const queries=type==="innovation"?innovationQueries:newsQueries;const items:any[]=[];for(const [category,q] of Object.entries(queries)){try{const url="https://news.google.com/rss/search?q="+encodeURIComponent(q)+"&hl=en-US&gl=US&ceid=US:en";const res=await fetch(url,{headers:{accept:"application/rss+xml,application/xml,text/xml"}});if(!res.ok)continue;const xml=await res.text();items.push(...parse(xml,category).slice(0,20));}catch{}}return Response.json({items});}}}});