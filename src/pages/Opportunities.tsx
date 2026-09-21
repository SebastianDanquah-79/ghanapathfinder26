import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { Briefcase, ExternalLink, MapPin, Search } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";

const TYPES = ["all","job","internship","fellowship","competition","scholarship","grant","accelerator","research","startup"];

export default function Opportunities() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const { data: opportunities = [], isLoading, error } = useQuery({
    queryKey: ["global-opportunities", type],
    queryFn: async () => {
      let q = supabase.from("opportunities").select("*").eq("status","active").order("deadline",{ascending:true,nullsFirst:false}).limit(100);
      if (type !== "all") q = q.eq("opportunity_type", type);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return opportunities;
    return opportunities.filter((o: any) =>
      [o.title,o.company_name,o.description,o.location,...(o.skills ?? [])].filter(Boolean).join(" ").toLowerCase().includes(needle)
    );
  }, [opportunities, query]);

  const save = async (o: any) => {
    if (!user) return;
    await supabase.from("saved_items").upsert({
      user_id:user.id,item_type:"opportunity",item_key:o.id,title:o.title,
      subtitle:o.company_name ?? o.source_name ?? null,metadata:{source_url:o.source_url,application_url:o.application_url}
    }, { onConflict:"user_id,item_type,item_key" });
  };

  return <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Global opportunities</p>
        <h1 className="mt-2 font-display text-3xl sm:text-5xl font-bold text-foreground">Jobs, internships and opportunities built around your path.</h1>
        <p className="mt-4 text-muted-foreground">Africa-first, global by design. Listings retain their original source and application link.</p>
      </header>
      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input aria-label="Search opportunities" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search jobs, skills, organisations..." className="w-full bg-transparent py-3 text-sm outline-none" />
        </label>
        <select value={type} onChange={e=>setType(e.target.value)} className="rounded-lg border border-border bg-secondary px-3 py-3 text-sm text-foreground">
          {TYPES.map(t=><option key={t} value={t}>{t==="all"?"All opportunity types":t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
        </select>
      </div>
      {isLoading && <p className="mt-8 text-sm text-muted-foreground">Loading opportunities...</p>}
      {error && <p className="mt-8 text-sm text-destructive">We could not load opportunities right now. Please try again.</p>}
      {!isLoading && !error && <div className="mt-8 grid gap-4 md:grid-cols-2">
        {filtered.map((o:any)=><article key={o.id} className="border border-border bg-glass p-5">
          <div className="flex items-start justify-between gap-3">
            <div><span className="text-xs uppercase tracking-wide text-muted-foreground">{o.opportunity_type}</span><h2 className="mt-1 text-lg font-semibold text-foreground">{o.title}</h2></div>
            <Briefcase className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{o.company_name ?? o.source_name ?? "Organisation not specified"}</p>
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{o.remote ? "Remote" : o.location ?? o.city ?? o.country_code ?? "Location not specified"}</p>
          {o.description && <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">{o.description}</p>}
          {!!o.skills?.length && <p className="mt-3 text-xs text-muted-foreground">Skills: {o.skills.slice(0,6).join(", ")}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <button onClick={()=>save(o)} className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground">Save</button>
            {o.application_url && <a href={o.application_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground">Apply <ExternalLink className="h-3.5 w-3.5" /></a>}
          </div>
          {(o.source_name || o.source_url) && <p className="mt-3 text-[11px] text-muted-foreground">Source: {o.source_name ?? "External source"}</p>}
        </article>)}
      </div>}
      {!isLoading && !error && filtered.length===0 && <div className="mt-10 border border-border p-8 text-center"><p className="font-medium text-foreground">No matching opportunities yet.</p><p className="mt-1 text-sm text-muted-foreground">Try another search or category. New records appear when verified sources are ingested.</p></div>}
      <div className="mt-10 text-sm text-muted-foreground">Looking for education? <Link to="/search?kind=university" className="text-primary font-medium">Explore universities</Link>.</div>
    </main>
  </div>;
}
