import UsageCounter from "@/components/UsageCounter";
import { motion } from "framer-motion";
import { ArrowRight, Compass } from "@/lib/icons";
import { Link } from "@/lib/router-compat";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="relative min-h-[600px] overflow-hidden rounded-[18px] border border-border bg-[#0a0f1c] shadow-[0_24px_70px_rgba(10,15,28,0.18)]">
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute -right-20 top-16 h-72 w-72 rounded-full border border-primary/10" />
            <div className="absolute right-10 top-32 h-52 w-52 rounded-full border border-primary/10" />
          </div>

          <div className="relative z-10 grid min-h-[600px] items-center gap-10 px-7 py-14 sm:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-14 lg:py-16">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-xl"
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-xs font-medium text-primary">
                <Compass className="h-4 w-4" />
                A Ghanaian life decision platform
              </div>

              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                Your path is bigger than one decision.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-white/65 sm:text-lg">
                From WASSCE to university, skills, work and entrepreneurship, see your options clearly and turn them into a path you can actually follow.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/my-path"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Build My Path
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/career-path"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-white/20 px-5 text-sm font-medium text-white transition-colors hover:border-primary/50 hover:text-primary"
                >
                  Explore careers
                </Link>
              </div>

              <div className="mt-8">
                <UsageCounter />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="relative mx-auto h-[340px] w-full max-w-[600px] sm:h-[410px]"
              aria-hidden="true"
            >
              <div className="absolute left-[12%] top-[18%] h-px w-[72%] rotate-[24deg] bg-white/10" />
              <div className="absolute left-[20%] top-[55%] h-px w-[65%] -rotate-[16deg] bg-white/10" />
              <div className="absolute right-[8%] top-[13%] h-[250px] w-[250px] rounded-full border border-white/10" />

              <div className="absolute left-[4%] top-[18%] h-28 w-44 -rotate-[18deg] rounded-lg border border-white/10 bg-[#111827] p-4 shadow-2xl sm:h-32 sm:w-52">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">Your results</div>
                <div className="mt-4 h-2 w-24 rounded-full bg-primary/80" />
                <div className="mt-2 h-2 w-32 rounded-full bg-white/10" />
                <div className="mt-2 h-2 w-20 rounded-full bg-white/10" />
              </div>

              <div className="absolute right-[4%] top-[8%] h-32 w-52 rotate-[13deg] rounded-lg border border-white/10 bg-[#16202b] p-5 shadow-2xl sm:h-36 sm:w-60">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">Career path</div>
                <div className="mt-4 flex items-end gap-2">
                  <div className="h-9 w-9 rounded bg-primary/75" />
                  <div className="h-14 w-9 rounded bg-white/15" />
                  <div className="h-20 w-9 rounded bg-white/10" />
                  <div className="h-12 w-9 rounded bg-white/20" />
                </div>
              </div>

              <div className="absolute left-[22%] top-[48%] h-32 w-56 rotate-[7deg] rounded-lg border border-white/10 bg-[#0f1722] p-5 shadow-2xl sm:h-36 sm:w-64">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">Best next move</div>
                <div className="mt-5 text-lg font-semibold text-white">Build your path</div>
                <div className="mt-2 h-1.5 w-28 rounded-full bg-primary/70" />
              </div>

              <div className="absolute right-[15%] top-[55%] h-28 w-44 -rotate-[16deg] rounded-lg border border-white/10 bg-[#141d28] p-4 shadow-2xl sm:h-32 sm:w-52">
                <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">University</div>
                <div className="mt-4 h-2 w-28 rounded-full bg-white/20" />
                <div className="mt-2 h-2 w-20 rounded-full bg-primary/70" />
                <div className="mt-2 h-2 w-32 rounded-full bg-white/10" />
              </div>

              <div className="absolute bottom-[4%] left-[34%] h-20 w-32 rotate-[9deg] rounded-lg border border-primary/20 bg-[#101923] p-3 shadow-2xl sm:h-24 sm:w-40">
                <div className="text-[9px] font-medium uppercase tracking-[0.16em] text-white/35">Skills</div>
                <div className="mt-3 flex gap-1.5">
                  <span className="h-8 w-8 rounded bg-primary/70" />
                  <span className="h-8 w-8 rounded bg-white/10" />
                  <span className="h-8 w-8 rounded bg-white/15" />
                </div>
              </div>

              <div className="absolute bottom-[8%] right-[3%] h-2 w-2 rounded-full bg-primary shadow-[0_0_20px_rgba(212,175,55,0.45)]" />
              <div className="absolute left-[12%] bottom-[17%] h-2 w-2 rounded-full bg-white/35" />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
