import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { ExternalLink, BriefcaseBusiness, Newspaper, Rocket, Users, Map, BookOpen, GraduationCap, Instagram, Linkedin, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

type Mode = "for-you" | "work" | "build" | "connect" | "travel";

const config: Record<Mode,{title:string;subtitle:string}> = {
  "for-you": {title:"For You",subtitle:"A single place to discover opportunities, knowledge and connections relevant to your path."},
  work: {title:"Work",subtitle:"Jobs, internships, employers and discoverable talent across Africa."},
  build: {title:"Build",subtitle:"Discover African startups, companies, skills and pathways for founders and builders."},
  connect: {title:"Connect",subtitle:"Find communities, professionals, companies and knowledge worth following."},
  travel: {title:"Explore Africa",subtitle:"Discover African countries and verified public information without inventing facts."},
};

const Hub = ({mode}:{mode:Mode}) => {
  const {title,subtitle}=config[mode];
  const {data:opportunities=[]}=useQuery({queryKey:["hub","opportunities-current-verified"],queryFn:async()=>{const {data,error}=await supabase.from("opportunities").select("id,title,company_name,organisation,country,city,location,work_mode,employment_type,opportunity_type,type,category,source_name,source_url,application_url,apply_url,deadline,deadline_date,description,eligibility,compensation,verified,is_active,published,status,last_verified_at").eq("is_active",true).eq("published",true).eq("verified",true).order("posted_at",{ascending:false}).limit(12);if(error)throw error;const now=Date.now();return (data??[]).filter(x=>{const deadline=x.deadline_date||x.deadline;const end=deadline?new Date(deadline).getTime():null;return !["expired","closed","archived_for_refresh","cancelled"].includes(String(x.status??"").toLowerCase())&&(end===null||!Number.isFinite(end)||end>=now);});}});
  const {data:startups=[]}=useQuery({queryKey:["hub","startups"],queryFn:async()=>{const {data,error}=await supabase.from("african_startups").select("id,company_name,country,city,sector,stage,official_url,source_url,source_name,last_verified_at,active_status").order("last_verified_at",{ascending:false}).limit(12);if(error)throw error;return data??[];}});
  const {data:companies=[]}=useQuery({queryKey:["hub","companies"],queryFn:async()=>{const {data,error}=await supabase.from("companies").select("id,name,slug,sector,location,region,website_url,careers_url,source_url,verified,last_verified_at").eq("verified",true).order("last_verified_at",{ascending:false}).limit(12);if(error)throw error;return data??[];}});
  const {data:talent=[]}=useQuery({queryKey:["hub","talent-public-directory"],queryFn:async()=>{const {data,error}=await (supabase as any).from("public_people_directory").select("user_id,full_name,professional_title,city,skills,bio,avatar_url,linkedin_url,instagram_url,x_url,whatsapp_url,updated_at").order("updated_at",{ascending:false}).limit(12);if(error)throw error;return (data??[]) as Array<{user_id:string;full_name:string;professional_title:string|null;city:string|null;skills:string[];bio:string|null;avatar_url:string|null;linkedin_url:string|null;instagram_url:string|null;x_url:string|null;whatsapp_url:string|null;updated_at:string}>;}});
  const {data:news=[]}=useQuery({queryKey:["hub","news"],queryFn:async()=>{const {data,error}=await supabase.from("news_articles").select("id,title,excerpt,original_url,country_code,category,published_at,source_name").order("published_at",{ascending:false}).limit(8);if(error)throw error;return data??[];}});
  const {data:books=[]}=useQuery({queryKey:["hub","books"],queryFn:async()=>{const {data,error}=await supabase.from("book_catalog").select("id,title,author,publication_year,subject,description,source_url").order("publication_year",{ascending:false}).limit(8);if(error)throw error;return data??[];}});
  const {data:countries=[]}=useQuery({queryKey:["hub","countries"],queryFn:async()=>{const {data,error}=await supabase.from("africa_country_catalog").select("code,name,region,official_languages,common_languages").eq("enabled",true).order("name").limit(54);if(error)throw error;return data??[];}});

  const card="rounded-xl border border-border bg-card p-4";
  const showWork=mode==="for-you"||mode==="work";
  const showBuild=mode==="for-you"||mode==="build";
  const showConnect=mode==="for-you"||mode==="connect";
  const showTravel=mode==="travel";

  return <div className="min-h-screen bg-background pt-20 pb-20"><Navbar/><main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
    <header className="mb-8 border-b border-border pb-6"><p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">GhanaPathFinder</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{subtitle}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link to="/onboarding" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Personalise my path</Link>
        <Link to="/explore" className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium">Explore Africa</Link>
        <Link to="/careers" className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium">Careers</Link>
      </div>
    </header>

    {showWork&&<section className="mb-9">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-primary"/><h2 className="text-2xl font-bold">Current work & opportunities</h2><span className="border border-border px-2 py-1 text-xs font-bold">{opportunities.length}</span></div>
        <Link to="/opportunities" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">Browse all opportunities <ExternalLink className="h-3.5 w-3.5"/></Link>
      </div>
      <p className="mb-4 max-w-3xl text-sm text-muted-foreground">Source-linked listings marked verified and currently active. Always confirm the details on the provider’s own application page before submitting an application.</p>
      <div className="grid gap-3 md:grid-cols-2">{opportunities.map(x=><article className={card+" flex flex-col gap-3"} key={x.id}>
        <div><h3 className="text-base font-bold leading-snug">{x.title}</h3><p className="mt-1 text-sm text-muted-foreground">{x.company_name||x.organisation||"Organisation"} · {x.city||x.location||x.country||"Location in source listing"}</p></div>
        <div className="flex flex-wrap gap-2 text-xs"><span className="bg-secondary px-2 py-1 font-semibold">{x.category||x.work_mode||x.employment_type||x.type||x.opportunity_type||"Opportunity"}</span>{x.remote&&<span className="border border-border px-2 py-1">Remote</span>}{(x.deadline_date||x.deadline)&&<span className="border border-border px-2 py-1">Deadline {new Date(x.deadline_date||x.deadline).toLocaleDateString("en-GB")}</span>}</div>
        {x.description&&<p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{x.description}</p>}
        {x.eligibility&&<p className="text-xs leading-5 text-muted-foreground"><span className="font-semibold text-foreground">Eligibility: </span>{x.eligibility}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3"><span className="text-[11px] text-muted-foreground">Verified{ x.last_verified_at ? " · Checked "+new Date(x.last_verified_at).toLocaleDateString("en-GB") : ""}</span>{(x.application_url||x.apply_url||x.source_url)&&<a className="inline-flex items-center gap-1.5 text-xs font-bold text-primary" href={x.application_url||x.apply_url||x.source_url} target="_blank" rel="noopener noreferrer">View source <ExternalLink className="h-3.5 w-3.5"/></a>}</div>
      </article>)}</div>
      {!opportunities.length&&<p className={card+" text-sm text-muted-foreground"}>No active verified opportunities match this feed yet. Use the full directory to search current records.</p>}
    </section>}

    {showBuild&&<section className="mb-9"><div className="mb-3 flex items-center gap-2"><Rocket className="h-5 w-5 text-primary"/><h2 className="text-xl font-semibold">African startups</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{startups.map(x=><article className={card} key={x.id}><h3 className="font-semibold">{x.company_name}</h3><p className="mt-1 text-xs text-muted-foreground">{x.city?x.city+", ":""}{x.country||"Africa"}</p><p className="mt-2 text-xs text-muted-foreground">{x.sector||"Sector unavailable"}{x.stage?" · "+x.stage:""}</p>{(x.official_url||x.source_url)&&<a className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary" href={x.official_url||x.source_url} target="_blank" rel="noreferrer">Official/source <ExternalLink className="h-3.5 w-3.5"/></a>}</article>)}</div></section>}

    {showBuild&&<section className="mb-9"><div className="mb-3 flex items-center gap-2"><BriefcaseBusiness className="h-5 w-5 text-primary"/><h2 className="text-xl font-semibold">Verified companies</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{companies.map(x=><article className={card} key={x.id}><h3 className="font-semibold">{x.name}</h3><p className="mt-1 text-xs text-muted-foreground">{x.sector||"Industry unavailable"} · {x.location||x.region||"Africa"}</p>{x.description&&<p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{x.description}</p>}<div className="mt-3 flex flex-wrap gap-3">{(x.website_url||x.source_url)&&<a className="text-xs font-semibold text-primary" href={x.website_url||x.source_url} target="_blank" rel="noreferrer">Website</a>}{x.careers_url&&<a className="text-xs font-semibold text-primary" href={x.careers_url} target="_blank" rel="noreferrer">Careers</a>}</div></article>)}</div></section>}

    {showConnect&&<section className="mb-9">
      <div className="mb-3 flex items-center gap-2"><Users className="h-5 w-5 text-primary"/><h2 className="text-xl font-semibold">Discoverable talent</h2><span className="text-xs text-muted-foreground">{talent.length} opted in</span></div>
      <p className="mb-3 max-w-3xl text-sm text-muted-foreground">Only professionals who have explicitly switched on public discoverability appear here. We do not publish private accounts or invent people to fill the page.</p>
      <div className="grid gap-3 md:grid-cols-2">{talent.map(x=><article className={card+" flex gap-3"} key={x.user_id}>
        <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-base font-bold">{x.full_name.trim().slice(0,1).toUpperCase()}{x.avatar_url&&<img src={x.avatar_url} alt={x.full_name+" profile"} loading="lazy" className="absolute inset-0 h-full w-full object-cover" onError={(e)=>{e.currentTarget.style.display="none";}}/>}</div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold">{x.full_name||"Professional"}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{x.professional_title||"Professional"}{x.city?" · "+x.city:""}</p>
          {x.skills?.length>0&&<p className="mt-2 text-xs text-muted-foreground">{x.skills.slice(0,6).join(" · ")}</p>}
          {x.bio&&<p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{x.bio}</p>}
          {(x.linkedin_url||x.instagram_url||x.x_url||x.whatsapp_url)&&<nav aria-label={x.full_name+" public social links"} className="mt-3 flex flex-wrap gap-x-3 gap-y-2 border-t border-border pt-3">
            {x.linkedin_url&&<a className="inline-flex items-center gap-1 text-xs font-semibold text-primary" href={x.linkedin_url} target="_blank" rel="noopener noreferrer"><Linkedin className="h-3.5 w-3.5"/>LinkedIn</a>}
            {x.instagram_url&&<a className="inline-flex items-center gap-1 text-xs font-semibold text-primary" href={x.instagram_url} target="_blank" rel="noopener noreferrer"><Instagram className="h-3.5 w-3.5"/>Instagram</a>}
            {x.x_url&&<a className="inline-flex items-center gap-1 text-xs font-semibold text-primary" href={x.x_url} target="_blank" rel="noopener noreferrer">X</a>}
            {x.whatsapp_url&&<a className="inline-flex items-center gap-1 text-xs font-semibold text-primary" href={x.whatsapp_url} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-3.5 w-3.5"/>WhatsApp</a>}
          </nav>}
        </div>
      </article>)}</div>
      {!talent.length&&<div className={card+" border-dashed"}>
        <h3 className="font-semibold">Be one of the first professionals listed</h3>
        <p className="mt-2 text-sm text-muted-foreground">Choose Job Seeker, complete your profile and opt in to discoverability. Your profile will appear here after you save.</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link to="/onboarding?role=employee" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Create my professional profile <ExternalLink className="h-3.5 w-3.5"/></Link>
          <Link to="/people" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Explore African companies and startups <ExternalLink className="h-3.5 w-3.5"/></Link>
        </div>
      </div>}
    </section>}
    {(mode==="for-you"||mode==="connect")&&<section className="mb-9"><div className="mb-3 flex items-center gap-2"><Newspaper className="h-5 w-5 text-primary"/><h2 className="text-xl font-semibold">Africa knowledge & news</h2></div><div className="grid gap-3 md:grid-cols-2">{news.map(x=><article className={card} key={x.id}><h3 className="font-semibold">{x.title}</h3>{x.excerpt&&<p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{x.excerpt}</p>}<p className="mt-2 text-xs text-muted-foreground">{x.source_name||"Source"}{x.category?" · "+x.category:""}</p>{x.original_url&&<a className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary" href={x.original_url} target="_blank" rel="noreferrer">Read original <ExternalLink className="h-3.5 w-3.5"/></a>}</article>)}</div></section>}

    {(mode==="for-you"||mode==="connect")&&<section className="mb-9">
      <div className="mb-3 flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary"/><h2 className="text-xl font-semibold">African books & ideas</h2><span className="text-xs text-muted-foreground">{books.length} titles</span></div>
      <p className="mb-3 text-sm text-muted-foreground">A curated starting shelf for African literature, history, philosophy and social thought. Links go to publishers or bibliographic references, not unauthorized full-text copies.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{books.map(x=><article className={card} key={x.id}>
        <h3 className="font-semibold">{x.title}</h3><p className="mt-1 text-xs text-muted-foreground">{x.author}{x.publication_year?" · "+x.publication_year:""}</p>
        {x.subject&&<p className="mt-2 text-xs font-medium text-primary">{x.subject}</p>}
        {x.description&&<p className="mt-2 line-clamp-4 text-sm leading-5 text-muted-foreground">{x.description}</p>}
        {x.source_url&&<a className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary" href={x.source_url} target="_blank" rel="noreferrer">Publisher / book reference <ExternalLink className="h-3.5 w-3.5"/></a>}
      </article>)}</div>
      {!books.length&&<div className={card+" text-sm text-muted-foreground"}>The catalogue is being prepared. Check the Learning Resources page while the book shelf loads.</div>}
      <Link to="/skills/" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Explore learning resources <ExternalLink className="h-3.5 w-3.5"/></Link>
    </section>}
    {showTravel&&<section><div className="mb-3 flex items-center gap-2"><Map className="h-5 w-5 text-primary"/><h2 className="text-xl font-semibold">African countries</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{countries.map(x=><article className={card} key={x.code}><h3 className="font-semibold">{x.name}</h3><p className="mt-1 text-xs text-muted-foreground">{x.region||"Africa"}</p>{x.official_languages?.length>0&&<p className="mt-2 text-xs text-muted-foreground">Official languages: {x.official_languages.join(", ")}</p>}</article>)}</div></section>}

    {mode==="for-you"&&<section className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Link to="/search?kind=university" className={card+" hover:border-primary/50"}><GraduationCap className="h-5 w-5 text-primary"/><h3 className="mt-2 font-semibold">Learn</h3><p className="mt-1 text-xs text-muted-foreground">Universities, programmes and scholarships.</p></Link><Link to="/work" className={card+" hover:border-primary/50"}><BriefcaseBusiness className="h-5 w-5 text-primary"/><h3 className="mt-2 font-semibold">Work</h3><p className="mt-1 text-xs text-muted-foreground">Jobs, internships and employers.</p></Link><Link to="/build" className={card+" hover:border-primary/50"}><Rocket className="h-5 w-5 text-primary"/><h3 className="mt-2 font-semibold">Build</h3><p className="mt-1 text-xs text-muted-foreground">Startups, companies and skills.</p></Link><Link to="/connect" className={card+" hover:border-primary/50"}><Users className="h-5 w-5 text-primary"/><h3 className="mt-2 font-semibold">Connect</h3><p className="mt-1 text-xs text-muted-foreground">Community and discoverable professionals.</p></Link></section>}
  </main></div>;
};
export default Hub;
