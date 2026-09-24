import { useMemo, useState } from "react";
import { Link, useSearchParams } from "@/lib/router-compat";
import { Bookmark, GraduationCap, Search, BookOpen, ExternalLink, Loader2, Plus, Trash2 } from "@/lib/icons";
import { useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import ConfirmRemoveButton from "@/components/ConfirmRemoveButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSavedItems } from "@/hooks/useSavedItems";
import { useCreateCollection, useDeleteCollection, useUserCollections } from "@/hooks/useUserCollections";
import { toast } from "sonner";

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
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>("university");
  const showCollections = params.get("tab") === "collections";
  const collections = useUserCollections();
  const createCollection = useCreateCollection();
  const deleteCollection = useDeleteCollection();
  const [collectionName, setCollectionName] = useState("");

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
            Everything you save syncs to your account , phone, tablet or laptop.
          </p>

          {showCollections ? (
            <section className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h2 className="font-display font-semibold text-foreground">Collections</h2>
                <p className="mt-1 text-sm text-muted-foreground">Organise saved universities, opportunities, companies, places and ideas into private lists.</p>
                <div className="mt-4 flex gap-2">
                  <input value={collectionName} onChange={(event) => setCollectionName(event.target.value)} maxLength={100} placeholder="Collection name" className="min-w-0 flex-1 rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
                  <button type="button" disabled={createCollection.isPending} onClick={() => {
                    const name = collectionName.trim();
                    if (!name) { toast.error("Give the collection a name."); return; }
                    void createCollection.mutateAsync({ name, description: null, visibility: "private" }).then(() => { setCollectionName(""); toast.success("Collection created."); }).catch((error: unknown) => toast.error(error instanceof Error ? error.message : "Could not create collection."));
                  }} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                    {createCollection.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
                  </button>
                </div>
              </div>
              {collections.isLoading ? <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading collections...</div> :
               collections.error ? <div className="rounded-xl border border-destructive/30 p-5 text-sm text-destructive">Could not load collections.</div> :
               collections.data?.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{collections.data.map(collection => (
                 <article key={collection.id} className="rounded-xl border border-border bg-card p-5">
                   <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-foreground">{collection.name}</h3><p className="mt-1 text-xs text-muted-foreground">{collection.visibility}</p></div>
                     <button type="button" aria-label={"Delete " + collection.name} onClick={() => deleteCollection.mutate(collection.id)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                   </div>
                 </article>
               ))}</div> :
               <div className="rounded-xl border border-dashed border-border p-8 text-center"><p className="font-medium text-foreground">No collections yet.</p><p className="mt-1 text-sm text-muted-foreground">Create one above to organise future discoveries.</p></div>}
            </section>
          ) : (
          <div className="flex gap-2 [&>*]:shrink-0 hscroll hscroll-bleed pb-2 mb-5">
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
          )}

          <div className="flex gap-2 [&>*]:shrink-0 hscroll hscroll-bleed pb-2 mb-5">
            <Link to="/saved" className="whitespace-nowrap px-4 min-h-[44px] rounded-xl text-sm font-medium bg-secondary text-muted-foreground">Saved items</Link>
            <Link to="/saved?tab=collections" className="whitespace-nowrap px-4 min-h-[44px] rounded-xl text-sm font-medium bg-secondary text-muted-foreground">Collections</Link>
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
                  {s.item_type === "programme" && (
                    <Link
                      to={`/programme/${s.item_key}`}
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary font-medium"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> View profile
                    </Link>
                  )}
                  {s.item_type === "scholarship" && (
                    <Link
                      to="/scholarships"
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary font-medium"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View details
                    </Link>
                  )}
                </div>
                <ConfirmRemoveButton
                  title={s.title}
                  itemLabel={s.item_type}
                  onConfirm={() => remove(s.id)}
                />
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Saved;
