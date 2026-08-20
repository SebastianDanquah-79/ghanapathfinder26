import { Link } from "@/lib/router-compat";

const items = [
  {
    to: "/universities",
    title: "Universities",
    desc: "Every accredited institution in Ghana, with verified sources.",
  },
  {
    to: "/programmes",
    title: "Programmes",
    desc: "What you study, career paths and entry requirements.",
  },
  {
    to: "/admission-match",
    title: "Admission match",
    desc: "Use your WASSCE aggregate to see where you qualify.",
  },
  {
    to: "/scholarships",
    title: "Scholarships",
    desc: "Local, private and international funding you can apply for.",
  },
  {
    to: "/careers",
    title: "Careers",
    desc: "Where each path leads, and what the work really looks like.",
  },
  {
    to: "/community",
    title: "Community",
    desc: "Honest, anonymous experiences from students already there.",
  },
];

const ExploreGrid = () => (
  <section aria-labelledby="explore" className="border-t border-border bg-card/30">
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <h2 id="explore" className="font-display text-lg md:text-xl font-semibold text-foreground">
        Start here
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Discover, match, compare and plan — one step at a time.
      </p>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-2.5">
        {items.map((i) => (
          <Link
            key={i.to}
            to={i.to}
            className="group rounded-xl border border-border bg-background p-3 md:p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="block text-sm md:text-base font-semibold text-foreground group-hover:text-primary">
              {i.title}
            </span>
            <span className="mt-1 block text-xs md:text-sm text-muted-foreground leading-snug">
              {i.desc}
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default ExploreGrid;
