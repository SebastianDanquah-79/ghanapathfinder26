import { Suspense, lazy } from "react";
import Navbar from "@/components/Navbar";
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { ArrowRight, Award, Bell, Bookmark, Briefcase, Building2, CalendarDays, Sparkles } from "@/lib/icons";
import Seo from "@/components/Seo";
import HeroSection from "@/components/HeroSection";
import CollegeRecommender from "@/components/CollegeRecommender";
import UniversityDirectory from "@/components/UniversityDirectory";
import ScholarshipSection from "@/components/ScholarshipSection";
import ExploreGrid from "@/components/ExploreGrid";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import WhyGhanaPathFinder from "@/components/WhyGhanaPathFinder";
import PathfinderDecisionHub from "@/components/PathfinderDecisionHub";
import { Globe2 } from "@/lib/icons";

const ImpactSection = lazy(() => import("@/components/ImpactSection"));
const CareerSection = lazy(() => import("@/components/CareerSection"));
const CityGuide = lazy(() => import("@/components/CityGuide"));
const StartupStories = lazy(() => import("@/components/StartupStories"));
const StartupRoadmap = lazy(() => import("@/components/StartupRoadmap"));
const Footer = lazy(() => import("@/components/Footer"));


const MobileHome = () => {
  const { user } = useAuth();
  const fullName =
    (user?.user_metadata?.["full_name"] as string | undefined) ??
    user?.email?.split("@")[0] ??
    "there";
  const firstName = fullName.trim().split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const services = [
    { to: "/search?kind=university", title: "Universities", detail: "Explore programmes", icon: Building2 },
    { to: "/scholarships", title: "Scholarships", detail: "Find funding", icon: Award },
    { to: "/careers", title: "Careers", detail: "Explore career paths", icon: Briefcase },
  ];

  return (
    <main className="min-h-screen bg-background px-4 pt-7 pb-24">
      <header className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] text-muted-foreground">{greeting},</p>
          <h1 className="font-display text-[25px] font-bold leading-tight text-foreground break-words">{firstName}</h1>
        </div>
        <Link to={user ? "/applications" : "/auth"} aria-label="Notifications and updates" className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-foreground">
          <Bell className="h-6 w-6" />
        </Link>
      </header>

      <section className="rounded-[1.75rem] bg-primary px-6 py-8 text-primary-foreground shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] opacity-80">Your next step starts here</p>
        <h2 className="max-w-[18rem] font-display text-[29px] font-bold leading-[1.12]">Find your path forward</h2>
        <p className="mt-3 max-w-[23rem] text-[15px] leading-6 opacity-85">
          Explore universities, scholarships, careers and opportunities across Ghana.
        </p>
        <Link to="/search" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary">
          Explore opportunities <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="font-display text-[22px] font-bold text-foreground">Explore services</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose what you want to work on</p>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {services.map(({ to, title, detail, icon: Icon }) => (
            <Link key={to} to={to} className="flex min-w-0 flex-col items-center rounded-2xl border border-border bg-card px-2 py-4 text-center shadow-sm transition-colors active:bg-secondary">
              <span className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-[13px] font-semibold leading-5 text-foreground">{title}</span>
              <span className="mt-1 text-[11px] leading-4 text-muted-foreground">{detail}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="font-display text-[22px] font-bold text-foreground">Your space</h2>
          <p className="mt-1 text-sm text-muted-foreground">Keep your plans and progress together</p>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <Link to="/my-path" className="flex items-center gap-4 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Sparkles className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">My Path</span><span className="mt-1 block text-xs text-muted-foreground">Build a practical education and career plan</span></span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="mx-4 border-t border-border" />
          <Link to="/internships" className="flex items-center gap-4 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><CalendarDays className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">Internships & opportunities</span><span className="mt-1 block text-xs text-muted-foreground">Discover ways to gain experience</span></span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <div className="mx-4 border-t border-border" />
          <Link to={user ? "/dashboard" : "/auth"} className="flex items-center gap-4 p-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Bookmark className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-foreground">Saved items</span><span className="mt-1 block text-xs text-muted-foreground">Return to options you have bookmarked</span></span>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </section>
    </main>
  );
};

const Index = () => (
  <div className="min-h-screen bg-background">
    <div className="md:hidden"><MobileHome /></div>
    <div className="hidden md:block">
    <Seo
      title="GhanaPathFinder: A Ghanaian Life Decision Platform"
      description="GhanaPathFinder helps Ghanaians make better decisions about university, careers, skills, work, scholarships and entrepreneurship using Ghana-specific information and realistic pathways."
      path="/"
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": "https://ghanapathfinder.com/#website",
          name: "GhanaPathFinder",
          alternateName: "Ghana Path Finder",
          url: "https://ghanapathfinder.com",
          inLanguage: "en-GH",
          publisher: { "@id": "https://ghanapathfinder.com/#organization" },
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://ghanapathfinder.com/search?q={search_term_string}",
            },
            "query-input": "required name=search_term_string",
          },
        },
      ]}
    />
    <Navbar />
    <div className="pt-14">
      <AnnouncementBanner />
      <HeroSection />
    </div>

    <WhyGhanaPathFinder />
    <PathfinderDecisionHub />
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-8 lg:px-12"><div className="rounded-2xl border border-border bg-card p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Globe2 className="h-6 w-6" /></span><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Global education</p><h2 className="mt-1 font-display text-2xl font-bold text-foreground">International Directory</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Explore every country, how to apply there, and how applicants from each country can apply to Ghanaian universities.</p></div></div><Link to="/international-directory" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Explore the directory <ArrowRight className="h-4 w-4" /></Link></div></div></section>
    <ExploreGrid />
    <CollegeRecommender />
    <UniversityDirectory />
    <ScholarshipSection />
    <Suspense fallback={<div className="h-24" />}>
      <ImpactSection />
      <CareerSection />
      <CityGuide />
      <StartupStories />
      <StartupRoadmap />
      <Footer />
    </Suspense>
    </div>
  </div>
);

export default Index;
