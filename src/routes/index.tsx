import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BriefcaseBusiness, GraduationCap, Rocket, Sparkles } from "lucide-react";
export const Route = createFileRoute("/")({ component: RoleGateway });
function RoleGateway() {
  const roles = [
    { title:"Student", text:"Explore universities, programmes, scholarships, careers and international opportunities.", to:"/explore", icon:GraduationCap },
    { title:"Employee", text:"Build your professional profile and discover verified jobs, internships and remote opportunities.", to:"/dashboard/employee", icon:BriefcaseBusiness },
    { title:"Employer", text:"Find opted-in talent and publish real opportunities for candidates.", to:"/dashboard/employer", icon:BriefcaseBusiness },
    { title:"Startup Founder", text:"Discover funding, investors, accelerators and founder resources across Africa.", to:"/dashboard/founder", icon:Rocket },
  ];
  return <main className="min-h-dvh bg-background px-4 py-10 sm:px-8"><div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl flex-col justify-center">
    <div className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">GhanaPathFinder</p><h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-6xl">Choose your path.</h1><p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">One platform for education, work and entrepreneurship. Africa at the center, connected to the world.</p></div>
    <div className="mt-10 grid gap-4 sm:grid-cols-2">{roles.map(({title,text,to,icon:Icon}) => <Link key={title} to={to} className="group rounded-2xl border border-border bg-card p-6 hover:bg-secondary"><Icon className="h-6 w-6 text-primary" aria-hidden="true"/><h2 className="mt-5 text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">Continue <ArrowRight className="h-4 w-4"/></span></Link>)}</div>
    <Link to="/ai" className="mt-6 inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><Sparkles className="h-4 w-4"/>Ask the GhanaPathFinder AI advisor</Link>
  </div></main>;
}
