import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { ArrowUpRight, BriefcaseBusiness, Building2, Instagram, Linkedin, MessageCircle, Rocket, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

const card = "border border-border bg-card p-4";
const externalLink = "text-xs font-semibold text-primary inline-flex items-center gap-1.5";

const People = () => {
  const people = useQuery({
    queryKey: ["people-directory"],
    queryFn: async () => {
      // This view exposes only profiles that explicitly opted into discovery. It
      // never returns email addresses or raw phone numbers, and each social URL
      // is present only when that user marked it public.
      const { data, error } = await (supabase as any)
        .from("public_people_directory")
        .select("user_id,full_name,professional_title,city,skills,bio,avatar_url,linkedin_url,instagram_url,x_url,whatsapp_url,updated_at")
        .order("updated_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as Array<{
        user_id: string;
        full_name: string;
        professional_title: string | null;
        city: string | null;
        skills: string[];
        bio: string | null;
        avatar_url: string | null;
        linkedin_url: string | null;
        instagram_url: string | null;
        x_url: string | null;
        whatsapp_url: string | null;
        updated_at: string;
      }>;
    },
    staleTime: 30_000,
  });

  const startups = useQuery({
    queryKey: ["people-building-africa-startups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("african_startups")
        .select("id,company_name,country,city,sector,stage,official_url,source_url,source_name,last_verified_at")
        .order("last_verified_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 300_000,
  });

  const companies = useQuery({
    queryKey: ["people-building-africa-companies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("companies")
        .select("id,name,sector,location,region,website_url,careers_url,source_url,primary_source_url,verified,verification_status,source_tier,last_verified_at")
        .or("verified.eq.true,source_url.not.is.null,primary_source_url.not.is.null")
        .order("last_verified_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 300_000,
  });

  const opportunities = useQuery({
    queryKey: ["people-building-africa-opportunities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("id,title,company_name,organisation,country,city,work_mode,type,opportunity_type,category,apply_url,source_url,verified,deadline_date,posted_at")
        .eq("is_active", true)
        .eq("published", true)
        .eq("verified", true)
        .order("posted_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 180_000,
  });

  const loading = people.isLoading || startups.isLoading || companies.isLoading || opportunities.isLoading;

  return (
    <div className="min-h-screen bg-background pt-20 pb-24">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Connect</p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">People Building Africa</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Meet professionals who choose to be discoverable, explore African startups and companies, and find opportunities to contribute.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/onboarding?role=employee" className="inline-flex items-center gap-2 bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              Add my professional profile <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link to="/jobs" className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm font-medium">
              Explore jobs
            </Link>
          </div>
        </header>

        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Discoverable talent</h2>
            <span className="text-xs text-muted-foreground">{people.data?.length ?? 0}</span>
          </div>
          <p className="mb-4 max-w-3xl text-sm text-muted-foreground">
            Only people who explicitly opt in are listed. Their professional details appear here because they chose to make them public.
          </p>
          {people.isLoading ? (
            <p className={card + " text-sm text-muted-foreground"}>Loading public professional profiles…</p>
          ) : people.isError ? (
            <p className={card + " text-sm text-destructive"}>We could not load talent profiles. Please refresh and try again.</p>
          ) : people.data?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {people.data.map((person) => (
                <article key={person.user_id} className={card + " flex flex-col gap-3"}>
                  <div className="flex items-start gap-3">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-border bg-secondary flex items-center justify-center font-semibold text-foreground">
                      <span aria-hidden="true">{person.full_name.trim().slice(0, 1).toUpperCase()}</span>
                      {person.avatar_url && (
                        <img
                          src={person.avatar_url}
                          alt={person.full_name + " profile"}
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover"
                          onError={(event) => { event.currentTarget.style.display = "none"; }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold leading-snug">{person.full_name || "Professional"}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {person.professional_title || "Professional"}
                        {person.city ? " · " + person.city : ""}
                      </p>
                    </div>
                  </div>
                  {person.skills?.length > 0 && <p className="text-xs leading-5 text-muted-foreground">{person.skills.slice(0, 8).join(" · ")}</p>}
                  {person.bio && <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{person.bio}</p>}
                  {(person.linkedin_url || person.instagram_url || person.x_url || person.whatsapp_url) && (
                    <nav aria-label={person.full_name + " public social links"} className="mt-auto flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-3">
                      {person.linkedin_url && <a href={person.linkedin_url} target="_blank" rel="noopener noreferrer" className={externalLink}><Linkedin className="h-3.5 w-3.5" /> LinkedIn <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                      {person.instagram_url && <a href={person.instagram_url} target="_blank" rel="noopener noreferrer" className={externalLink}><Instagram className="h-3.5 w-3.5" /> Instagram <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                      {person.x_url && <a href={person.x_url} target="_blank" rel="noopener noreferrer" className={externalLink}>X <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                      {person.whatsapp_url && <a href={person.whatsapp_url} target="_blank" rel="noopener noreferrer" className={externalLink}><MessageCircle className="h-3.5 w-3.5" /> WhatsApp <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                    </nav>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <div className={card + " border-dashed"}>
              <h3 className="font-semibold">Be among the first to join the directory</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                No professionals have opted into public discovery yet. We will not invent profiles or publish anyone without consent. Complete your Job Seeker profile and switch on discoverability to appear here.
              </p>
              <Link to="/onboarding?role=employee" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                Create a public professional profile <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </section>

        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">African startups</h2>
            <span className="text-xs text-muted-foreground">{startups.data?.length ?? 0} shown</span>
          </div>
          {startups.isLoading ? <p className={card + " text-sm text-muted-foreground"}>Loading startup directory…</p> : startups.isError ? <p className={card + " text-sm text-destructive"}>We could not load the startup directory.</p> : startups.data?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {startups.data.map((startup) => (
                <article className={card} key={startup.id}>
                  <h3 className="font-semibold">{startup.company_name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{[startup.city, startup.country].filter(Boolean).join(", ") || "Location not listed"}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{startup.sector || "Sector not listed"}{startup.stage ? " · " + startup.stage : ""}</p>
                  {startup.source_name && <p className="mt-2 text-[11px] text-muted-foreground">Source: {startup.source_name}</p>}
                  {(startup.official_url || startup.source_url) && <a href={startup.official_url || startup.source_url || "#"} target="_blank" rel="noreferrer" className={externalLink + " mt-3"}>Open source <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                </article>
              ))}
            </div>
          ) : <p className={card + " text-sm text-muted-foreground"}>No startup records are available at the moment.</p>}
          <Link to="/startups" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">View startup directory <ArrowUpRight className="h-4 w-4" /></Link>
        </section>

        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Companies across Africa</h2>
            <span className="text-xs text-muted-foreground">{companies.data?.length ?? 0} shown</span>
          </div>
          {companies.isLoading ? <p className={card + " text-sm text-muted-foreground"}>Loading company directory…</p> : companies.isError ? <p className={card + " text-sm text-destructive"}>We could not load companies.</p> : companies.data?.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {companies.data.map((company) => (
                <article className={card} key={company.id}>
                  <h3 className="font-semibold">{company.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{company.sector} · {[company.location, company.region].filter(Boolean).join(", ") || "Africa"}</p>
                  <p className={"mt-2 text-[11px] font-medium " + (company.verified ? "text-primary" : "text-muted-foreground")}>{company.verified ? "Verified record" : company.verification_status === "source_linked_needs_review" ? "Source linked · needs review" : "Needs verification"}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {(company.website_url || company.primary_source_url || company.source_url) && <a href={company.website_url || company.primary_source_url || company.source_url || "#"} target="_blank" rel="noreferrer" className={externalLink}>Website / source <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                    {company.careers_url && <a href={company.careers_url} target="_blank" rel="noreferrer" className={externalLink}>Careers <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                  </div>
                </article>
              ))}
            </div>
          ) : <p className={card + " text-sm text-muted-foreground"}>No verified company records are currently available.</p>}
          <Link to="/companies" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">View company directory <ArrowUpRight className="h-4 w-4" /></Link>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <BriefcaseBusiness className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Opportunities to contribute</h2>
          </div>
          {opportunities.isLoading ? <p className={card + " text-sm text-muted-foreground"}>Loading opportunities…</p> : opportunities.isError ? <p className={card + " text-sm text-destructive"}>We could not load opportunities.</p> : opportunities.data?.length ? (
            <div className="grid gap-3 md:grid-cols-2">
              {opportunities.data.map((item) => (
                <article className={card} key={item.id}>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{item.company_name || item.organisation || "Organisation"} · {[item.city, item.country].filter(Boolean).join(", ") || "Africa"}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{item.work_mode || item.type || item.opportunity_type || item.category || "Opportunity"}{item.deadline_date ? " · Deadline " + new Date(item.deadline_date).toLocaleDateString() : ""}</p>
                  {item.verified && <p className="mt-2 text-[11px] font-medium text-primary">Verified source</p>}
                  {(item.apply_url || item.source_url) && <a href={item.apply_url || item.source_url || "#"} target="_blank" rel="noreferrer" className={externalLink + " mt-3"}>View opportunity <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                </article>
              ))}
            </div>
          ) : <p className={card + " text-sm text-muted-foreground"}>No current opportunities are listed. Check back later.</p>}
          <Link to="/opportunities" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Browse all opportunities <ArrowUpRight className="h-4 w-4" /></Link>
        </section>
      </main>
    </div>
  );
};

export default People;
