import { Suspense, lazy } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollegeRecommender from "@/components/CollegeRecommender";
import UniversityDirectory from "@/components/UniversityDirectory";
import ScholarshipSection from "@/components/ScholarshipSection";

const CareerSection = lazy(() => import("@/components/CareerSection"));
const CityGuide = lazy(() => import("@/components/CityGuide"));
const StartupStories = lazy(() => import("@/components/StartupStories"));
const StartupRoadmap = lazy(() => import("@/components/StartupRoadmap"));
const Footer = lazy(() => import("@/components/Footer"));

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <CollegeRecommender />
    <UniversityDirectory />
    <ScholarshipSection />
    <Suspense fallback={<div className="h-24" />}>
      <CareerSection />
      <CityGuide />
      <StartupStories />
      <StartupRoadmap />
      <Footer />
    </Suspense>
  </div>
);

export default Index;
