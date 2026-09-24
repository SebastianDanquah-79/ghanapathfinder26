import { useQuery } from "@tanstack/react-query";
import { Link } from "@/lib/router-compat";
import { BarChart3, GraduationCap } from "@/lib/icons";
import { supabase } from "@/integrations/supabase/client";

const Overview = () => {
  const stats = useQuery({ queryKey:["platform_stats"], queryFn: async()=>{ const {data,error}=await supabase.rpc("platform_stats"); if(error) throw error; return data as any; }, staleTime:300000 });
  const universities = useQuery({ queryKey:["homepage_universities"], queryFn: async()=>{ const {data}=await supabase.from("universities").select("id,name,slug,country,logo_url,verified").order("name").limit(8); return data ?? []; }, staleTime:300000 });
  const students = useQuery({ queryKey:["public_directory_preview"], queryFn: async()=>{ const {data}=await supabase.from("directory_profiles").select("user_id,display_name,country,university,programme,field,skills,avatar_url:portfolio_url").eq("visibility","public").limit(6); return data ?? []; }, staleTime:300000 });

  return <section className="border-y border-border bg-secondary/10 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.16em] text-primary font-semibold">Opportunity platform</p><h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">More than admissions</h2><p className="text-sm text-muted-foreground mt-2 max-w-2xl">Explore universities, skills, work, funding, startups, innovation and an opt-in international student community from the same platform.</p></div>
        <div className="flex flex-wrap gap-2"><Link to="/opportunities" className="px-3 py-2 rounded-lg border border-border text-sm font-medium">Opportunities</Link><Link to="/students" className="px-3 py-2 rounded-lg border border-border text-sm font-medium">Students</Link><Link to="/international-universities" className="px-3 py-2 rounded-lg border border-border text-sm font-medium">International universities</Link></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
        {[
          ["Universities",stats.data?.universities],["Programmes",stats.data?.programmes],["Scholarships",stats.data?.scholarships],["Internships",stats.data?.internships],
          ["Companies",stats.data?.companies],["Opportunities",stats.data?.opportunities],["Countries",stats.data?.countries],["Public profiles",stats.data?.directory_members]
        ].map(([label,value])=><div key={String(label)} className="border border-border bg-background p-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="text-xl font-semibold mt-1">{Number(value ?? 0).toLocaleString("en-GB")}</p></div>)}
      </div>
      <div className="grid lg:grid-cols-[1.4fr_.6fr] gap-6">
        <div><div className="flex items-center justify-between mb-3"><h3 className="font-semibold flex items-center gap-2"><GraduationCap className="h-4 w-4"/>University intelligence</h3><Link to="/search?kind=university" className="text-xs font-medium text-primary">View directory</Link></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{(universities.data ?? []).map((u)=><a key={u.id} href={`/university/${u.slug}`} className="border border-border bg-background overflow-hidden"><div className="aspect-[16/9] bg-secondary flex items-center justify-center">{u.logo_url?<img src={u.logo_url} alt="" loading="lazy" className="h-full w-full object-contain p-5"/>:<GraduationCap className="h-8 w-8 text-muted-foreground"/>}</div><div className="p-3"><p className="text-sm font-semibold line-clamp-2">{u.name}</p><p className="text-[11px] text-muted-foreground mt-1">{u.country || "Ghana"}{u.verified?" · Verified":""}</p></div></a>)}</div>
        </div>
        <div className="space-y-3"><div className="border border-border bg-background p-4"><BarChart3 className="h-5 w-5 text-primary"/><h3 className="font-semibold mt-2">Data analytics</h3><p className="text-xs text-muted-foreground mt-1">Live catalogue counts and university coverage, using existing records only.</p><Link to="/insights" className="inline-block mt-3 text-xs font-semibold text-primary">Open insights</Link></div>
          <div className="border border-border bg-background p-4"><span className="h-5 w-5 text-primary flex items-center justify-center">•</span><h3 className="font-semibold mt-2">International students</h3><p className="text-xs text-muted-foreground mt-1">{students.data?.length ?? 0} public profiles currently visible in the preview.</p><Link to="/students" className="inline-block mt-3 text-xs font-semibold text-primary">Open directory</Link></div>
          <div className="border border-border bg-background p-4"><span className="h-5 w-5 text-primary flex items-center justify-center">•</span><h3 className="font-semibold mt-2">Global education</h3><p className="text-xs text-muted-foreground mt-1">Ghana, Africa and international university discovery without removing the existing Ghana catalogue.</p><Link to="/international-universities" className="inline-block mt-3 text-xs font-semibold text-primary">Explore universities</Link></div>
        </div>
      </div>
    </div>
  </section>;
};
export default Overview;
