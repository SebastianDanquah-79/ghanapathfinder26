import { Suspense, lazy } from "react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import HeroSection from "@/components/HeroSection";
import CollegeRecommender from "@/components/CollegeRecommender";
import UniversityDirectory from "@/components/UniversityDirectory";
import ScholarshipSection from "@/components/ScholarshipSection";
import ExploreGrid from "@/components/ExploreGrid";

const ImpactSection = lazy(() => import("@/components/ImpactSection"));
const CareerSection = lazy(() => import("@/components/CareerSection"));
const CityGuide = lazy(() => import("@/components/CityGuide"));
const StartupStories = lazy(() => import("@/components/StartupStories"));
const StartupRoadmap = lazy(() => import("@/components/StartupRoadmap"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => (
  <div className="min-h-screen bg-background">
    <Seo
      title="GhanaPathFinder: Ghana Universities & Scholarships Guide"
      description="GhanaPathFinder is an education and career platform helping Ghanaian students discover universities, programmes, scholarships, career paths and opportunities."
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
      <HeroSection />
    </div>

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
