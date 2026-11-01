
import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "@/lib/router-compat";
import { ArrowRight, Award, Briefcase, Building2, CheckCircle2, GraduationCap, Globe, Loader2, Rocket, Search, Sparkles } from "@/lib/icons";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const roles = [
  { key: "student", label: "Student", description: "Explore universities, programmes, scholarships and a clear next step.", icon: GraduationCap },
  { key: "international_student", label: "International student", description: "Understand study routes, qualification guidance and institutions.", icon: Globe },
  { key: "startup_founder", label: "Startup founder", description: "Find founder resources, funding leads, collaborators and opportunities.", icon: Rocket },
  { key: "employer", label: "Employer", description: "Publish opportunities and discover candidates who chose to be visible.", icon: Building2 },
  { key: "employee", label: "Job seeker", description: "Explore jobs, internships, skills and your professional next steps.", icon: Briefcase },
] as const;

type Role = typeof roles[number]["key"];

const discoveryLinks = [
  { href: "/search?kind=university", label: "Universities", detail: "Compare institutions and study options", icon: Building2 },
  { href: "/programmes/", label: "Programmes", detail: "Explore courses across qualification levels", icon: GraduationCap },
  { href: "/scholarships/", label: "Scholarships", detail: "Find funding and review eligibility", icon: Award },
  { href: "/jobs", label: "Jobs & internships", detail: "Discover work and early-career opportunities", icon: Briefcase },
];

export default function RoleGateway() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [choosing, setChoosing] = useState<Role | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user || loading || window.location.search.includes("switchRole=1")) return;
    let cancelled = false;
    void supabase.from("profiles").select("account_role,role,onboarding_complete").eq("id", user.id).maybeSingle().then(function(result) {
      const role = result.data?.account_role ?? result.data?.role;
      if (cancelled || !result.data || !result.data.onboarding_complete || !role) return;
      const destination = role === "startup_founder" || role === "founder" ? "/portal/founder" : role === "international_student" || role === "international-student" ? "/portal/international-student" : role === "student" || role === "employee" || role === "employer" ? "/portal/" + role : "/onboarding";
      navigate(destination, { replace: true });
    });
    return function() { cancelled = true; };
  }, [loading, user, navigate]);

  if (loading) return <div className="min-h-dvh grid place-items-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  async function chooseRole(role: Role) {
    setChoosing(role);
    localStorage.setItem("selectedRole", role);
    if (user) {
      const { error } = await supabase.from("profiles").update({ role, account_role: role, account_type: role }).eq("id", user.id);
      if (error) {
        console.error("Could not activate selected portal role", error);
        toast.error("Could not switch portal yet. Please try again.");
        setChoosing(null);
        return;
      }
    }
    navigate("/onboarding?role=" + role);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? "/search?q=" + encodeURIComponent(query) : "/search");
  }

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Navbar />
      <main className="pt-16">
        <section className="border-b border-border bg-secondary/35">
          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(19rem,.85fr)] lg:items-center lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-primary"><span className="h-2 w-2 rounded-full bg-ghana-gold" />Education · Careers · Opportunities</p>
              <h1 className="mt-5 max-w-3xl text-[2.45rem] font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.55rem]">Find Your Path.<span className="mt-1 block text-primary">Build Your Future.</span></h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Discover universities, programmes, scholarships and career opportunities in Ghana and beyond. Compare your options, save what matters and plan your next move.</p>
              <form onSubmit={submitSearch} role="search" className="mt-7 flex flex-col gap-2 rounded-xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center">
                <label htmlFor="gpf-home-search" className="sr-only">Search education and career opportunities</label>
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3"><Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" /><input id="gpf-home-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search universities, programmes, scholarships..." className="min-h-11 min-w-0 w-full border-0 bg-transparent text-base outline-none placeholder:text-muted-foreground focus:ring-0" /></div>
                <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Search opportunities <ArrowRight className="h-4 w-4" /></button>
              </form>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm"><Link to="/scholarships/" className="font-medium text-primary underline-offset-4 hover:underline">Explore scholarships</Link><Link to="/programmes/" className="font-medium text-muted-foreground hover:text-foreground hover:underline">Browse programmes</Link><Link to="/ask-africa" className="font-medium text-muted-foreground hover:text-foreground hover:underline">Ask the AI Coach</Link></div>
              <div className="mt-7 flex flex-wrap gap-3">{!user && <Link to="/auth" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Create your account</Link>}<Link to={user ? "/dashboard" : "/auth"} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-5 text-sm font-semibold text-foreground transition hover:border-primary">{user ? "Open your dashboard" : "Sign in"} <ArrowRight className="h-4 w-4" /></Link></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Search className="h-5 w-5" /></span><div><h2 className="font-semibold">Explore with context</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Search real education and opportunity listings with source and eligibility details where available.</p></div></div></div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><CheckCircle2 className="h-5 w-5" /></span><div><h2 className="font-semibold">Keep your options together</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Save opportunities, organise your next steps and return to your personal workspace.</p></div></div></div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:col-span-2 lg:col-span-1"><div className="flex items-start gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Sparkles className="h-5 w-5" /></span><div><h2 className="font-semibold">Get help making a plan</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Use Ask Africa to understand options, learn concepts and decide on practical next steps.</p><Link to="/ask-africa" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Meet the AI Coach <ArrowRight className="h-4 w-4" /></Link></div></div></div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Start exploring</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Opportunities that move you forward</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Go straight to the areas students and young professionals use most.</p></div><Link to="/search" className="mt-2 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-primary hover:underline sm:mt-0">Explore everything <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{discoveryLinks.map(({href,label,detail,icon:Icon}) => <Link key={href} to={href} className="group flex min-w-0 items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0"><span className="block font-semibold text-foreground">{label}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{detail}</span></span><ArrowRight className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" /></Link>)}</div>
        </section>

        <section className="border-y border-border bg-secondary/35"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-8 lg:py-14"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary">Your next step</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">One platform. Five paths.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Choose the workspace that matches your goal. Your portal will show relevant tools and opportunities for your account type.</p></div><div className="grid gap-3 sm:grid-cols-2">{roles.map(function(item) {const Icon = item.icon;return <button key={item.key} type="button" disabled={choosing !== null} onClick={function(){void chooseRole(item.key);}} className="group flex min-h-[116px] items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition hover:border-primary hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-wait disabled:opacity-60"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-semibold">{choosing === item.key ? "Opening " + item.label + "…" : item.label}</span><span className="mt-1 block text-sm leading-5 text-muted-foreground">{item.description}</span></span><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" /></button>;})}</div><p className="text-xs leading-5 text-muted-foreground lg:col-start-2">You can update your profile and return to your portal at any time. Your account permissions determine which tools are available.</p></div></section>

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8"><div className="flex flex-col gap-5 rounded-xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8"><div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[.16em] text-primary-foreground/75">Ask Africa · AI Coach</p><h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Get clarity on your next move.</h2><p className="mt-2 text-sm leading-6 text-primary-foreground/80">Ask questions about study choices, applications, scholarships, careers or a difficult topic. Get structured guidance and decide what to do next.</p></div><Link to="/ask-africa" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-background px-5 text-sm font-semibold text-foreground transition hover:opacity-90">Open AI Coach <ArrowRight className="h-4 w-4" /></Link></div></section>
      </main>
      <Footer />
    </div>
  );
}
