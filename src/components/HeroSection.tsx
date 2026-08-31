import UsageCounter from "@/components/UsageCounter";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, Sparkles } from "@/lib/icons";

const phrases = [
  "Find Your University",
  "Build Your Career",
  "Start Your Company",
  "Own Your Future",
];

const HeroSection = () => {
  const [idx, setIdx] = useState(0);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setIdx((i) => (i + 1) % phrases.length), 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative min-h-[480px] md:min-h-[560px] flex items-end overflow-hidden"
      style={{
        backgroundColor: imageError ? "#0F2A5C" : undefined,
        backgroundImage: imageError
          ? undefined
          : "url('/assets/hero-campus.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Hidden image to detect load failures */}
      {!imageError && (
        <img
          src="/assets/hero-campus.jpg"
          alt=""
          aria-hidden="true"
          className="sr-only"
          onError={() => setImageError(true)}
        />
      )}

      {/* Dark navy gradient overlay */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,26,58,0.25) 0%, rgba(11,26,58,0.92) 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pb-24 md:pb-16 pt-32 md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-5">
            <Sparkles className="h-4 w-4 text-[#F5B945]" />
            <span className="text-sm text-white/90">AI guidance for Ghana</span>
          </div>

          <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight text-white text-left">
            <span className="block">Ready to</span>
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

          <p className="text-base sm:text-lg text-white/80 max-w-2xl mb-6 text-left">
            Universities, scholarships and careers matched to your WASSCE results.
          </p>

          <div className="flex justify-start mb-6">
            <UsageCounter />
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-10"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <ArrowDown className="h-5 w-5 text-white/70" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
