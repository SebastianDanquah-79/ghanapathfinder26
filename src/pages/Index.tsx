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

const ImpactSection = lazy(() => import("@/components/ImpactSection"));
const CareerSection = lazy(() => import("@/components/CareerSection"));
const CityGuide = lazy(() => import("@/components/CityGuide"));
const StartupStories = lazy(() => import("@/components/StartupStories"));
const StartupRoadmap = lazy(() => import("@/components/StartupRoadmap"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => (
  <div className="min-h-screen bg-background">
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
