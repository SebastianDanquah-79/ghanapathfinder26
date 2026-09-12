import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";

type Programme = { name: string; url: string | null };

export default function OfficialProgrammes({ websiteUrl }: { websiteUrl?: string | null }) {
  const [items, setItems] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!websiteUrl) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/institution-programmes?url=${encodeURIComponent(websiteUrl)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((value: { programmes?: Programme[] } | null) => {
        if (!cancelled) setItems(value?.programmes ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [websiteUrl]);

  if (!websiteUrl || (!loading && items.length === 0)) return null;

  return (
    <section className="mt-6 bg-glass rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">More programmes from the official website</h2>
          <p className="mt-1 text-xs text-muted-foreground">These are discovered directly from the institution's published website and are not treated as GTEC accreditation records.</p>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
      </div>
      {!loading && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((item) => (
            <a key={`${item.name}-${item.url ?? ""}`} href={item.url ?? websiteUrl} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40">
              <span className="line-clamp-2 text-foreground">{item.name}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
