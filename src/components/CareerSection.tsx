import { useState } from "react";
import SectionHeader from "./SectionHeader";
import { popularMajors } from "@/data/careers";
import CareerIntelligenceAdvisor from "@/components/CareerIntelligenceAdvisor";

const CareerSection = () => {
  const [selectedMajor, setSelectedMajor] = useState("Computer Science");

  return (
    <section id="careers" className="py-12 px-4 lg:py-28">
      <div className="mx-auto max-w-5xl">
        <SectionHeader
          badge="AI Career Intelligence"
          title="Discover your next"
          highlight="career direction"
          description="Explore career options with AI guidance based on your interests, education, WASSCE subjects and current skills. Recommendations are connected to GhanaPathFinder's career catalogue and opportunity data."
        />

        <div className="mb-6 flex flex-wrap justify-center gap-2">
          {popularMajors.map((major) => (
            <button
              key={major}
              type="button"
              onClick={() => setSelectedMajor(major)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selectedMajor === major
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {major}
            </button>
          ))}
        </div>

        <CareerIntelligenceAdvisor key={selectedMajor} initialGoal={selectedMajor} />
      </div>
    </section>
  );
};

export default CareerSection;
