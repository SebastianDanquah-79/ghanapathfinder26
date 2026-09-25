import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink, Building2, Newspaper, Users, CalendarDays, GraduationCap, Rocket } from "@/lib/icons";

type Item = { id: string; title: string; subtitle?: string | null; url?: string | null; kind: string };

const Section = ({ title, href, children }: { title: string; href: string; children: React.ReactNode }) => (
  <section className="bg-glass rounded-xl p-4 sm:p-5 min-w-0">
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="font-display text-base font-semibold text-foreground">{title}</h2>
      <Link to={href} className="shrink-0 text-xs font-medium text-primary">Explore</Link>
    </div>
    {children}
  </section>
);

const DiscoveryRow = ({ item }: { item: Item }) => (
  <li className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-secondary/40 p-3">
    <div className="min-w-0">
      <p className="text-sm font-medium text-foreground break-words">{item.title}</p>
      {item.subtitle && <p className="mt-0.5 text-xs text-muted-foreground break-words">{item.subtitle}</p>}
    </div>
    {item.url ? (
      <a href={item.url} target="_blank" rel="noreferrer" aria-label={`Open ${item.title}`} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-background hover:text-primary">
        <ExternalLink className="h-4 w-4" />
      </a>
    ) : null}
  </li>
);

export default function DiscoveryDashboard() {
  const { data: companies = [] } = useQuery({
    queryKey: ["dashboard-discovery-companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("id,name,sector,location,website_url").eq("verified", true).not("website_url", "is", null).order("updated_at", { ascending: false }).limit(5);
      if (error) throw error;
      return (data ?? []).map((x) => ({ id: x.id, title: x.name, subtitle: [x.sector, x.location].filter(Boolean).join(" · "), url: x.website_url, kind: "company" }));
    },
    staleTime: 300_000,
  });

  const { data: startups = [] } = useQuery({
    queryKey: ["dashboard-discovery-startups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("african_startups").select("id,company_name,country,sector,official_url").not("official_url", "is", null).order("last_verified_at", { ascending: false }).limit(5);
      if (error) throw error;
      return (data ?? []).map((x) => ({ id: x.id, title: x.company_name, subtitle: [x.sector, x.country].filter(Boolean).join(" · "), url: x.official_url, kind: "startup" }));
    },
    staleTime: 300_000,
  });

  const { data: news = [] } = useQuery({
    queryKey: ["dashboard-discovery-news"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news_articles").select("id,title,original_url,source_name,published_at").order("published_at", { ascending: false }).limit(5);
      if (error) throw error;
      return (data ?? []).map((x) => ({ id: x.id, title: x.title, subtitle: [x.source_name, x.published_at ? new Date(x.published_at).toLocaleDateString("en-GB") : null].filter(Boolean).join(" · "), url: x.original_url, kind: "news" }));
    },
    staleTime: 120_000,
  });

  const { data: universities = [] } = useQuery({
    queryKey: ["dashboard-discovery-universities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("universities").select("id,name,country,city,website_url").not("website_url", "is", null).order("updated_at", { ascending: false }).limit(5);
      if (error) throw error;
      return (data ?? []).map((x) => ({ id: x.id, title: x.name, subtitle: [x.city, x.country].filter(Boolean).join(" · "), url: x.website_url, kind: "university" }));
    },
    staleTime: 600_000,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["dashboard-discovery-events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("platform_events").select("id,title,type,location,registration_url,starts_at").gte("starts_at", new Date().toISOString()).order("starts_at", { ascending: true }).limit(5);
      if (error) throw error;
      return (data ?? []).map((x) => ({ id: x.id, title: x.title, subtitle: [x.type, x.location, new Date(x.starts_at).toLocaleDateString("en-GB")].filter(Boolean).join(" · "), url: x.registration_url, kind: "event" }));
    },
    staleTime: 300_000,
  });

  const empty = (label: string) => <p className="text-sm text-muted-foreground">{label} will appear here when verified records are available.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Africa discovery</p>
          <h2 className="mt-1 font-display text-xl font-bold text-foreground">What is happening around you</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Real companies, startups, universities, events and publisher-linked news. No placeholder records.</p>
        </div>
        <Link to="/search" className="hidden sm:inline-flex min-h-[40px] items-center rounded-lg border border-border px-3 text-xs font-medium">Search everything</Link>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Latest news" href="/news"><div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground"><Newspaper className="h-4 w-4 text-primary" /> Publisher-linked updates</div>{news.length ? <ul className="space-y-2">{news.map((x) => <DiscoveryRow key={x.id} item={x} />)}</ul> : empty("News")}</Section>
        <Section title="Companies to discover" href="/people"><div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground"><Building2 className="h-4 w-4 text-primary" /> Verified company records</div>{companies.length ? <ul className="space-y-2">{companies.map((x) => <DiscoveryRow key={x.id} item={x} />)}</ul> : empty("Companies")}</Section>
        <Section title="African startups" href="/startups"><div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground"><Rocket className="h-4 w-4 text-primary" /> Official startup destinations</div>{startups.length ? <ul className="space-y-2">{startups.map((x) => <DiscoveryRow key={x.id} item={x} />)}</ul> : empty("Startups")}</Section>
        <Section title="Universities" href="/search?kind=university"><div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground"><GraduationCap className="h-4 w-4 text-primary" /> Existing university catalogue</div>{universities.length ? <ul className="space-y-2">{universities.map((x) => <DiscoveryRow key={x.id} item={x} />)}</ul> : empty("Universities")}</Section>
        <Section title="Upcoming events" href="/events"><div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground"><CalendarDays className="h-4 w-4 text-primary" /> Verified future events</div>{events.length ? <ul className="space-y-2">{events.map((x) => <DiscoveryRow key={x.id} item={x} />)}</ul> : empty("Events")}</Section>
        <Section title="People & professional discovery" href="/people"><div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground"><Users className="h-4 w-4 text-primary" /> Public, opted-in profiles</div>{empty("Professional profiles")}</Section>
      </div>
    </div>
  );
}
