import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import CollegeRecommender from "@/components/CollegeRecommender";
import UniversityDirectory from "@/components/UniversityDirectory";
import ScholarshipSection from "@/components/ScholarshipSection";
import CareerSection from "@/components/CareerSection";
import CityGuide from "@/components/CityGuide";
import StartupStories from "@/components/StartupStories";
import StartupRoadmap from "@/components/StartupRoadmap";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <HeroSection />
    <CollegeRecommender />
    <UniversityDirectory />
    <ScholarshipSection />
    <CareerSection />
    <CityGuide />
    <StartupStories />
    <StartupRoadmap />
    <Footer />
  </div>
);

export default Index;
