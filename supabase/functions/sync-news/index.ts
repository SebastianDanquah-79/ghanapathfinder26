import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const supabase=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const QUERIES=[["Ghana technology","tech","GH"],["Africa startup funding","startup","AF"],["African technology innovation","tech","AF"],["Ghana business economy","business","GH"],["West Africa politics","politics","AF"],["Africa education universities","education","AF"],["African health medical","health","AF"],["Africa sports","sports","AF"]];
Deno.serve(async()=>{
 const key=Deno.env.get("NEWS_API_KEY");
 if(!key)return new Response(JSON.stringify({error:"NEWS_API_KEY is not configured"}),{status:503,headers:{"content-type":"application/json"}});
 const articles:Record<string,unknown>[]=[];
 for(const [q,category,country] of QUERIES){
  const res=await fetch("https://newsapi.org/v2/everything?q="+encodeURIComponent(q)+"&language=en&sortBy=publishedAt&pageSize=20&apiKey="+encodeURIComponent(key));
  if(!res.ok)continue; const data=await res.json();
  for(const a of data.articles??[]) if(a.url&&a.title&&a.title!=="[Removed]") articles.push({title:a.title,excerpt:a.description??null,image_url:a.urlToImage??null,source_name:a.source?.name??"Unknown source",original_url:a.url,category,country_code:country,published_at:a.publishedAt??null,fetched_at:new Date().toISOString()});
 }
 const unique=Array.from(new Map(articles.map(a=>[String(a.original_url),a])).values());
 const {error}=unique.length?await supabase.from("news_articles").upsert(unique,{onConflict:"original_url",ignoreDuplicates:true}):{error:null};
 return new Response(JSON.stringify({fetched:unique.length,error:error?.message??null}),{headers:{"content-type":"application/json"}});
});
