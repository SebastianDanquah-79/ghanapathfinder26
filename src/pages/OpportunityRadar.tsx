import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ExternalLink, Filter } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const OpportunityRadar = () => {
  const [country, setCountry] = useState("");
  const [category, setCategory] = useState("");
  const [remote, setRemote] = useState(false);
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ["opportunity-radar", country, category, remote],
    queryFn: async () => {
      let q = supabase.from("opportunities").select("id,title,company_name,organisation,country,city,work_mode,remote,employment_type,opportunity_type,type,category,source_name,source_url,apply_url,deadline_date,verified,is_active,published,posted_at").or("is_active.eq.true,published.eq.true").order("deadline_date", { ascending: true }).limit(100);
      if (country) q = q.eq("country", country);
      if (category) q = q.eq("category", category);
      if (remote) q = q.eq("remote", true);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
  const countries = useMemo(() => Array.from(new Set(items.map(x => x.country).filter(Boolean))).sort(), [items]);
  const categories = useMemo(() => Array.from(new Set(items.map(x => x.category).filter(Boolean))).sort(), [items]);
  const now = new Date();
  const week = new Date(Date.now() + 7 * 86400000);
  const closingToday = items.filter(x => x.deadline_date && new Date(x.deadline_date).toDateString() === now.toDateString());
  const closingWeek = items.filter(x => x.deadline_date && new Date(x.deadline_date) <= week);
  const card = "rounded-xl border border-border bg-card p-4";
  const render = (list: typeof items) => <div className="grid gap-3 md:grid-cols-2">{list.map(x => <article key={x.id} className={card}>
    <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold">{x.title}</h3><p className="mt-1 text-xs text-muted-foreground">{x.company_name || x.organisation || "Organisation"} · {x.country || "Africa"}{x.city ? " · " + x.city : ""}</p></div>{x.verified && <span className="text-[11px] text-primary font-medium">Verified</span>}</div>
    <p className="mt-2 text-xs text-muted-foreground">{x.employment_type || x.work_mode || x.type || x.opportunity_type || x.category || "Opportunity"}{x.deadline_date ? " · Deadline " + new Date(x.deadline_date).toLocaleDateString() : ""}</p>
    {(x.apply_url || x.source_url) && <a href={x.apply_url || x.source_url || "#"} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">Open source <ExternalLink className="h-3.5 w-3.5" /></a>}
  </article>)}</div>;
  return <div className="min-h-screen bg-background pt-20 pb-24 md:pb-12"><Navbar /><main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <header className="mb-7"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Opportunity Radar</p><h1 className="mt-2 text-3xl font-bold">Find opportunities worth acting on.</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Only records already present in GhanaPathFinder are shown. Dates and source labels come from stored opportunity data.</p></header>
    <section className="mb-7 rounded-xl border border-border bg-card p-4"><div className="flex items-center gap-2 mb-3"><Filter className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Filters</span></div><div className="grid gap-3 sm:grid-cols-3">
      <select value={country} onChange={e => setCountry(e.target.value)} className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"><option value="">All countries</option>{countries.map(x => <option key={x}>{x}</option>)}</select>
      <select value={category} onChange={e => setCategory(e.target.value)} className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"><option value="">All categories</option>{categories.map(x => <option key={x}>{x}</option>)}</select>
      <label className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"><input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} /> Remote only</label>
    </div></section>
    {isLoading ? <p className="text-sm text-muted-foreground">Loading opportunities…</p> : error ? <div className={card + " text-sm text-destructive"}>We could not load opportunities. Try again.</div> : <>{closingToday.length > 0 && <section className="mb-7"><div className="mb-3 flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Closing today</h2></div>{render(closingToday)}</section>}<section><h2 className="mb-3 text-xl font-semibold">{closingWeek.length ? "Closing this week" : "Current opportunities"}</h2>{render(closingWeek.length ? closingWeek : items)}</section>{!items.length && <div className={card + " mt-4 text-sm text-muted-foreground"}>No verified opportunities match these filters yet. <Link to="/for-you" className="font-semibold text-primary">Explore your feed</Link>.</div>}</>}
  </main></div>;
};
export default OpportunityRadar;
