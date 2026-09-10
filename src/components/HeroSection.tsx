import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search } from "@/lib/icons";
import UsageCounter from "@/components/UsageCounter";

const suggestions = ["Nursing", "University of Ghana", "Computer Science", "Scholarships"];

const HeroSection = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    void navigate({ to: "/search", search: q ? { q } : {} });
  };

  return (
    <section className="border-b border-border bg-card">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Higher education in Ghana
        </p>

        <h1 className="mt-3 font-display font-semibold text-3xl sm:text-4xl lg:text-5xl leading-[1.1] text-foreground max-w-3xl">
          Find the university, programme or scholarship that fits your results.
        </h1>

        <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl">
          Search verified institutions across Ghana, compare entry requirements and fees, and see
          what your WASSCE aggregate qualifies you for.
        </p>

        <form onSubmit={submit} className="mt-7 max-w-2xl">
          <label htmlFor="hero-search" className="sr-only">
            Search universities, programmes and scholarships
          </label>
          <div className="flex items-stretch border border-border bg-background rounded-md overflow-hidden focus-within:border-primary">
            <span className="grid place-items-center pl-3 text-muted-foreground">
              <Search className="h-[18px] w-[18px]" />
            </span>
            <input
              id="hero-search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search a university, programme or scholarship"
              className="flex-1 min-w-0 bg-transparent px-3 py-3 text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              type="submit"
              className="px-4 sm:px-6 bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-muted-foreground">Popular:</span>
            {suggestions.map((s) => (
              <Link
                key={s}
                to="/search"
                search={{ q: s }}
                className="text-foreground underline underline-offset-4 decoration-border hover:decoration-primary"
              >
                {s}
              </Link>
            ))}
          </div>
        </form>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            to="/admission-match"
            className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Check my WASSCE match
          </Link>
          <Link
            to="/programmes"
            className="px-5 py-2.5 rounded-md border border-border text-sm font-semibold text-foreground hover:border-primary transition-colors"
          >
            Browse programmes
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <UsageCounter />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
