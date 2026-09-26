import { Suspense, lazy } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import HeroSection from "@/components/HeroSection";
import CollegeRecommender from "@/components/CollegeRecommender";
import UniversityDirectory from "@/components/UniversityDirectory";
import ScholarshipSection from "@/components/ScholarshipSection";
import ExploreGrid from "@/components/ExploreGrid";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import WhyGhanaPathFinder from "@/components/WhyGhanaPathFinder";
import PathfinderDecisionHub from "@/components/PathfinderDecisionHub";
import { Link } from "@/lib/router-compat";

const ImpactSection = lazy(() => import("@/components/ImpactSection"));
const CareerSection = lazy(() => import("@/components/CareerSection"));
const CityGuide = lazy(() => import("@/components/CityGuide"));
const StartupStories = lazy(() => import("@/components/StartupStories"));
const StartupRoadmap = lazy(() => import("@/components/StartupRoadmap"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="GhanaPathFinder: Discover Africa. Find opportunities. Connect."
      description="GhanaPathFinder helps people discover education, work, startups, skills, companies and opportunities across Africa, with Ghana as the starting point."
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

    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8" aria-label="Explore GhanaPathFinder">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Beyond admissions</p>
        <h2 className="mt-2 text-2xl font-bold text-foreground">Discover, connect and act across Africa.</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Ghana remains the starting point, but your path can include learning, work, entrepreneurship, people, companies and discovery across the continent.</p>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {[
            ["/for-you","For You","Personalised discovery"],
            ["/work","Work","Jobs and internships"],
            ["/build","Build","Startups and companies"],
            ["/connect","Connect","People and community"],
            ["/travel","Explore Africa","Countries and knowledge"],
          ].map(([to,label,desc]) => <Link key={to} to={to} className="rounded-xl border border-border p-4 hover:border-primary/50"><p className="text-sm font-semibold text-foreground">{label}</p><p className="mt-1 text-xs text-muted-foreground">{desc}</p></Link>)}
        </div>
      </div>
    </section>

    <WhyGhanaPathFinder />
    <PathfinderDecisionHub />
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
);

export default Index;
