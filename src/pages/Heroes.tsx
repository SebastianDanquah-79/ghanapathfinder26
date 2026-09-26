
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { ExternalLink } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";

const labels: Record<string,string> = {
  independence_and_liberation:"Independence and liberation",
  pan_africanism:"Pan-Africanism",
  science_and_invention:"Science and invention",
  arts_and_literature:"Arts and literature",
  business_and_industry:"Business and industry",
  sports:"Sports",
  activism_and_civil_rights:"Activism and civil rights"
};

export default function Heroes(){
  const q = useQuery({queryKey:["heroes"],queryFn:async function(){
    const r=await supabase.from("african_heroes").select("*").order("category").order("name");
    if(r.error) throw r.error;
    return r.data || [];
  }});
  const groups=Object.keys(labels).map(function(k){return [k,(q.data || []).filter(function(x){return x.category===k;})] as const;}).filter(function(x){return x[1].length>0;});
  return <div className="min-h-dvh bg-background"><Navbar/><main className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:px-6 lg:px-8"><Seo title="Hall of African Heroes | GhanaPathFinder" description="A sourced tribute to Africans whose work shaped independence, science, culture, business, sport and civic life." path="/heroes"/><header className="border-b border-border pb-7"><p className="text-sm font-semibold text-primary">Hall of African Heroes</p><h1 className="mt-2 text-3xl font-bold">People whose work changed the continent.</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Every published entry must carry a source. This is distinct from the neutral leaders directory.</p></header><div className="mt-7 space-y-10">{groups.map(function(group){const category=group[0];const items=group[1];return <section key={category}><h2 className="text-xl font-semibold">{labels[category]}</h2><div className="mt-3 grid gap-3 md:grid-cols-2">{items.map(function(item){return <article key={item.id} className="border border-border bg-card p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{item.name}</h3><p className="mt-1 text-xs text-primary">{item.country || ""}{item.era ? " · " + item.era : ""}</p></div><ExternalLink className="h-4 w-4 text-muted-foreground"/></div><p className="mt-3 text-sm leading-6 text-muted-foreground">{item.bio}</p>{item.legacy && <p className="mt-3 text-sm"><span className="font-semibold">Why they matter:</span> {item.legacy}</p>}<a className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary" href={item.source_url} target="_blank" rel="noreferrer">Source <ExternalLink className="h-3.5 w-3.5"/></a></article>;})}</div></section>;})}{!q.isLoading && !(q.data || []).length && <div className="border border-dashed border-border p-6 text-sm text-muted-foreground">The sourced research dataset has not been imported yet.</div>}</div></main></div>
}
