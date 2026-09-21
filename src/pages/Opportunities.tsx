import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Search, ExternalLink, MapPin, CalendarClock } from "@/lib/icons";

type Opportunity = {
  id: string;
  title: string;
  opportunity_type: string | null;
  company_name: string | null;
  country_code: string | null;
  location: string | null;
  city: string | null;
  remote: boolean | null;
  description: string | null;
  skills: string[] | null;
  application_url: string | null;
  source_name: string | null;
  source_url: string | null;
  deadline: string | null;
};

export default function Opportunities() {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const result = await (supabase.from("opportunities" as never) as any)
        .select("id,title,opportunity_type,company_name,country_code,location,city,remote,description,skills,application_url,source_name,source_url,deadline")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(60);

      if (cancelled) return;
      if (!result.error) setItems((result.data ?? []) as Opportunity[]);
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const types = useMemo(
    () => Array.from(new Set(items.map((item) => item.opportunity_type).filter(Boolean))) as string[],
    [items],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return items.filter((item) => {
      const haystack = [
        item.title,
        item.company_name,
        item.description,
        item.country_code,
        ...(item.skills ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!needle || haystack.includes(needle)) &&
        (type === "all" || item.opportunity_type === type) &&
        (!remoteOnly || item.remote === true)
      );
    });
  }, [items, query, type, remoteOnly]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Opportunity hub</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Jobs, internships and opportunities</h1>
          <p className="mt-3 text-muted-foreground">
            Explore verified opportunities across Ghana, Africa and the world. Each listing keeps its source and application link.
          </p>
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-[1fr_200px_auto]">
          <label className="flex items-center gap-2 rounded-lg border border-border bg-card px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, company or skill"
              className="h-11 w-full bg-transparent text-sm outline-none"
            />
          </label>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-11 rounded-lg border border-border bg-card px-3 text-sm"
          >
            <option value="all">All types</option>
            {types.map((itemType) => (
              <option key={itemType} value={itemType}>{itemType}</option>
            ))}
          </select>

          <label className="inline-flex h-11 items-center gap-2 rounded-lg border border-border bg-card px-4 text-sm">
            <input
              type="checkbox"
              checked={remoteOnly}
              onChange={(event) => setRemoteOnly(event.target.checked)}
            />
            Remote only
          </label>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {loading ? (
            <div className="py-12 text-sm text-muted-foreground">Loading opportunities...</div>
          ) : filtered.length ? (
            filtered.map((item) => (
              <article key={item.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-semibold">{item.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.company_name || "Organization"}
                      {item.opportunity_type ? ` · ${item.opportunity_type}` : ""}
                    </p>
                  </div>
                  {item.remote && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      Remote
                    </span>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  {(item.city || item.location || item.country_code) && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {item.city || item.location || item.country_code}
                    </span>
                  )}
                  {item.deadline && (
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Deadline {new Date(item.deadline).toLocaleDateString("en-GB")}
                    </span>
                  )}
                </div>

                {item.description && (
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                )}

                {!!item.skills?.length && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {item.skills.slice(0, 6).map((skill) => (
                      <span key={skill} className="rounded-md border border-border px-2 py-1 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <a
                    href={item.application_url || item.source_url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                  >
                    Apply <ExternalLink className="h-4 w-4" />
                  </a>
                  {item.source_url && (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium"
                    >
                      {item.source_name || "Source"}
                    </a>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border p-10 text-sm text-muted-foreground lg:col-span-2">
              No matching active opportunities yet.
            </div>
          )}
        </div>

        <p className="mt-8 text-xs text-muted-foreground">
          <Link to="/onboarding" className="text-primary">Complete your profile</Link> to make future opportunity matching more relevant.
        </p>
      </main>
    </div>
  );
}
