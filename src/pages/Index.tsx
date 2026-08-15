import { Suspense, lazy } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import HeroSection from "@/components/HeroSection";
import CollegeRecommender from "@/components/CollegeRecommender";
import UniversityDirectory from "@/components/UniversityDirectory";
import ScholarshipSection from "@/components/ScholarshipSection";

const ImpactSection = lazy(() => import("@/components/ImpactSection"));
const CareerSection = lazy(() => import("@/components/CareerSection"));
const CityGuide = lazy(() => import("@/components/CityGuide"));
const StartupStories = lazy(() => import("@/components/StartupStories"));
const StartupRoadmap = lazy(() => import("@/components/StartupRoadmap"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="GhanaPathFinder — University, Programme & Scholarship Guide"
      description="Find accredited Ghanaian universities and programmes that match your WASSCE results, track scholarships and plan your career — free for SHS students."
      path="/"
      jsonLd={[
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "GhanaPathFinder",
          url: "https://ghanapathfinder26.lovable.app",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://ghanapathfinder26.lovable.app/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        },
      ]}
    />
    <Navbar />
    <HeroSection />
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
