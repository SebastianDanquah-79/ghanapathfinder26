import { useState } from "react";
import { Link } from "@/lib/router-compat";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useCreateCollection, useDeleteCollection, useUserCollections } from "@/hooks/useUserCollections";
import { Bookmark, Loader2, Plus, Trash2 } from "@/lib/icons";
import { toast } from "sonner";

const SUGGESTED = ["My AI Career", "Ghana Trip", "Universities", "Startups to Watch", "Jobs", "Scholarships", "Research", "Places I Want to Visit"];

export default function Collections() {
  const { user, loading } = useAuth();
  const collections = useUserCollections();
  const create = useCreateCollection();
  const remove = useDeleteCollection();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!loading && !user) {
    return <div className="min-h-screen bg-background"><Navbar /><main className="mx-auto max-w-3xl px-4 pb-16 pt-24 text-center">
      <Bookmark className="mx-auto h-8 w-8 text-primary" />
      <h1 className="mt-4 font-display text-2xl font-bold text-foreground">Your collections</h1>
      <p className="mt-2 text-sm text-muted-foreground">Sign in to create and manage personal discovery collections.</p>
      <Link to="/auth" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Sign in</Link>
    </main></div>;
  }

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) { toast.error("Give the collection a name."); return; }
    try {
      await create.mutateAsync({ name: trimmed, description: description.trim() || null, visibility: "private" });
      setName(""); setDescription(""); toast.success("Collection created.");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Could not create collection."); }
  };

  return <div className="min-h-screen bg-background"><Navbar /><main className="mx-auto max-w-5xl px-4 pb-20 pt-20 sm:px-6">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">My Africa</p>
    <h1 className="mt-1 font-display text-2xl font-bold text-foreground">Collections</h1>
    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Keep universities, opportunities, companies, places and ideas together for later action.</p>

    <section className="mt-6 rounded-xl border border-border bg-card p-5">
      <h2 className="font-display font-semibold text-foreground">Create a collection</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input value={name} onChange={event => setName(event.target.value)} maxLength={100} placeholder="Collection name" className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
        <input value={description} onChange={event => setDescription(event.target.value)} maxLength={500} placeholder="Optional description" className="rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-foreground" />
        <button type="button" onClick={() => void submit()} disabled={create.isPending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
          {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Create
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {SUGGESTED.map(suggestion => <button key={suggestion} type="button" onClick={() => setName(suggestion)} className="rounded-full bg-secondary px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground">{suggestion}</button>)}
      </div>
    </section>

    <section className="mt-5">
      {collections.isLoading ? <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading collections...</div> :
       collections.error ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">Could not load collections. Try again.</div> :
       collections.data?.length ? <div className="grid gap-3 sm:grid-cols-2">{collections.data.map(collection =>
         <article key={collection.id} className="rounded-xl border border-border bg-card p-5">
           <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h2 className="font-semibold text-foreground">{collection.name}</h2>{collection.description && <p className="mt-1 text-sm text-muted-foreground">{collection.description}</p>}<p className="mt-3 text-xs uppercase tracking-wide text-muted-foreground">{collection.visibility}</p></div>
             <button type="button" onClick={() => remove.mutate(collection.id)} disabled={remove.isPending} aria-label={"Delete " + collection.name} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
           </div>
         </article>
       )}</div> :
       <div className="rounded-xl border border-dashed border-border p-8 text-center"><p className="font-medium text-foreground">No collections yet.</p><p className="mt-1 text-sm text-muted-foreground">Create one above, then save items into it from discovery pages.</p></div>}
    </section>
  </main></div>;
}
