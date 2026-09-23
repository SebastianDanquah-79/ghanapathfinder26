import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type Leader = { id: string; country_name: string | null; name: string; title: string | null; biography: string | null; official_source_url: string | null; took_office: string | null; is_current: boolean | null; photo_url: string | null };

export const Route = createFileRoute("/leaders")({ component: Leaders });

function Leaders() {
  const [search, setSearch] = useState("");
  const [currentOnly, setCurrentOnly] = useState(true);
  const q = useQuery({
    queryKey: ["africa-leaders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("africa_leaders").select("id,country_name,name,title,biography,official_source_url,took_office,is_current,photo_url").order("country_name");
      if (error) throw error;
      return (data ?? []) as Leader[];
    },
    staleTime: 300000,
  });
  const rows = useMemo(() => (q.data ?? []).filter((x) => {
    const hay = [x.name, x.country_name, x.title].filter(Boolean).join(" ").toLowerCase();
    return (!currentOnly || x.is_current) && hay.includes(search.trim().toLowerCase());
  }), [q.data, search, currentOnly]);
  return <div className="min-h-dvh bg-background"><Navbar/><main className="pt-20 pb-14 px-4 sm:px-8"><div className="max-w-7xl mx-auto">
    <p className="text-xs uppercase tracking-[.18em] text-primary font-semibold">Africa</p><h1 className="text-3xl sm:text-4xl font-bold mt-2">Leaders of Africa</h1>
    <p className="text-muted-foreground mt-2 max-w-2xl">A source-linked directory of African heads of state and government. Records are displayed from the verified GhanaPathFinder dataset.</p>
    <div className="mt-6 flex flex-col sm:flex-row gap-3"><input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search country or leader" aria-label="Search leaders" className="h-11 flex-1 rounded-lg border border-border bg-background px-3"/><button onClick={()=>setCurrentOnly(v=>!v)} className="h-11 px-4 rounded-lg border border-border hover:bg-secondary">{currentOnly ? "Current only" : "Current and past"}</button></div>
    {q.isLoading ? <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({length:8}).map((_,i)=><div key={i} className="h-48 rounded-xl border border-border bg-secondary/40 animate-pulse"/>)}</div> :
    <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{rows.map((x)=><article key={x.id} className="rounded-xl border border-border bg-card overflow-hidden"><div className="h-32 bg-secondary">{x.photo_url && <img src={x.photo_url} alt="" loading="lazy" className="h-full w-full object-cover"/>}</div><div className="p-4"><p className="text-xs text-muted-foreground">{x.country_name}</p><h2 className="font-semibold mt-1">{x.name}</h2><p className="text-sm text-primary mt-1">{x.title}</p>{x.took_office && <p className="text-xs text-muted-foreground mt-2">In office since {new Date(x.took_office).getFullYear()}</p>}{x.biography && <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{x.biography}</p>}{x.official_source_url && <a className="inline-block text-xs text-primary mt-3 hover:underline" href={x.official_source_url} target="_blank" rel="noreferrer">Official source</a>}</div></article>)}</div>}
    {!q.isLoading && !rows.length && <div className="mt-8 border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground">No verified leader records match this search.</div>}
  </div></main><Footer/></div>;
}