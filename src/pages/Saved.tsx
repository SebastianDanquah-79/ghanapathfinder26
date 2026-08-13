import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, GraduationCap, Search, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSavedItems } from "@/hooks/useSavedItems";

type Tab = "university" | "scholarship" | "programme" | "career";

const tabs: { key: Tab; label: string }[] = [
  { key: "university", label: "Universities" },
  { key: "scholarship", label: "Scholarships" },
  { key: "programme", label: "Programmes" },
  { key: "career", label: "Careers" },
];

const Saved = () => {
  const { user, loading } = useAuth();
  const { data: saved = [], isLoading } = useSavedItems();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("university");

  const items = useMemo(() => saved.filter((s) => s.item_type === tab), [saved, tab]);

  const remove = async (id: string) => {
    await supabase.from("saved_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["saved_items"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
            <Bookmark className="h-6 w-6 text-primary" /> Saved
          </h1>
          <p className="text-sm text-muted-foreground mb-5">
            Everything you save syncs to your account — phone, tablet or laptop.
          </p>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-5 -mx-1 px-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`whitespace-nowrap px-4 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${
                  tab === t.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-[11px] opacity-70">
                  {saved.filter((s) => s.item_type === t.key).length}
                </span>
              </button>
            ))}
          </div>

          {!loading && !user && (
            <div className="bg-glass rounded-xl p-5 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Sign in to see everything you've saved.
              </p>
              <Link
                to="/auth"
                className="inline-flex min-h-[48px] items-center px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                Sign in
              </Link>
            </div>
          )}

          {user && isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {user && !isLoading && items.length === 0 && (
            <div className="bg-glass rounded-xl p-5 text-center">
              <p className="text-foreground font-medium mb-1">Nothing saved here yet.</p>
              <p className="text-sm text-muted-foreground mb-4">
                Tap Save on any {tab} to keep it here.
              </p>
              <Link
                to="/search"
                className="inline-flex min-h-[48px] items-center gap-2 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                <Search className="h-4 w-4" /> Start searching
              </Link>
            </div>
          )}

          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <li key={s.id} className="bg-glass rounded-xl p-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-foreground font-medium text-sm break-words">{s.title}</p>
                  {s.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5 break-words">{s.subtitle}</p>
                  )}
                  {s.item_type === "university" && (
                    <Link
                      to={`/university/${s.item_key}`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary font-medium"
                    >
                      <GraduationCap className="h-3.5 w-3.5" /> View profile
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => remove(s.id)}
                  className="shrink-0 min-h-[44px] min-w-[44px] grid place-items-center rounded-lg text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${s.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Saved;
