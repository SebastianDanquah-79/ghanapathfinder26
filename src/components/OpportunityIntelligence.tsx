import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, BriefcaseBusiness, GraduationCap, Globe2, Lightbulb, Newspaper, Rocket, Search, Sparkles, Users, Wrench } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

type University = {
  id: string; name: string; slug: string; country: string | null; city: string | null;
  region: string | null; type: string | null; logo_url: string | null;
  top_programmes: string[] | null; short_description: string | null; verified: boolean;
};
type PublicProfile = {
  id: string; full_name: string | null; school: string | null; country_code: string | null;
  target_career: string | null; interests: string[] | null; avatar_url: string | null;
  bio: string | null; city: string | null; github_url: string | null;
  linkedin_url: string | null; portfolio_url: string | null;
};
type NewsItem = { id: string; title: string; excerpt: string | null; original_url: string | null; image_url: string | null; country_code: string | null; category: string | null; published_at: string | null };
type InnovationItem = { id: string; title: string; description: string | null; source_name: string | null; source_url: string | null; published_at: string | null };

const safeCount = async (table: string) => {
  const { count } = await supabase.from(table as never).select("*", { count: "exact", head: true });
  return count ?? 0;
};

const loadDashboard = async () => {
  const results = await Promise.allSettled([
    supabase.from("universities").select("id,name,slug,country,city,region,type,logo_url,top_programmes,short_description,verified").order("name").limit(8),
    safeCount("programmes"), safeCount("scholarships"), safeCount("opportunities"), safeCount("internships"),
    safeCount("companies"), safeCount("african_startups"), safeCount("skills"),
    supabase.from("news_articles").select("id,title,excerpt,original_url,image_url,country_code,category,published_at").order("published_at",{ascending:false}).limit(20),
    supabase.from("innovation_items").select("id,title,description,source_name,source_url,published_at").order("published_at",{ascending:false}).limit(20),
    supabase.from("profiles").select("id,full_name,school,country_code,target_career,interests,avatar_url,bio,city,github_url,linkedin_url,portfolio_url").eq("profile_visibility","public").eq("discoverable_to_recruiters",true).limit(30),
  ]);
  const value = <T,>(i: number, fallback: T): T => results[i]?.status === "fulfilled" ? (results[i] as PromiseFulfilledResult<T>).value : fallback;
  const uniResult = value(0, { data: [], error: null } as { data: University[] | null; error: unknown });
  const newsResult = value(8, { data: [], error: null } as { data: NewsItem[] | null; error: unknown });
  const innovationResult = value(9, { data: [], error: null } as { data: InnovationItem[] | null; error: unknown });
  const profileResult = value(10, { data: [], error: null } as { data: PublicProfile[] | null; error: unknown });
  return {
    universities: uniResult.error ? [] : (uniResult.data ?? []),
    programmes: value(1, 0), scholarships: value(2, 0), opportunities: value(3, 0), internships: value(4, 0),
    companies: value(5, 0), startups: value(6, 0), skills: value(7, 0),
    news: newsResult.error ? [] : (newsResult.data ?? []),
    innovation: innovationResult.error ? [] : (innovationResult.data ?? []),
    profiles: profileResult.error ? [] : (profileResult.data ?? []),
  };
};

const useOpportunityDashboard = () => useQuery({
  queryKey: ["opportunity-dashboard"], queryFn: loadDashboard, staleTime: 5 * 60_000, retry: 1,
});

const Stat = ({ label, value, icon: Icon }: { label: string; value: number; icon: typeof BarChart3 }) => (
  <div className="border border-border bg-card p-4">
    <div className="flex items-center justify-between gap-3"><span className="text-muted-foreground text-sm">{label}</span><Icon className="h-4 w-4 text-muted-foreground" /></div>
    <p className="mt-2 text-2xl font-semibold tracking-tight">{value.toLocaleString()}</p>
  </div>
);

const SectionTitle = ({ icon: Icon, eyebrow, title, description, to }: { icon: typeof BarChart3; eyebrow: string; title: string; description: string; to?: string }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground"><Icon className="h-4 w-4" />{eyebrow}</div><h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p></div>
    {to ? <Button variant="outline" asChild><a href={to}>{title}<ArrowRight className="ml-2 h-4 w-4" /></a></Button> : null}
  </div>
);

export default function OpportunityIntelligence() {
  const { data, isLoading } = useOpportunityDashboard();
  const [studentSearch, setStudentSearch] = useState("");
  const profiles = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    if (!q) return data?.profiles ?? [];
    return (data?.profiles ?? []).filter((p) => [p.full_name,p.school,p.country_code,p.target_career,p.city,...(p.interests ?? [])].filter(Boolean).join(" ").toLowerCase().includes(q));
  }, [data?.profiles, studentSearch]);
  const universities = data?.universities ?? [];
  const countryCounts = universities.reduce<Record<string, number>>((acc, u) => { const key = u.country || "Unknown"; acc[key] = (acc[key] ?? 0) + 1; return acc; }, {});
  const topCountries = Object.entries(countryCounts).sort((a,b)=>b[1]-a[1]).slice(0,6);

  return (
    <section className="border-y border-border bg-muted/20">
      <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <Badge variant="outline">Opportunity platform</Badge>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Education, skills, work and opportunity in one place</h2>
          <p className="mt-3 text-base leading-7 text-muted-foreground">Ghana remains the starting point, while the platform connects African and international universities, skills, jobs, internships, scholarships, companies, startups, news, innovation and opt-in professional discovery.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[["/search","Discover"],["/programmes","Learn"],["/careers","Work"],["/skills","Build skills"],["/scholarships","Fund"],["/community","Community"],["/my-path","My Path"]].map(([to,label]) => <Button key={to} size="sm" variant="outline" asChild><a href={to}>{label}</a></Button>)}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
            <Stat label="Universities" value={isLoading ? 0 : universities.length} icon={GraduationCap} />
            <Stat label="Programmes" value={data?.programmes ?? 0} icon={GraduationCap} />
            <Stat label="Scholarships" value={data?.scholarships ?? 0} icon={Sparkles} />
            <Stat label="Opportunities" value={data?.opportunities ?? 0} icon={BriefcaseBusiness} />
            <Stat label="Internships" value={data?.internships ?? 0} icon={Wrench} />
            <Stat label="Companies" value={data?.companies ?? 0} icon={BriefcaseBusiness} />
            <Stat label="African startups" value={data?.startups ?? 0} icon={Rocket} />
            <Stat label="Skills" value={data?.skills ?? 0} icon={Lightbulb} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Counts are read from the existing database. No placeholder records are inserted.</p>
        </div>

        <div className="space-y-6">
          <SectionTitle icon={GraduationCap} eyebrow="University intelligence" title="Universities at a glance" description="Keep the existing university directory visible while adding images, verification context, programmes and international coverage." to="/search" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {universities.map((u) => (
              <Card key={u.id} className="overflow-hidden border-border shadow-none">
                <div className="aspect-[16/9] bg-muted">{u.logo_url ? <img src={u.logo_url} alt="" loading="lazy" className="h-full w-full object-contain p-8" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">University image unavailable</div>}</div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2"><h3 className="font-semibold leading-5">{u.name}</h3>{u.verified ? <Badge variant="secondary">Verified</Badge> : null}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{[u.city,u.country].filter(Boolean).join(", ") || "Location not listed"}</p>
                  {u.short_description ? <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{u.short_description}</p> : null}
                  <Link className="mt-4 inline-flex items-center text-sm font-medium text-primary" to="/university/$slug" params={{slug:u.slug}}>View university<ArrowRight className="ml-1 h-4 w-4" /></Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
          <Card className="border-border shadow-none">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5" />Data analytics</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-border p-4"><p className="text-xs text-muted-foreground">Countries represented</p><p className="mt-1 text-2xl font-semibold">{Object.keys(countryCounts).length}</p></div>
                <div className="border border-border p-4"><p className="text-xs text-muted-foreground">Public student profiles</p><p className="mt-1 text-2xl font-semibold">{data?.profiles.length ?? 0}</p></div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Universities by country in the current catalogue</p>
                {topCountries.length ? topCountries.map(([country,count]) => (
                  <div key={country}><div className="mb-1 flex justify-between text-xs"><span>{country}</span><span>{count}</span></div><div className="h-2 bg-muted"><div className="h-full bg-primary" style={{width: Math.max(8,(count/(topCountries[0]?.[1] ?? 1))*100) + "%"}} /></div></div>
                )) : <p className="text-sm text-muted-foreground">Analytics will appear as catalogue data is available.</p>}
              </div>
              <div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link to="/admin/analytics">Platform analytics</Link></Button><Button variant="outline" asChild><Link to="/search">Explore catalogue</Link></Button></div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-none">
            <CardHeader><CardTitle className="flex items-center gap-2"><Globe2 className="h-5 w-5" />Global coverage</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>International discovery is layered onto the existing Ghana directory. Existing country and university records remain the source of truth.</p>
              <div className="grid grid-cols-2 gap-2">{["WASSCE","BECE","WAEC","NECO","JAMB / UTME","KCSE","NSC","UCE / UACE","CSEE / ACSEE","GCSE","A-Levels","IB","SAT","ACT","AP"].map((exam) => <Badge key={exam} variant="outline" className="justify-center py-1.5">{exam}</Badge>)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6" id="international-students">
          <SectionTitle icon={Users} eyebrow="Community" title="International student directory" description="A privacy-first, opt-in directory for people who explicitly make their profile public and discoverable. Private profiles never appear here." to="/community" />
          <div className="max-w-xl"><div className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input value={studentSearch} onChange={(e)=>setStudentSearch(e.target.value)} placeholder="Search country, university, field or interest" className="pl-9" /></div></div>
          {profiles.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{profiles.slice(0,9).map((p) => (
            <Card key={p.id} className="border-border shadow-none"><CardContent className="flex gap-3 p-4">
              {p.avatar_url ? <img src={p.avatar_url} alt="" className="h-11 w-11 rounded-full object-cover" /> : <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">{(p.full_name || "S").slice(0,1).toUpperCase()}</div>}
              <div className="min-w-0"><p className="font-medium">{p.full_name || "GhanaPathFinder member"}</p><p className="text-xs text-muted-foreground">{[p.school,p.country_code].filter(Boolean).join(" · ")}</p>{p.target_career ? <p className="mt-1 text-sm">{p.target_career}</p> : null}{p.interests?.length ? <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.interests.slice(0,4).join(" · ")}</p> : null}<div className="mt-2 flex gap-3 text-xs">{p.github_url ? <a href={p.github_url} target="_blank" rel="noreferrer" className="text-primary">GitHub</a> : null}{p.linkedin_url ? <a href={p.linkedin_url} target="_blank" rel="noreferrer" className="text-primary">LinkedIn</a> : null}{p.portfolio_url ? <a href={p.portfolio_url} target="_blank" rel="noreferrer" className="text-primary">Portfolio</a> : null}</div></div>
            </CardContent></Card>
          ))}</div> : <Card className="border-dashed border-border shadow-none"><CardContent className="p-6 text-sm text-muted-foreground">No public student profiles are currently available. Students can enable public discovery from their profile settings.</CardContent></Card>}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border shadow-none"><CardHeader><CardTitle className="flex items-center gap-2"><Newspaper className="h-5 w-5" />Latest Africa and global news</CardTitle></CardHeader><CardContent className="space-y-3">
            {(data?.news ?? []).slice(0,8).map((item)=><a key={item.id} href={item.original_url || undefined} target={item.original_url ? "_blank" : undefined} rel="noreferrer" className="block border-b border-border pb-3 last:border-0"><p className="font-medium text-sm">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{[item.country_code,item.category].filter(Boolean).join(" · ")}</p></a>)}
            {!data?.news?.length ? <p className="text-sm text-muted-foreground">No verified news records are available right now.</p> : null}
          </CardContent></Card>
          <Card className="border-border shadow-none"><CardHeader><CardTitle className="flex items-center gap-2"><Rocket className="h-5 w-5" />Innovation and builders</CardTitle></CardHeader><CardContent className="space-y-3">
            {(data?.innovation ?? []).slice(0,8).map((item)=><a key={item.id} href={item.source_url || undefined} target={item.source_url ? "_blank" : undefined} rel="noreferrer" className="block border-b border-border pb-3 last:border-0"><p className="font-medium text-sm">{item.title}</p><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{item.description || item.source_name || "Verified innovation item"}</p></a>)}
            {!data?.innovation?.length ? <p className="text-sm text-muted-foreground">No verified innovation records are available right now.</p> : null}
          </CardContent></Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[{icon:BriefcaseBusiness,title:"Work",text:"Jobs, internships, apprenticeships, remote work, applications and employer discovery.",to:"/careers"},{icon:Lightbulb,title:"Skills",text:"Skills, learning resources, projects and career pathways that continue after admission season.",to:"/skills"},{icon:Rocket,title:"Build",text:"Startups, innovation, competitions, funding and communities for African builders.",to:"/community"}].map(({icon:Icon,title,text,to})=>(
            <Card key={title} className="border-border shadow-none"><CardContent className="p-5"><Icon className="h-5 w-5" /><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-1 text-sm text-muted-foreground">{text}</p><Button className="mt-4" variant="outline" asChild><a href={to}>Explore<ArrowRight className="ml-2 h-4 w-4" /></a></Button></CardContent></Card>
          ))}
        </div>
      </div>
    </section>
  );
}
