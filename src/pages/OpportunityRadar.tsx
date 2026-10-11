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
  const [search, setSearch] = useState("");
  const { data: allItems = [], isLoading, error } = useQuery({
    queryKey: ["opportunity-radar-current-verified"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id,title,description,requirements,eligibility,company_name,organisation,country,city,location,work_mode,remote,employment_type,opportunity_type,type,category,source_name,source_url,application_url,apply_url,compensation,deadline,deadline_date,last_verified_at,status,verified,is_active,published,posted_at")
        .eq("is_active", true)
        .eq("published", true)
        .eq("verified", true)
        .order("deadline_date", { ascending: true, nullsFirst: false })
        .limit(250);
      if (error) throw error;
      const now = Date.now();
      return (data ?? []).filter((item) => {
        const status = String(item.status ?? "").toLowerCase();
        const deadlineValue = item.deadline_date ?? item.deadline;
        const deadlineTime = deadlineValue ? new Date(deadlineValue).getTime() : null;
        return !["expired", "closed", "archived_for_refresh", "cancelled"].includes(status)
          && (deadlineTime === null || !Number.isFinite(deadlineTime) || deadlineTime >= now);
      });
    },
    staleTime: 60_000,
  });
  const countries = useMemo(() => Array.from(new Set(allItems.map(x => x.country).filter(Boolean))).sort(), [allItems]);
  const categories = useMemo(() => Array.from(new Set(allItems.map(x => x.category).filter(Boolean))).sort(), [allItems]);
  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return allItems.filter((item) => {
      if (country && item.country !== country) return false;
      if (category && item.category !== category) return false;
      if (remote && item.remote !== true) return false;
      if (term && ![item.title, item.company_name, item.organisation, item.description, item.category]
        .some((value) => String(value ?? "").toLowerCase().includes(term))) return false;
      return true;
    });
  }, [allItems, country, category, remote, search]);
  const now = new Date();
  const week = new Date(Date.now() + 7 * 86400000);
  const closingToday = items.filter(x => x.deadline_date && new Date(x.deadline_date).toDateString() === now.toDateString());
  const closingWeek = items.filter(x => x.deadline_date && new Date(x.deadline_date) <= week);
  const card = "rounded-xl border border-border bg-card p-4";
  const render = (list: typeof items) => <div className="grid gap-3 md:grid-cols-2">{list.map(x => {
    const deadline = x.deadline_date || x.deadline;
    const applyUrl = x.application_url || x.apply_url || x.source_url;
    return <article key={x.id} className={card + " flex flex-col gap-3"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold leading-snug text-foreground">{x.title}</h3>
          <p className="mt-1 text-sm font-medium text-muted-foreground">{x.company_name || x.organisation || "Organisation"} · {x.city || x.location || x.country || "Location in source listing"}</p>
        </div>
        <span className="shrink-0 border border-border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary">Verified</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="bg-secondary px-2 py-1 font-medium text-foreground">{x.category || x.employment_type || x.type || x.opportunity_type || "Opportunity"}</span>
        {x.remote && <span className="border border-border px-2 py-1 text-muted-foreground">Remote</span>}
        {deadline && <span className="border border-border px-2 py-1 text-muted-foreground">Deadline {new Date(deadline).toLocaleDateString("en-GB", {day:"numeric",month:"short",year:"numeric"})}</span>}
      </div>
      {x.description && <p className="text-sm leading-6 text-muted-foreground line-clamp-4">{x.description}</p>}
      {x.eligibility && <p className="text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Eligibility: </span>{x.eligibility}</p>}
      {x.compensation && <p className="text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Compensation: </span>{x.compensation}</p>}
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-[11px] text-muted-foreground">Source: {x.source_name || "Linked source"}{x.last_verified_at ? " · Checked " + new Date(x.last_verified_at).toLocaleDateString("en-GB") : ""}</span>
        {applyUrl && <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">Review and apply <ExternalLink className="h-3.5 w-3.5" /></a>}
      </div>
    </article>;
  })}</div>;
  return <div className="min-h-screen bg-background pt-20 pb-24 md:pb-12"><Navbar /><main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <header className="mb-7 border-b border-border pb-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Opportunity Radar</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">Find opportunities worth acting on.</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Browse current, source-linked opportunities. Closed, expired, unverified and archived records are excluded from this feed.</p>
      <p className="mt-4 text-sm font-semibold text-foreground">{items.length} verified opportunities match your filters <span className="font-normal text-muted-foreground">· {allItems.length} active verified listings in the directory</span></p>
    </header>
    <section className="mb-7 border border-border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2"><Filter className="h-4 w-4 text-primary" /><span className="text-sm font-bold">Search and filters</span></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search role, organisation or skill" aria-label="Search current opportunities" className="min-h-11 rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50" />
        <select value={country} onChange={e => setCountry(e.target.value)} aria-label="Filter opportunities by country" className="min-h-11 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"><option value="">All countries</option>{countries.map(x => <option key={x} value={x}>{x}</option>)}</select>
        <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Filter opportunities by category" className="min-h-11 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm"><option value="">All categories</option>{categories.map(x => <option key={x} value={x}>{x}</option>)}</select>
        <label className="flex min-h-11 items-center gap-2 border border-border bg-secondary px-3 py-2.5 text-sm"><input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)} /> Remote only</label>
      </div>
    </section>
    {isLoading ? <p className="text-sm text-muted-foreground">Loading opportunities…</p> : error ? <div className={card + " text-sm text-destructive"}>We could not load opportunities. Try again.</div> : <>{closingToday.length > 0 && <section className="mb-7"><div className="mb-3 flex items-center gap-2"><CalendarClock className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Closing today</h2></div>{render(closingToday)}</section>}<section><h2 className="mb-3 text-xl font-semibold">{closingWeek.length ? "Closing this week" : "Current opportunities"}</h2>{render(closingWeek.length ? closingWeek : items)}</section>{!items.length && <div className={card + " mt-4 text-sm text-muted-foreground"}>No current verified opportunities match these filters right now. <Link to="/for-you" className="font-semibold text-primary">Explore your feed</Link>.</div>}</>}
  </main></div>;
};
export default OpportunityRadar;
