import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const sb: any = supabase;
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import MobileTabBar from "@/components/MobileTabBar";
import Footer from "@/components/Footer";
import { Briefcase, Building2, GraduationCap, Bell, Search, Rocket, Users, BookOpen, Globe, ArrowRight } from "@/lib/icons";
import { curatedNews, curatedOpportunities, curatedVideos } from "@/data/curatedContent";
import { EMPLOYERS } from "@/data/employers";

type Row = any;
const shell = "min-h-dvh bg-background text-foreground";
const card = "rounded-xl border border-border bg-card p-5";
const ButtonLink = ({ to, children }: { to: string; children: React.ReactNode }) => <Link to={to} className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">{children}</Link>;

function Layout({ children, title }: { children: React.ReactNode; title: string }) {
  useEffect(() => { document.title = `${title} | GhanaPathFinder`; }, [title]);
  return <div className={shell}><Navbar /><main className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8">{children}</main><MobileTabBar /><Footer /></div>;
}

export function RoleWelcome() {
  const navigate = useNavigate();
  const roles = [
    { id: "student", title: "Student", text: "Universities, scholarships, careers and learning opportunities.", icon: GraduationCap, directory: "/student-directory" },
    { id: "employee", title: "Job Seeker", text: "Find jobs, internships, fellowships and skills to close your gaps.", icon: Briefcase, directory: "/employee-directory" },
    { id: "employer", title: "Employer", text: "Post opportunities and discover opted-in African talent.", icon: Building2, directory: "/employer-directory" },
    { id: "startup_founder", title: "Startup Founder", text: "Funding, accelerators, networks and African startup intelligence.", icon: Rocket, directory: "/startup-directory" },
  ];
  return <div className={shell}><main className="mx-auto flex min-h-dvh max-w-5xl flex-col justify-center px-5 py-10">
    <div className="mb-10"><Link to="/" className="text-lg font-bold">Ghana<span className="text-primary">PathFinder</span></Link><p className="mt-8 text-sm font-semibold text-primary">BUILT FOR AFRICA. CONNECTED TO THE WORLD.</p><h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">Choose the path that fits you.</h1><p className="mt-4 max-w-2xl text-muted-foreground">Your choice personalizes the platform. You can change it later.</p></div>
    <div className="grid gap-4 sm:grid-cols-2">{roles.map(({id,title,text,icon:Icon,directory})=><div key={id} className={card+" text-left transition hover:border-primary"}><button className="w-full text-left" onClick={()=>{localStorage.setItem("selectedRole",id);navigate({to:"/auth",search:{role:id}} as never)}}><Icon className="h-7 w-7 text-primary"/><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm text-muted-foreground">{text}</p><span className="mt-5 inline-block text-sm font-semibold text-primary">Continue →</span></button><Link to={directory} className="mt-3 inline-block text-sm font-semibold text-foreground underline underline-offset-4">Open {title.toLowerCase()} directory</Link></div>)}</div>
    <p className="mt-8 text-center text-sm text-muted-foreground">Already have an account? <Link className="font-semibold text-primary" to="/auth">Sign in</Link></p>
  </main></div>;
}

function DataList({ table, title, filters }: { table: "opportunities"|"news_articles"; title: string; filters?: string[] }) {
  const [filter,setFilter]=useState("All");
  const {data=[],isLoading,error}=useQuery({queryKey:[table,filter],queryFn:async()=>{
    const query = table==="opportunities" ? sb.from("opportunities").select("*").eq("status","active").order("created_at",{ascending:false}).limit(50) : sb.from("news_articles").select("*").order("published_at",{ascending:false}).limit(50);
    const {data,error}=await query; if(error) throw error; return (data??[]) as Row[];
  }});
  const curated = table === "news_articles" ? curatedNews : curatedOpportunities;
  const careerPortals = table === "opportunities" ? EMPLOYERS.slice(0, 60).map((e) => ({
    id: "career-portal-" + e.id,
    title: "Career opportunities at " + e.name,
    description: "Official career and opportunity source for " + e.name + ". Check the organisation's current vacancies, internship, graduate and national-service postings.",
    excerpt: "Official career and opportunity source. Verify the current vacancy and deadline on the employer's own site.",
    category: "career-source",
    source_name: e.name,
    original_url: e.url,
    published_at: undefined,
  })) : [];
  const combined = useMemo(() => [
    ...careerPortals,
    ...curated.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      excerpt: r.description,
      category: r.category,
      source_name: r.source,
      original_url: r.url,
      published_at: r.publishedAt,
    })),
    ...data,
  ], [data, table, careerPortals]);
  const filtered=useMemo(()=>filter==="All"?combined:combined.filter(r=>String(r.category??r.type??"").toLowerCase()===filter.toLowerCase()),[combined,filter]);
  return <Layout title={title}><div className="flex flex-col gap-5"><div><p className="text-sm font-semibold text-primary">{title==="News"?"KNOWLEDGE":"OPPORTUNITIES"}</p><h1 className="mt-1 text-3xl font-bold">{title}</h1><p className="mt-2 text-muted-foreground">Fresh source-linked opportunities and news. Career portal entries link directly to the employer source and do not guarantee an active vacancy.</p></div>
    {filters&&<div className="flex gap-2 overflow-x-auto pb-1">{filters.map(f=><button key={f} onClick={()=>setFilter(f)} className={`rounded-full border px-4 py-2 text-sm whitespace-nowrap ${filter===f?"border-primary bg-primary text-primary-foreground":"border-border"}`}>{f}</button>)}</div>}
    {isLoading?<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><div key={i} className={card+" h-40 animate-pulse"}/>)}</div>:error?<div className={card}>We could not load this data right now. Please refresh.</div>:filtered.length===0?<div className={card}>No {title.toLowerCase()} are available yet.</div>:<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map((r,i)=><article key={String(r.id??i)} className={card}><p className="text-xs font-semibold uppercase text-primary">{String(r.category??r.type??"Opportunity")}</p><h2 className="mt-2 font-semibold">{String(r.title??"Untitled")}</h2><p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{String(r.excerpt??r.description??"")}</p><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{String(r.source_name??r.company_name??"GhanaPathFinder")}</span>{(r.original_url||r.apply_url||r.application_url)&&<a className="font-semibold text-primary" href={String(r.original_url??r.apply_url??r.application_url)} target="_blank" rel="noreferrer">Open →</a>}</div></article>)}</div>}</div></Layout>;
}
export const Opportunities=()=> <DataList table="opportunities" title="Opportunities" filters={["All","job","internship","fellowship","grant"]}/>;
export const News=()=> <DataList table="news_articles" title="News" filters={["All","Tech","Startup","Business","Politics","Education","Health","Entertainment"]}/>;

export function Leaders(){
  const [q,setQ]=useState("");
  const {data=[],isLoading}=useQuery({queryKey:["africa_leaders"],queryFn:async()=>{const {data,error}=await sb.from("africa_leaders").select("*").order("country_name");if(error)throw error;return (data??[]) as Row[];}});
  const rows=data.filter(r=>`${r.country_name??""} ${r.name??""}`.toLowerCase().includes(q.toLowerCase()));
  return <Layout title="Leaders of Africa"><div><p className="text-sm font-semibold text-primary">PAN-AFRICAN KNOWLEDGE</p><h1 className="mt-1 text-3xl font-bold">Leaders of Africa</h1><p className="mt-2 text-muted-foreground">Country, office and source-backed public leadership information.</p><div className="relative mt-6 max-w-xl"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground"/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search country or leader" className="w-full rounded-lg border border-border bg-background py-2.5 pl-9 pr-3"/></div></div>
  {isLoading?<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3].map(i=><div className={card+" h-32 animate-pulse"} key={i}/>)}</div>:rows.length===0?<div className={card+" mt-6"}>No leaders match your search.</div>:<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.map((r,i)=><article className={card} key={String(r.id??i)}><div className="flex items-start gap-3"><Globe className="mt-1 h-5 w-5 text-primary"/><div><h2 className="font-semibold">{String(r.name??"")}</h2><p className="text-sm text-muted-foreground">{String(r.country_name??"")} · {String(r.title??r.role??"")}</p><p className="mt-2 text-sm">{String(r.biography??"")}</p>{r.official_source_url&&<a className="mt-3 inline-block text-xs font-semibold text-primary" href={String(r.official_source_url)} target="_blank" rel="noreferrer">Source →</a>}</div></div></article>)}</div>}</Layout>;
}

export function Feed(){
  const [category,setCategory]=useState("All");
  const {data=[]}=useQuery({queryKey:["feed_posts",category],queryFn:async()=>{const {data,error}=await sb.from("feed_posts").select("*").eq("is_published",true).order("created_at",{ascending:false}).limit(20);if(error)throw error;return (data??[]) as Row[];}});
  const curated = curatedVideos.map((v) => ({
    ...v,
    video_url: v.url,
    source_name: v.source,
  }));
  const allPosts = [...curated, ...data];
  const posts = category==="All" ? allPosts : allPosts.filter((p) => String(p.category ?? "").toLowerCase() === category.toLowerCase());
  return <Layout title="Innovation Feed"><div><p className="text-sm font-semibold text-primary">INNOVATION FEED</p><h1 className="mt-1 text-3xl font-bold">Watch what people are building.</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Curated technology, AI and robotics videos from YouTube, TikTok and Facebook, alongside GhanaPathFinder community posts.</p><div className="mt-4 flex gap-2 overflow-x-auto">{["All","AI","Robotics","Innovation","Education","Startup","Science","Culture","Ghana"].map(c=><button key={c} onClick={()=>setCategory(c)} className={`rounded-full border px-4 py-2 text-sm ${category===c?"bg-primary text-primary-foreground":"border-border"}`}>{c}</button>)}</div></div><div className="mt-6 grid gap-5 lg:grid-cols-2">{posts.map((p,i)=>{const raw=String(p.video_url??p.youtube_url??""); const yt=raw.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/); return <article className={card+" overflow-hidden p-0"} key={String(p.id??i)}>{raw&&yt?<div className="aspect-video bg-muted"><iframe className="h-full w-full" src={"https://www.youtube.com/embed/"+yt[1]} title={String(p.title??"Video")} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/></div>:<div className="grid aspect-video place-items-center bg-muted"><a href={raw||"#"} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">Open video →</a></div>}<div className="p-5"><h2 className="font-semibold">{String(p.title??"Innovation story")}</h2><p className="mt-2 text-sm text-muted-foreground">{String(p.description??"")}</p><div className="mt-3 flex flex-col gap-1 text-xs text-muted-foreground"><span>{String(p.source_name??"GhanaPathFinder")}</span>{raw&&<a href={raw} target="_blank" rel="noreferrer" className="break-all text-primary underline underline-offset-2">{raw}</a>}</div></div></article>})}</div>{posts.length===0&&<div className={card+" mt-6"}>No published videos are available yet.</div>}</Layout>;
}

export function Notifications(){
  const {user}=useAuth();
  const {data=[],refetch}=useQuery({queryKey:["notifications",user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await sb.from("notifications").select("*").eq("user_id",user!.id).order("created_at",{ascending:false}).limit(50);if(error)throw error;return (data??[]) as Row[];}});
  const mark=async()=>{if(!user)return;const {error}=await sb.from("notifications").update({is_read:true,read:true}).eq("user_id",user.id);if(error){alert(error.message);return;}await refetch();};
  if(!user)return <Layout title="Notifications"><div className={card}>Sign in to view notifications.</div></Layout>;
  return <Layout title="Notifications"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-primary">UPDATES</p><h1 className="text-3xl font-bold">Notifications</h1></div><button onClick={mark} className="text-sm font-semibold text-primary">Mark all read</button></div><div className="mt-6 space-y-3">{data.length===0?<div className={card}>You're all caught up.</div>:data.map((n,i)=><Link to={String(n.action_url??"/")} key={String(n.id??i)} className={card+" block hover:border-primary"}><div className="flex gap-3"><Bell className="mt-1 h-5 w-5 text-primary"/><div><h2 className="font-semibold">{String(n.title??"Notification")}</h2><p className="mt-1 text-sm text-muted-foreground">{String(n.body??n.message??"")}</p></div></div></Link>)}</div></Layout>;
}

function RoleDashboard({role,title,description}:{role:"employee"|"employer"|"startup_founder";title:string;description:string}){
  const {user,loading}=useAuth();
  const navigate=useNavigate();
  useEffect(()=>{if(!loading&&!user){navigate(`/auth?next=${encodeURIComponent(window.location.pathname+window.location.search)}`,{replace:true});}},[loading,user,navigate]);
  const [form,setForm]=useState({title:"",company:"",url:"",type:"job"});
  const [roleForm,setRoleForm]=useState({name:"",secondary:"",stage:"",url:""});
  const [savingRole,setSavingRole]=useState(false);
  const {data:profile}=useQuery({queryKey:["profile",user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await sb.from("profiles").select("*").eq("id",user!.id).maybeSingle();if(error)throw error;return data as Row|null;}});
  const {data:opps=[]}=useQuery({queryKey:["role-opportunities"],queryFn:async()=>{const {data,error}=await sb.from("opportunities").select("*").eq("status","active").order("created_at",{ascending:false}).limit(12);if(error)throw error;return (data??[]) as Row[];}});
  const profileTable = role==="employee" ? "employee_profiles" : role==="employer" ? "employer_profiles" : "founder_profiles";
  const {data:roleProfile}=useQuery({queryKey:["role-profile",role,user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await sb.from(profileTable).select("*").eq("user_id",user!.id).maybeSingle();if(error)throw error;return data as Row|null;}});
  useEffect(()=>{if(!roleProfile)return; if(role==="employee") setRoleForm({name:String(roleProfile.professional_title??""),secondary:String(roleProfile.employer_name??""),stage:String(roleProfile.years_experience??""),url:""}); else if(role==="employer") setRoleForm({name:String(roleProfile.organization_name??""),secondary:String(roleProfile.organization_type??""),stage:Array.isArray(roleProfile.hiring_focus)?roleProfile.hiring_focus.join(", "):"",url:""}); else setRoleForm({name:String(roleProfile.startup_name??""),secondary:String(roleProfile.sector??""),stage:String(roleProfile.stage??""),url:String(roleProfile.website_url??"")});},[roleProfile,role]);
  const saveRoleProfile=async()=>{if(!user)return;setSavingRole(true);let payload:Row={user_id:user.id}; if(role==="employee") payload={...payload,professional_title:roleForm.name||null,employer_name:roleForm.secondary||null,years_experience:roleForm.stage?Number(roleForm.stage):null}; else if(role==="employer") payload={...payload,organization_name:roleForm.name||null,organization_type:roleForm.secondary||null,hiring_focus:roleForm.stage.split(",").map((x:string)=>x.trim()).filter(Boolean)}; else payload={...payload,startup_name:roleForm.name||null,sector:roleForm.secondary||null,stage:roleForm.stage||null,website_url:roleForm.url||null}; const {error}=await sb.from(profileTable).upsert(payload,{onConflict:"user_id"});setSavingRole(false);if(error){alert(error.message);return;} };
  const post=async()=>{if(role!=="employer"||!user||!form.title.trim())return;const { error } = await sb.from("opportunities").insert({title:form.title.trim(),company_name:form.company||String(profile?.full_name??"Employer"),application_url:form.url||null,apply_url:form.url||null,type:form.type,opportunity_type:form.type,is_active:true,status:"active",posted_by:user.id,country:"Ghana",source:"manual"});if(error){alert(error.message);return;}setForm({title:"",company:"",url:"",type:"job"});};
  return <Layout title={title}><div><p className="text-sm font-semibold text-primary">{role==="employee"?"CAREER":"PLATFORM"}</p><h1 className="mt-1 text-3xl font-bold">{title}</h1><p className="mt-2 text-muted-foreground">{description}</p></div>
    <section className={card+" mt-6"}><div className="flex items-center justify-between gap-3"><div><h2 className="font-semibold">{role==="employee"?"Professional profile":role==="employer"?"Organisation profile":"Startup profile"}</h2><p className="mt-1 text-xs text-muted-foreground">This information is saved to your GhanaPathFinder account.</p></div><button onClick={saveRoleProfile} disabled={savingRole} className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">{savingRole?"Saving...":"Save profile"}</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={roleForm.name} onChange={e=>setRoleForm({...roleForm,name:e.target.value})} placeholder={role==="employee"?"Professional title":role==="employer"?"Organisation name":"Startup name"} className="rounded-lg border border-border bg-background px-3 py-2"/><input value={roleForm.secondary} onChange={e=>setRoleForm({...roleForm,secondary:e.target.value})} placeholder={role==="employee"?"Employer":role==="employer"?"Organisation type":"Sector"} className="rounded-lg border border-border bg-background px-3 py-2"/><input value={roleForm.stage} onChange={e=>setRoleForm({...roleForm,stage:e.target.value})} placeholder={role==="employee"?"Years of experience":role==="employer"?"Hiring focus, comma separated":"Startup stage"} className="rounded-lg border border-border bg-background px-3 py-2"/>{role==="startup_founder"&&<input value={roleForm.url} onChange={e=>setRoleForm({...roleForm,url:e.target.value})} placeholder="Startup website" className="rounded-lg border border-border bg-background px-3 py-2"/>}</div></section>
    {role==="employer"&&<section className={card+" mt-6"}><h2 className="font-semibold">Post a job or internship</h2><div className="mt-4 grid gap-3 sm:grid-cols-2"><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Role title" className="rounded-lg border border-border bg-background px-3 py-2"/><input value={form.company} onChange={e=>setForm({...form,company:e.target.value})} placeholder="Company" className="rounded-lg border border-border bg-background px-3 py-2"/><select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="rounded-lg border border-border bg-background px-3 py-2"><option value="job">Job</option><option value="internship">Internship</option><option value="fellowship">Fellowship</option></select><input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="Application URL" className="rounded-lg border border-border bg-background px-3 py-2"/></div><button onClick={post} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Publish opportunity</button></section>}
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><section className={card}><Briefcase className="h-6 w-6 text-primary"/><h2 className="mt-3 font-semibold">{role==="employee"?"Recommended for you":"Active opportunities"}</h2><p className="mt-2 text-sm text-muted-foreground">{opps.length} live opportunities available.</p><ButtonLink to="/opportunities">Browse opportunities</ButtonLink></section><section className={card}><BookOpen className="h-6 w-6 text-primary"/><h2 className="mt-3 font-semibold">News</h2><p className="mt-2 text-sm text-muted-foreground">Follow the latest African business and technology developments.</p><ButtonLink to="/news">Open news</ButtonLink></section><section className={card}><Users className="h-6 w-6 text-primary"/><h2 className="mt-3 font-semibold">{role==="employer"?"Candidate discovery":"Skills gap"}</h2><p className="mt-2 text-sm text-muted-foreground">Use GhanaPathFinder's own opted-in network and existing skills tools.</p><ButtonLink to={role==="employee"?"/skills":"/search"}>Explore</ButtonLink></section><section className={card}><BookOpen className="h-6 w-6 text-primary"/><h2 className="mt-3 font-semibold">CV Builder</h2><p className="mt-2 text-sm text-muted-foreground">Create a clean CV and print it to PDF when you are ready to apply.</p><ButtonLink to="/cv-builder">Build your CV</ButtonLink></section></div>
    {role==="startup_founder"&&<section className={card+" mt-6"}><h2 className="font-semibold">Founder resources</h2><div className="mt-3 grid gap-3 sm:grid-cols-3"><a href="https://www.ycombinator.com/apply" target="_blank" rel="noreferrer" className="rounded-lg border border-border p-4 text-sm">Y Combinator</a><a href="https://www.mestafrica.com/" target="_blank" rel="noreferrer" className="rounded-lg border border-border p-4 text-sm">MEST Africa</a><a href="https://www.tonyelumelufoundation.org/" target="_blank" rel="noreferrer" className="rounded-lg border border-border p-4 text-sm">Tony Elumelu Foundation</a></div></section>}</Layout>;
}
export function StudentDashboard(){
  const {user}=useAuth();
  const {data:universities=[]}=useQuery({queryKey:["student-universities"],queryFn:async()=>{const {data,error}=await sb.from("universities").select("id,name,short_name,location,region,slug,verified").order("name").limit(12);if(error)throw error;return data??[];}});
  const {data:programmes=[]}=useQuery({queryKey:["student-programmes"],queryFn:async()=>{const {data,error}=await sb.from("programmes").select("id,name,slug,degree_type,field,university_id").order("name").limit(12);if(error)throw error;return data??[];}});
  const {data:saved=[]}=useQuery({queryKey:["student-saved",user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await sb.from("saved_items").select("*").eq("user_id",user!.id).order("created_at",{ascending:false}).limit(20);if(error)throw error;return data??[];}});
  return <Layout title="Student Dashboard"><div><p className="text-sm font-semibold text-primary">EDUCATION</p><h1 className="mt-1 text-3xl font-bold">Student Dashboard</h1><p className="mt-2 text-muted-foreground">Universities, programmes, scholarships, admissions and your saved choices.</p></div>
    <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4"><section className={card}><GraduationCap className="h-6 w-6 text-primary"/><h2 className="mt-3 font-semibold">Universities</h2><p className="mt-2 text-sm text-muted-foreground">{universities.length} institutions loaded from the catalogue.</p><ButtonLink to="/search?kind=university">Explore universities</ButtonLink></section><section className={card}><BookOpen className="h-6 w-6 text-primary"/><h2 className="mt-3 font-semibold">Programmes</h2><p className="mt-2 text-sm text-muted-foreground">{programmes.length} programmes available in the student catalogue.</p><ButtonLink to="/programmes">Find programmes</ButtonLink></section><section className={card}><Briefcase className="h-6 w-6 text-primary"/><h2 className="mt-3 font-semibold">Scholarships</h2><p className="mt-2 text-sm text-muted-foreground">Find funding opportunities and keep deadlines in one place.</p><ButtonLink to="/scholarships">Find scholarships</ButtonLink></section><section className={card}><BookmarkIcon/><h2 className="mt-3 font-semibold">Saved choices</h2><p className="mt-2 text-sm text-muted-foreground">{saved.length} saved items.</p><ButtonLink to="/saved">View saved</ButtonLink></section></div>
    <section className={card+" mt-6"}><h2 className="font-semibold">University directory</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{universities.slice(0,6).map((u:any)=><Link key={u.id} to={`/university/${u.slug}`} className="rounded-lg border border-border p-4 hover:border-primary"><p className="font-medium">{u.short_name||u.name}</p><p className="mt-1 text-xs text-muted-foreground">{u.location||u.region||"Ghana"}</p></Link>)}</div></section>
  </Layout>;
}
const BookmarkIcon=()=> <span className="inline-flex h-6 w-6 items-center justify-center text-primary">☆</span>;

export const EmployeeDashboard=()=> <RoleDashboard role="employee" title="Job Seeker Dashboard" description="Jobs, internships, fellowships and practical next steps matched to your profile."/>;
export const EmployerDashboard=()=> <RoleDashboard role="employer" title="Employer Dashboard" description="Post opportunities and discover opted-in talent on GhanaPathFinder."/>;
export const FounderDashboard=()=> <RoleDashboard role="startup_founder" title="Startup Founder Dashboard" description="Funding, accelerators, networks and African startup intelligence."/>;

export function Profile(){
  const {user}=useAuth();
  const [saving,setSaving]=useState(false);
  const [name,setName]=useState("");
  const [linkedin,setLinkedin]=useState("");
  const [discoverable,setDiscoverable]=useState(false);
  const [title,setTitle]=useState("");
  const [skills,setSkills]=useState("");
  const {data}=useQuery({queryKey:["profile-page",user?.id],enabled:!!user,queryFn:async()=>{const {data,error}=await sb.from("profiles").select("*").eq("id",user!.id).maybeSingle();if(error)throw error;return data as Row|null;}});
  useEffect(()=>{if(data){setName(String(data.full_name??""));setLinkedin(String(data.linkedin_url??""));setDiscoverable(Boolean(data.discoverable_to_recruiters));setTitle(String(data.target_career??""));setSkills(Array.isArray(data.interests)?data.interests.join(", "):"");}},[data]);
  const save=async()=>{if(!user)return;setSaving(true);
    const interestList=skills.split(",").map((x:string)=>x.trim()).filter(Boolean);
    const {error}=await sb.from("profiles").upsert({id:user.id,full_name:name,onboarded:true,linkedin_url:linkedin||null,target_career:title||null,interests:interestList,discoverable_to_recruiters:discoverable,profile_visibility:discoverable?"public":"private"},{onConflict:"id"});
    if(error){setSaving(false);alert(error.message);return;}
    const {error:talentError}=await sb.from("talent_directory").upsert({user_id:user.id,full_name:name||null,professional_title:title||null,linkedin_url:linkedin||null,skills:interestList,discoverable,updated_at:new Date().toISOString()},{onConflict:"user_id"});
    setSaving(false);
    if(talentError)alert(talentError.message);else location.reload();
  };
  if(!user)return <Layout title="Profile"><div className={card}>Sign in to manage your profile.</div></Layout>;
  return <Layout title="Profile"><div className="max-w-2xl"><h1 className="text-3xl font-bold">Your professional profile</h1><p className="mt-2 text-muted-foreground">Control what employers can discover and keep your professional links current.</p><section className={card+" mt-6 space-y-4"}><div><label className="text-sm font-medium">Full name</label><input value={name} onChange={e=>setName(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2"/></div><div><label className="text-sm font-medium">Professional title / target career</label><input value={title} onChange={e=>setTitle(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="e.g. Software Engineer"/></div><div><label className="text-sm font-medium">Skills or interests</label><input value={skills} onChange={e=>setSkills(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="Python, React, data analysis"/></div><div><label className="text-sm font-medium">Public LinkedIn URL</label><input value={linkedin} onChange={e=>setLinkedin(e.target.value)} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2" placeholder="https://www.linkedin.com/in/..."/></div><label className="flex items-start gap-3 rounded-lg border border-border p-4"><input type="checkbox" checked={discoverable} onChange={e=>setDiscoverable(e.target.checked)} className="mt-1"/><span><span className="block text-sm font-medium">Allow recruiter discovery</span><span className="mt-1 block text-xs text-muted-foreground">Only the public fields above are copied to the recruiter directory. Private account fields remain private.</span></span></label><button disabled={saving} onClick={save} className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">{saving?"Saving...":"Save profile"}</button></section></div></Layout>;
}


const sectionItems = {
  employee: [
    ["Employee Directory", "/employee-directory"], ["Careers", "/careers"], ["Career Path", "/career-path"], ["Skills", "/skills"], ["Internships", "/internships"],
    ["Opportunities", "/opportunities"], ["Profile", "/profile"], ["Applications", "/applications"], ["Saved items", "/saved"],
    ["My Path", "/my-path"], ["Match preferences", "/preferences"], ["Search", "/search"], ["Community", "/community"],
    ["Innovation Feed", "/feed"], ["News", "/news"], ["Leaders", "/leaders"], ["Scholarships", "/scholarships"],
    ["Scholarship Matcher", "/matcher"], ["Compare scholarships", "/compare-scholarships"], ["Admission Match", "/admission-match"], ["Professional Councils", "/professional-councils"],
  ],
  student: [
    ["Student Directory", "/student-directory"], ["Universities", "/search?kind=university"], ["Programmes", "/programmes"], ["Compare institutions", "/compare"], ["Search", "/search"],
    ["Scholarships", "/scholarships"], ["Scholarship Matcher", "/matcher"], ["Compare scholarships", "/compare-scholarships"], ["Admission Match", "/admission-match"],
    ["My Path", "/my-path"], ["Applications", "/applications"], ["Saved items", "/saved"], ["Careers", "/careers"],
    ["Career Path", "/career-path"], ["Skills", "/skills"], ["Internships", "/internships"], ["Community", "/community"],
    ["Innovation Feed", "/feed"], ["News", "/news"], ["Leaders", "/leaders"], ["Parent Support", "/parent"],
  ],
  startup: [
    ["Startup Dashboard", "/dashboard/founder"], ["Startup Directory", "/startup-directory"], ["Opportunities", "/opportunities"], ["Funding", "/scholarships"], ["Search", "/search"],
    ["Careers", "/careers"], ["Skills", "/skills"], ["Community", "/community"], ["Innovation Feed", "/feed"],
    ["News", "/news"], ["Leaders", "/leaders"], ["My Path", "/my-path"], ["Applications", "/applications"],
    ["Saved items", "/saved"], ["CV Builder", "/cv-builder"], ["Internships", "/internships"], ["Career Path", "/career-path"],
    ["Scholarship Matcher", "/matcher"], ["Compare scholarships", "/compare-scholarships"], ["References", "/references"], ["Contact", "/contact"],
  ],
  player: [
    ["Player Profile", "/profile"], ["My Path", "/my-path"], ["Careers", "/careers"], ["Career Path", "/career-path"],
    ["Skills", "/skills"], ["Internships", "/internships"], ["Opportunities", "/opportunities"], ["Applications", "/applications"],
    ["Saved items", "/saved"], ["CV Builder", "/cv-builder"], ["Scholarships", "/scholarships"], ["Scholarship Matcher", "/matcher"],
    ["Universities", "/search?kind=university"], ["Programmes", "/programmes"], ["Admission Match", "/admission-match"], ["Community", "/community"],
    ["Innovation Feed", "/feed"], ["News", "/news"], ["Leaders", "/leaders"], ["Professional Councils", "/professional-councils"],
  ],
  assessment: [
    ["Assessment Home", "/student-assessment"], ["Admission Match", "/admission-match"], ["My Path", "/my-path"], ["Programmes", "/programmes"],
    ["Universities", "/search?kind=university"], ["Scholarships", "/scholarships"], ["Scholarship Matcher", "/matcher"], ["Compare institutions", "/compare"],
    ["Careers", "/careers"], ["Career Path", "/career-path"], ["Skills", "/skills"], ["Internships", "/internships"],
    ["Opportunities", "/opportunities"], ["Applications", "/applications"], ["Saved items", "/saved"], ["Community", "/community"],
    ["Innovation Feed", "/feed"], ["News", "/news"], ["Leaders", "/leaders"], ["Parent Support", "/parent"],
  ],
  classification: [
    ["Explore", "/explore"], ["Search", "/search"], ["Universities", "/search?kind=university"], ["Programmes", "/programmes"],
    ["Careers", "/careers"], ["Skills", "/skills"], ["Internships", "/internships"], ["Opportunities", "/opportunities"],
    ["Scholarships", "/scholarships"], ["Scholarship Matcher", "/matcher"], ["Admission Match", "/admission-match"], ["Career Path", "/career-path"],
    ["My Path", "/my-path"], ["Applications", "/applications"], ["Saved items", "/saved"], ["Community", "/community"],
    ["Innovation Feed", "/feed"], ["News", "/news"], ["Leaders", "/leaders"], ["Professional Councils", "/professional-councils"],
  ],
} as const;

export function SectionHub({ section }: { section: keyof typeof sectionItems }) {
  const titles = { employee: "Employee", student: "Student", startup: "Startup", classification: "Classification Center", player: "Player", assessment: "Student Assessment" } as const;
  const descriptions = {
    employee: "A single workspace for work, skills, applications and professional growth.",
    student: "A single workspace for education, assessment, funding and your next steps.",
    startup: "A single workspace for startup discovery, funding, talent and African innovation.",
    classification: "Move from broad discovery to a focused education, career or opportunity path.",
    player: "Your personal space for career, skills, opportunities and progress.",
    assessment: "Review your student work, admissions fit, academic options and next steps.",
  } as const;
  const items = sectionItems[section];
  return <Layout title={titles[section]}>
    <div>
      <p className="text-sm font-semibold text-primary">GHANAPATHFINDER</p>
      <h1 className="mt-1 text-3xl font-bold">{titles[section]}</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">{descriptions[section]}</p>
    </div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(([label, href], index) => <Link key={href} to={href} className="group rounded-xl border border-border bg-card p-4 hover:border-primary transition-colors">
        <div className="flex items-start justify-between gap-3"><span className="text-xs font-semibold text-muted-foreground">{String(index + 1).padStart(2, "0")}</span><ArrowRight className="h-4 w-4 text-primary opacity-70 group-hover:translate-x-0.5 transition-transform" /></div>
        <h2 className="mt-5 font-semibold">{label}</h2>
        <p className="mt-1 text-xs text-muted-foreground">Open section</p>
      </Link>)}
    </div>
  </Layout>;
}
