import { useState } from "react";
import { CheckCircle2 } from "@/lib/icons";

const highlights = [
  "Match your WASSCE results to real university admission thresholds.",
  "Track scholarships, deadlines and eligibility in one place.",
  "Plan your career path from SHS through university and beyond.",
];

const WhyGhanaPathFinder = () => {
  const [imageError, setImageError] = useState(false);

  return (
    <section aria-labelledby="why-heading" className="bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <div
            className="relative w-full rounded-2xl overflow-hidden aspect-[4/3] md:aspect-[3/2] bg-muted"
            style={{
              backgroundImage: imageError ? undefined : "url('/assets/why-section.jpg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {!imageError && (
              <img
                src="/assets/why-section.jpg"
                alt="Modern university campus building"
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            )}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                Image coming soon
              </div>
            )}
          </div>

          {/* Text */}
          <div className="order-first md:order-last">
            <h2
              id="why-heading"
              className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4"
            >
              Why GhanaPathFinder?
            </h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed">
              GhanaPathFinder helps Ghanaian students make confident decisions about
              university, scholarships and careers. We bring together verified
              admission data, scholarship deadlines and career guidance so you can
              focus on taking the next step.
            </p>
            <ul className="space-y-3">
              {highlights.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm md:text-base text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyGhanaPathFinder;
