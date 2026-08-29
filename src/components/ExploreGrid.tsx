import { Link } from "@/lib/router-compat";
import { navSections } from "@/lib/nav-config";

const ExploreGrid = () => (
  <section aria-labelledby="explore" className="border-t border-border bg-card/30">
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
      <h2 id="explore" className="font-display text-lg md:text-xl font-semibold text-foreground">
        Start here
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Discover, match, compare and plan — one step at a time.
      </p>
      <div className="mt-4 space-y-5">
        {navSections.map(({ id, label, icon: Icon, items }) => (
          <div key={id}>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Icon className="h-4 w-4" /> {label}
            </div>
            <div className="mt-2 grid grid-cols-2 lg:grid-cols-4 gap-2.5">
              {items.map((i) => (
                <Link
                  key={i.href}
                  to={i.href}
                  className="group rounded-xl border border-border bg-background p-3 md:p-4 transition-colors hover:border-primary/50 hover:bg-primary/5"
                >
                  <span className="block text-sm md:text-base font-semibold text-foreground group-hover:text-primary">
                    {i.label}
                  </span>
                  {i.desc && (
                    <span className="mt-1 block text-xs md:text-sm text-muted-foreground leading-snug">
                      {i.desc}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ExploreGrid;
