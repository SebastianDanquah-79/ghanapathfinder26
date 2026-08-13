import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Sparkles } from "lucide-react";
import ParticleBackground from "./ParticleBackground";

const phrases = [
  "Find Your University",
  "Build Your Career",
  "Start Your Company",
  "Own Your Future",
];

const HeroSection = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden py-24">
      <ParticleBackground />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass mb-8">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Guidance for Ghana 🇬🇭</span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-6xl lg:text-7xl mb-6 leading-tight">
            <span className="text-foreground">Ready to</span>
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

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The ultimate college and career guidance platform for Ghanaian SHS students.
            AI-powered, beautifully designed, built for your success.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#recommender"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity glow-gold"
            >
              Get My Recommendations
              <Sparkles className="h-4 w-4" />
            </a>
            <a
              href="#universities"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg bg-glass bg-glass-hover font-semibold text-sm text-foreground"
            >
              Explore Universities
            </a>
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
