import { Link } from "@/lib/router-compat";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Rocket, Search, Globe2, BookOpen, Building2 } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

const cards=[
["education","Education",GraduationCap,"Universities, programmes, scholarships, courses and research.","/onboarding"],
["corporate","Corporate work",BriefcaseBusiness,"Jobs, internships, graduate programmes, CVs and employers.","/onboarding"],
["startup","Startups",Rocket,"Funding, accelerators, founders, startup jobs and African innovation.","/onboarding"],
];
export default function Index(){
 return <div className="min-h-screen bg-background"><Seo title="GhanaPathFinder | Africa-first education, career and opportunity platform" description="Discover education, careers, jobs, startups, skills and opportunities across Africa and the world." path="/"/><Navbar/>
 <main className="pt-14">
  <section className="border-b border-border bg-background"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
   <div className="max-w-4xl"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Global by design. Africa at the center.</p>
   <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground sm:text-6xl">Find what to learn, where to study, what to build and where to work.</h1>
   <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">GhanaPathFinder connects people to education, employment, entrepreneurship, skills, knowledge and opportunity. Ghana is the starting point. Africa is the core. Global opportunities are part of the platform.</p>
   <div className="mt-8 flex flex-wrap gap-3"><Link to="/onboarding" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Find my path <ArrowRight className="h-4 w-4"/></Link><Link to="/search" className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground">Explore <Search className="h-4 w-4"/></Link></div>
   <p className="mt-5 text-sm text-muted-foreground">Multiple qualification systems. Multiple countries. One opportunity platform.</p>
   </div>
  </div></section>
  <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="grid gap-4 md:grid-cols-3">{cards.map(([id,title,Icon,desc,href])=><Link key={id} to={href as string} className="border border-border bg-card p-6 hover:border-primary/50"><Icon className="h-6 w-6 text-primary"/><h2 className="mt-5 text-xl font-semibold text-foreground">{title as string}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{desc as string}</p><span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary">Get started <ArrowRight className="h-4 w-4"/></span></Link>)}</div></section>
  <section className="border-y border-border"><div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="grid gap-8 md:grid-cols-4"><Link to="/opportunities" className="group"><BriefcaseBusiness className="h-5 w-5 text-primary"/><h3 className="mt-3 font-semibold text-foreground">Jobs & internships</h3><p className="mt-1 text-sm text-muted-foreground">Find verified opportunities and apply through their original sources.</p></Link><Link to="/startups" className="group"><Rocket className="h-5 w-5 text-primary"/><h3 className="mt-3 font-semibold text-foreground">African startups</h3><p className="mt-1 text-sm text-muted-foreground">Follow funding, founders, products and innovation.</p></Link><Link to="/education" className="group"><BookOpen className="h-5 w-5 text-primary"/><h3 className="mt-3 font-semibold text-foreground">Education</h3><p className="mt-1 text-sm text-muted-foreground">Explore learning, scholarships, research and institutions.</p></Link><Link to="/employers" className="group"><Building2 className="h-5 w-5 text-primary"/><h3 className="mt-3 font-semibold text-foreground">Employers</h3><p className="mt-1 text-sm text-muted-foreground">Connect professional profiles with employers and opportunities.</p></Link></div></div></section>
  <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><Globe2 className="h-6 w-6 text-primary"/><div><h2 className="text-2xl font-semibold text-foreground">Africa first, not Africa only</h2><p className="mt-1 text-sm text-muted-foreground">Start in Ghana, explore Africa, then connect to global pathways.</p></div></div></section>
 </main></div>
}