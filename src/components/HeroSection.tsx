import UsageCounter from "@/components/UsageCounter";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Compass } from "@/lib/icons";
import ParticleBackground from "./ParticleBackground";

const phrases = [
  "Choose Your Career",
  "Plan Your Next Move",
  "Find Your University",
  "Build Your Future",
];

const HeroSection = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[72svh] flex items-center justify-center overflow-hidden py-14">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-glass mb-5">
            <Compass className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">A Ghanaian life decision platform</span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
            <span className="text-foreground">Make your next</span>
            <br />
            <AnimatePresence mode="wait">
              <motion.span
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-gradient-gold inline-block"
              >
                {phrases[idx]}
              </motion.span>
            </AnimatePresence>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            From WASSCE to university, skills, work and entrepreneurship, GhanaPathFinder helps you see the path before you take it.
          </p>
          <p className="text-sm text-muted-foreground/80 max-w-xl mx-auto mb-7">
            Built around Ghanaian opportunities, real requirements and the decisions that shape your life.
          </p>

          <div className="flex justify-center mb-6">
            <UsageCounter />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ArrowDown className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
