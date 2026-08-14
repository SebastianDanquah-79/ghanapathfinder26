import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { ArrowLeft, GraduationCap, Lightbulb, Quote } from "lucide-react";
import { getDailyMessage, stories } from "@/lib/motivation";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";

const Inspiration = () => {
  const daily = getDailyMessage();

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Seo
        title="Student Success Stories & Career Inspiration | GhanaPath"
        description="Honest stories from Ghanaian students, graduates, professionals and founders — the setbacks they faced and what they would tell you today."
        path="/inspiration"
      />
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between gap-3 mb-6">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              Ghana<span className="text-primary">Path</span>
            </span>
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
        </header>

        <div className="mb-6 max-w-2xl">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-4">
            Inspiration
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-3">
            Student success stories &amp; <span className="text-gradient-gold">career inspiration</span>
          </h1>
          <p className="text-muted-foreground">
            Short, honest stories from Ghanaian students, graduates, professionals and founders — and what
            each of them would tell you today.
          </p>
        </div>

        <div className="bg-glass rounded-xl p-5 mb-6 flex gap-3">
          <Lightbulb className="h-5 w-5 text-primary shrink-0" aria-hidden />
          <p className="font-display text-base sm:text-lg text-foreground leading-relaxed">{daily}</p>
        </div>

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {stories.map((s, i) => (
            <motion.article
              key={s.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: Math.min(i, 5) * 0.05 }}
              className="bg-glass rounded-xl p-5 flex flex-col"
            >
              <Quote className="h-5 w-5 text-primary mb-3" aria-hidden />
              <p className="text-sm text-foreground/90 leading-relaxed flex-1">{s.quote}</p>
              <div className="mt-4 pt-4 border-t border-border/60">
                <p className="text-sm font-semibold text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.role} · {s.region}
                </p>
                <p className="text-xs text-primary mt-3 leading-relaxed">{s.lesson}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inspiration;
