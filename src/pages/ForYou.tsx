import { useMemo, useState } from "react";
import { Link } from "@/lib/router-compat";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpRight,
  Bookmark,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ExternalLink,
  GraduationCap,
  Globe2,
  Newspaper,
  Rocket,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityInsights } from "@/hooks/useInsights";
import { toast } from "sonner";

type FeedKind = "all" | "study" | "work" | "startups" | "news" | "community";
type ContentKind = Exclude<FeedKind, "all">;

interface FeedItem {
  key: string;
  kind: ContentKind;
  recordType: string;
  title: string;
  subtitle: string;
  summary?: string | null;
  date?: string | null;
  actionHref?: string | null;
  actionLabel?: string;
  actionExternal?: boolean;
  sourceName?: string | null;
  verified?: boolean;
  savedType: string;
  followType?: string;
  followKey?: string;
}

const filters: Array<{ key: FeedKind; label: string }> = [
  { key: "all", label: "For You" },
  { key: "study", label: "Study" },
  { key: "work", label: "Work" },
  { key: "startups", label: "Startups" },
  { key: "news", label: "Africa news" },
  { key: "community", label: "Student voices" },
];

const quickDestinations = [
  { title: "Find a course", detail: "Universities and programmes", href: "/search?kind=university", icon: GraduationCap },
  { title: "Apply with a plan", detail: "Admissions and deadlines", href: "/admission-match", icon: CalendarDays },
  { title: "Grow your career", detail: "Jobs, skills and internships", href: "/jobs", icon: BriefcaseBusiness },
  { title: "Build something", detail: "Startups and founder support", href: "/startups", icon: Rocket },
  { title: "Meet your people", detail: "Community and professionals", href: "/community", icon: Users },
];

const dateValue = (date?: string | null) => {
  if (!date) return 0;
  const parsed = new Date(date).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const dateLabel = (date?: string | null) => {
  const value = dateValue(date);
  return value ? new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null;
};

const ForYou = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [activeFilter, setActiveFilter] = useState<FeedKind>("all");
  const [search, setSearch] = useState("");

  const { data: prefs } = useQuery({
    queryKey: ["user_preferences", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const opportunitiesQuery = useQuery({
    queryKey: ["for-you", "opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase.from("opportunities")
        .select("id,title,company_name,organisation,country,city,work_mode,opportunity_type,type,category,source_name,source_url,apply_url,deadline_date,verified,is_active,published,posted_at")
        .or("is_active.eq.true,published.eq.true").order("posted_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data ?? [];
    },
  });
  const startupsQuery = useQuery({
    queryKey: ["for-you", "startups"],
    queryFn: async () => {
      const { data, error } = await supabase.from("african_startups")
        .select("id,company_name,country,city,sector,stage,official_url,source_url,source_name,last_verified_at,active_status")
        .order("last_verified_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });
  const companiesQuery = useQuery({
    queryKey: ["for-you", "companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies")
        .select("id,name,slug,sector,location,region,website_url,careers_url,source_url,verified,last_verified_at")
        .eq("verified", true).order("last_verified_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data ?? [];
    },
  });
  const newsQuery = useQuery({
    queryKey: ["for-you", "news"],
    queryFn: async () => {
      const { data, error } = await supabase.from("news_articles")
        .select("id,title,excerpt,original_url,country_code,category,published_at,source_name")
        .order("published_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });
  const communityQuery = useCommunityInsights(10);

  const countrySet = useMemo(
    () => new Set((prefs?.followed_countries ?? []).map((x: string) => x.toLowerCase())),
    [prefs?.followed_countries],
  );
  const interestSet = useMemo(
    () => new Set((prefs?.interests ?? []).map((x: string) => x.toLowerCase())),
    [prefs?.interests],
  );

  const rankedOpportunities = useMemo(() => {
    const rows = opportunitiesQuery.data ?? [];
    return [...rows].sort((a, b) => {
      const score = (item: typeof a) => {
        let total = 0;
        if (item.country && countrySet.has(item.country.toLowerCase())) total += 4;
        const words = [item.title, item.category, item.type, item.opportunity_type, item.company_name].filter(Boolean).join(" ").toLowerCase();
        for (const interest of interestSet) if (words.includes(interest)) total += 2;
        if (item.verified) total += 1;
        return total;
      };
      return score(b) - score(a);
    });
  }, [opportunitiesQuery.data, countrySet, interestSet]);

  const feedItems = useMemo<FeedItem[]>(() => {
    const opportunities: FeedItem[] = rankedOpportunities.map((item) => {
      const words = [item.title, item.category, item.type, item.opportunity_type].filter(Boolean).join(" ").toLowerCase();
      const isStudy = /scholarship|education|student|fellowship|research|university|study|training|bootcamp/.test(words);
      return {
        key: item.id,
        kind: isStudy ? "study" : "work",
        recordType: isStudy ? "Study opportunity" : "Opportunity",
        title: item.title,
        subtitle: [item.company_name || item.organisation, item.country, item.city, item.work_mode || item.type || item.opportunity_type || item.category].filter(Boolean).join(" · "),
        date: item.posted_at,
        actionHref: item.apply_url || item.source_url || "/opportunities",
        actionLabel: item.apply_url ? "Apply / details" : item.source_url ? "Open source" : "Explore opportunities",
        actionExternal: Boolean(item.apply_url || item.source_url),
        sourceName: item.source_name,
        verified: item.verified,
        savedType: "opportunity",
      };
    });
    const startups: FeedItem[] = (startupsQuery.data ?? []).map((item) => ({
      key: item.id,
      kind: "startups",
      recordType: "Startup",
      title: item.company_name,
      subtitle: [item.sector, item.city, item.country, item.stage].filter(Boolean).join(" · ") || "Startup profile",
      date: item.last_verified_at,
      actionHref: item.official_url || item.source_url || "/startups",
      actionLabel: item.official_url || item.source_url ? "Visit source" : "Explore startups",
      actionExternal: Boolean(item.official_url || item.source_url),
      sourceName: item.source_name,
      savedType: "startup",
      followType: "startup",
      followKey: item.id,
    }));
    const companies: FeedItem[] = (companiesQuery.data ?? []).map((item) => ({
      key: item.id,
      kind: "work",
      recordType: "Company",
      title: item.name,
      subtitle: [item.sector, item.location || item.region].filter(Boolean).join(" · ") || "Company profile",
      date: item.last_verified_at,
      actionHref: item.website_url || item.careers_url || "/companies",
      actionLabel: item.website_url || item.careers_url ? "Visit company" : "Explore companies",
      actionExternal: Boolean(item.website_url || item.careers_url),
      sourceName: item.source_url ? "Source available" : null,
      verified: item.verified,
      savedType: "company",
      followType: "company",
      followKey: item.id,
    }));
    const news: FeedItem[] = (newsQuery.data ?? []).map((item) => ({
      key: item.id,
      kind: "news",
      recordType: "Africa news",
      title: item.title,
      subtitle: [item.category, item.country_code].filter(Boolean).join(" · ") || "Africa",
      summary: item.excerpt,
      date: item.published_at,
      actionHref: item.original_url || null,
      actionLabel: "Read original",
      actionExternal: true,
      sourceName: item.source_name,
      savedType: "news_article",
    }));
    const studentVoices: FeedItem[] = (communityQuery.data ?? []).map((item) => ({
      key: item.id,
      kind: "community",
      recordType: "Student voice",
      title: item.universities?.name ? "Life at " + item.universities.name : "Student experience",
      subtitle: [item.category, item.student_status].filter(Boolean).join(" · "),
      summary: item.body,
      date: item.created_at,
      actionHref: "/community",
      actionLabel: "Read and discuss",
      actionExternal: false,
      sourceName: "Shared student experience",
      savedType: "student_insight",
    }));
    return [...opportunities, ...startups, ...companies, ...news, ...studentVoices]
      .sort((a, b) => dateValue(b.date) - dateValue(a.date));
  }, [rankedOpportunities, startupsQuery.data, companiesQuery.data, newsQuery.data, communityQuery.data]);

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    return feedItems.filter((item) => {
      const matchesFilter = activeFilter === "all" || item.kind === activeFilter;
      const matchesSearch = !term || [item.title, item.subtitle, item.summary, item.sourceName].filter(Boolean).join(" ").toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [feedItems, activeFilter, search]);

  const loading = opportunitiesQuery.isLoading || startupsQuery.isLoading || companiesQuery.isLoading || newsQuery.isLoading || communityQuery.isLoading;
  const hasError = opportunitiesQuery.isError || startupsQuery.isError || companiesQuery.isError || newsQuery.isError || communityQuery.isError;

  const save = async (item: FeedItem) => {
    if (!user) { toast.info("Sign in to save this to your personal list."); return; }
    const { error } = await supabase.from("saved_items").upsert(
      { user_id: user.id, item_type: item.savedType, item_key: item.key, title: item.title, subtitle: item.subtitle || null, metadata: { source: item.sourceName ?? null } },
      { onConflict: "user_id,item_type,item_key" },
    );
    if (error) toast.error("Could not save this item.");
    else {
      toast.success("Saved to your list");
      qc.invalidateQueries({ queryKey: ["saved_items"] });
    }
  };

  const follow = async (item: FeedItem) => {
    if (!user) { toast.info("Sign in to follow this profile."); return; }
    if (!item.followType || !item.followKey) return;
    const { error } = await supabase.from("user_follows").upsert(
      { user_id: user.id, entity_type: item.followType, entity_key: item.followKey },
      { onConflict: "user_id,entity_type,entity_key" },
    );
    if (error) toast.error("Could not follow this profile.");
    else {
      toast.success("Following");
      qc.invalidateQueries({ queryKey: ["user_follows"] });
    }
  };

  const card = "border border-border bg-card";
  const allQueryLoading = loading && feedItems.length === 0;

  return (
    <div className="min-h-screen bg-background pt-20 pb-24 md:pb-12">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">GhanaPathFinder · One connected platform</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Your next step starts here.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Study, work, build, follow Africa news and hear real student experiences in one source-aware feed.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/ask-africa" className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm font-semibold hover:border-primary"><Sparkles className="h-4 w-4 text-primary" /> AI study & path coach</Link>
            <Link to="/onboarding" className="bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Personalise my feed</Link>
          </div>
        </header>

        <section className="mb-6 border-y border-border py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><h2 className="text-sm font-semibold">Go straight to what matters</h2><p className="mt-1 text-xs text-muted-foreground">Your applications, career and community stay connected.</p></div>
            <Link to="/saved" className="shrink-0 text-xs font-semibold text-primary">Saved items <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" /></Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {quickDestinations.map((item) => {
              const Icon = item.icon;
              return <Link key={item.href} to={item.href as any} className="flex min-w-0 items-start gap-3 border border-border bg-background p-3 transition hover:border-primary">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-4 text-muted-foreground">{item.detail}</span></span>
              </Link>;
            })}
          </div>
        </section>

        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div><h2 className="text-sm font-semibold">Stories and quick reads</h2><p className="mt-1 text-xs text-muted-foreground">Source-aware reporting and updates from across Africa.</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Stories", detail: "Read the latest", href: "/stories", icon: Newspaper },
              { label: "Daily Drop", detail: "Quick updates", href: "/daily-drop", icon: Globe2 },
              { label: "Live Africa", detail: "Explore now", href: "/live-africa", icon: ArrowUpRight },
            ].map((item) => {
              const Icon = item.icon;
              return <Link key={item.href} to={item.href as any} className="border border-border p-3 transition hover:border-primary">
                <Icon className="h-5 w-5 text-primary" />
                <span className="mt-2 block text-sm font-semibold">{item.label}</span>
                <span className="mt-1 block text-xs text-muted-foreground">{item.detail}</span>
              </Link>;
            })}
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <label className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search study, jobs, startups, news…" className="w-full border border-border bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" aria-label="Search your feed" />
              </label>
              <Link to="/community" className="inline-flex items-center justify-center gap-2 border border-border px-4 py-2.5 text-sm font-medium hover:border-primary"><Users className="h-4 w-4" /> Share a student experience</Link>
            </div>

            <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Feed categories">
              {filters.map((filter) => (
                <button key={filter.key} type="button" role="tab" aria-selected={activeFilter === filter.key} onClick={() => setActiveFilter(filter.key)} className={`shrink-0 border px-3 py-2 text-xs font-semibold transition ${activeFilter === filter.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground"}`}>
                  {filter.label}
                </button>
              ))}
            </div>

            {allQueryLoading && <div className={card + " p-5 text-sm text-muted-foreground"}>Loading your connected feed…</div>}
            {hasError && <div className={card + " mb-3 p-4 text-sm text-muted-foreground"} role="status">Some feed sources could not be loaded. Available posts are still shown; please try again later.</div>}
            {!allQueryLoading && visibleItems.length === 0 && <div className={card + " p-6"}><p className="font-semibold">Nothing to show in this view yet.</p><p className="mt-1 text-sm text-muted-foreground">Try another feed category or search term. New items appear when their sources are added to GhanaPathFinder.</p></div>}

            <div className="space-y-3">
              {visibleItems.map((item) => {
                const Icon = item.kind === "study" ? GraduationCap : item.kind === "work" ? BriefcaseBusiness : item.kind === "startups" ? Rocket : item.kind === "news" ? Newspaper : Users;
                const isExternal = Boolean(item.actionExternal && item.actionHref);
                return <article key={item.kind + ":" + item.key} className={card + " p-4 sm:p-5"}>
                  <header className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center border border-border bg-background"><Icon className="h-5 w-5 text-primary" /></span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{item.recordType}</span>
                        {item.sourceName && <><span>·</span><span>{item.sourceName}</span></>}
                        {item.verified && <span className="border border-border px-1.5 py-0.5 text-[10px]">Verified record</span>}
                        {dateLabel(item.date) && <><span>·</span><span>{dateLabel(item.date)}</span></>}
                      </div>
                      <h2 className="mt-1.5 text-base font-semibold leading-6 text-foreground">{item.title}</h2>
                      {item.subtitle && <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.subtitle}</p>}
                    </div>
                  </header>
                  {item.summary && <p className="mt-3 whitespace-pre-line text-sm leading-6 text-foreground/85 line-clamp-5">{item.summary}</p>}
                  <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    {item.actionHref && (isExternal
                      ? <a href={item.actionHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-primary hover:underline">{item.actionLabel || "Open source"} <ExternalLink className="h-3.5 w-3.5" /></a>
                      : <Link to={item.actionHref as any} className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-primary hover:underline">{item.actionLabel || "Explore"} <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                    )}
                    <button type="button" onClick={() => void save(item)} className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><Bookmark className="h-3.5 w-3.5" /> Save</button>
                    {item.followType && <button type="button" onClick={() => void follow(item)} className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"><Users className="h-3.5 w-3.5" /> Follow</button>}
                  </footer>
                </article>;
              })}
            </div>
          </section>

          <aside className="space-y-4">
            <section className={card + " p-4"}>
              <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h2 className="font-semibold">AI study & path coach</h2></div>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">Work through study questions, compare pathways, explore scholarships and ask about career or startup options. Confirm important requirements from official sources.</p>
              <Link to="/ask-africa" className="mt-4 flex items-center justify-between border border-border px-3 py-2.5 text-sm font-semibold hover:border-primary">Ask a question <ArrowUpRight className="h-4 w-4" /></Link>
            </section>

            <section className={card + " p-4"}>
              <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /><h2 className="font-semibold">Application desk</h2></div>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">Keep admission matches, scholarship applications, deadlines and saved options together.</p>
              <div className="mt-3 space-y-2">
                <Link to="/admission-match" className="flex items-center justify-between border border-border px-3 py-2 text-xs font-medium hover:border-primary">Find my pathways <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                <Link to="/applications" className="flex items-center justify-between border border-border px-3 py-2 text-xs font-medium hover:border-primary">Track applications <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                <Link to="/scholarships/" className="flex items-center justify-between border border-border px-3 py-2 text-xs font-medium hover:border-primary">Explore scholarships <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </div>
            </section>

            <section className={card + " p-4"}>
              <div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /><h2 className="font-semibold">Professional network</h2></div>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">Discover professionals who opted into visibility, explore companies and find collaborators.</p>
              <div className="mt-3 space-y-2">
                <Link to="/people" className="flex items-center justify-between border border-border px-3 py-2 text-xs font-medium hover:border-primary">Find people <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                <Link to="/connect" className="flex items-center justify-between border border-border px-3 py-2 text-xs font-medium hover:border-primary">Connect and community <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </div>
            </section>

            <p className="px-1 text-xs leading-5 text-muted-foreground">GhanaPathFinder brings different kinds of content together, but keeps source links visible. A listing marked verified does not replace checking its original provider.</p>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ForYou;
