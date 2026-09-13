import { useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, ShieldCheck } from "@/lib/icons";
import { useAuth } from "@/hooks/useAuth";
import { useIsAdmin } from "@/hooks/useAdminData";
import {
  REVIEW_FIELDS,
  TABLE_LABELS,
  rowTitle,
  useCorrections,
  useRejectRow,
  useResolveCorrection,
  useReviewAction,
  useReviewCounts,
  useReviewQueue,
  type ReviewRow,
  type ReviewTable,
} from "@/hooks/useReviewQueue";

const TABLES: ReviewTable[] = ["universities", "programmes", "internship_providers", "skill_providers"];

const ReviewCard = ({ table, row }: { table: ReviewTable; row: ReviewRow }) => {
  const [draft, setDraft] = useState<Record<string, any>>({});
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const action = useReviewAction();
  const reject = useRejectRow();
  const label = rowTitle(table, row);
  const fields = REVIEW_FIELDS[table];
  const changed = Object.keys(draft).length > 0;
  const sources: string[] = (row["source_urls"] as string[] | null) ?? [];

  const set = (key: string, value: any) => setDraft((d) => ({ ...d, [key]: value }));

  const approve = async () => {
    if (changed && !confirm(`Save ${Object.keys(draft).length} edit(s) and mark "${label}" as reviewed?`)) return;
    try {
      await action.mutateAsync({ table, id: row["id"], patch: changed ? draft : {}, approve: true });
      toast.success(`${label} approved`);
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    }
  };

  const save = async () => {
    try {
      await action.mutateAsync({ table, id: row["id"], patch: draft });
      setDraft({});
      toast.success("Edits saved, still in review");
    } catch (e: any) {
      toast.error(e?.message ?? "Could not save");
    }
  };

  return (
    <article className="rounded-xl border border-border bg-card p-4 space-y-3">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-base font-semibold text-foreground">{label}</h3>
        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {row["institution_type"] ?? row["sector"] ?? row["skill_area"] ?? row["universities"]?.name ?? "—"}
        </span>
      </header>

      <div className="grid gap-2 md:grid-cols-2">
        {fields.map((f) => {
          const value = f.key in draft ? draft[f.key] : (row[f.key] ?? "");
          if (f.type === "boolean") {
            return (
              <label key={f.key} className="flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={!!value} onChange={(e) => set(f.key, e.target.checked)} />
                {f.label}
              </label>
            );
          }
          return (
            <label key={f.key} className="text-xs text-muted-foreground space-y-1">
              <span>{f.label}</span>
              {f.type === "textarea" ? (
                <textarea
                  value={value ?? ""}
                  rows={3}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full rounded-lg bg-secondary border border-border p-2 text-sm text-foreground"
                />
              ) : (
                <input
                  value={value ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  className="w-full min-h-[38px] rounded-lg bg-secondary border border-border px-2 text-sm text-foreground"
                />
              )}
            </label>
          );
        })}
      </div>

      {sources.length > 0 && (
        <ul className="text-[11px] text-muted-foreground space-y-0.5">
          {sources.map((s) => (
            <li key={s} className="truncate">
              Source:{" "}
              <a href={s} target="_blank" rel="noreferrer noopener" className="text-primary underline underline-offset-2">
                {s}
              </a>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={approve}
          disabled={action.isPending}
          className="px-3 min-h-[38px] rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50"
        >
          Approve &amp; publish
        </button>
        <button
          onClick={save}
          disabled={!changed || action.isPending}
          className="px-3 min-h-[38px] rounded-lg border border-border text-xs text-foreground disabled:opacity-40"
        >
          Save edits only
        </button>
        <button
          onClick={() => setRejecting((v) => !v)}
          className="px-3 min-h-[38px] rounded-lg border border-border text-xs text-destructive"
        >
          Reject
        </button>
      </div>

      {rejecting && (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Why is this wrong? (kept in the corrections log)"
            className="w-full rounded-lg bg-secondary border border-border p-2 text-sm text-foreground"
          />
          <button
            onClick={async () => {
              if (reason.trim().length < 4) {
                toast.error("Add a short reason");
                return;
              }
              await reject.mutateAsync({ table, id: row["id"], label, note: reason.trim() });
              setRejecting(false);
              setReason("");
              toast.success("Logged — record stays unpublished");
            }}
            className="px-3 min-h-[38px] rounded-lg bg-destructive text-xs font-semibold text-primary-foreground"
          >
            Log rejection
          </button>
        </div>
      )}
    </article>
  );
};

const AdminReview = () => {
  const { user, loading } = useAuth();
  const { data: isAdmin, isLoading: roleLoading } = useIsAdmin();
  const enabled = !!isAdmin;
  const [table, setTable] = useState<ReviewTable>("universities");
  const counts = useReviewCounts(enabled);
  const queue = useReviewQueue(table, enabled);
  const corrections = useCorrections(enabled);
  const resolve = useResolveCorrection();

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 pb-12 px-4">
          <div className="max-w-2xl mx-auto rounded-xl border border-border p-5 text-center">
            <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-3" />
            <h1 className="font-display text-xl font-bold text-foreground">Admin access required</h1>
            <p className="text-sm text-muted-foreground mt-2">The review queue is limited to administrators.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const open = (corrections.data ?? []).filter((c: any) => !c.resolved);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-12 px-4 sm:px-8 lg:px-12">
        <div className="max-w-5xl mx-auto space-y-6">
          <header>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Review queue</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Nothing here is shown to students until it is approved. Check each record against its official source
              before publishing.
            </p>
          </header>

          <div className="flex flex-wrap gap-2">
            {TABLES.map((t) => (
              <button
                key={t}
                onClick={() => setTable(t)}
                className={`px-3 min-h-[38px] rounded-lg border text-xs font-medium ${
                  table === t ? "border-primary text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {TABLE_LABELS[t]} ({counts.data?.[t] ?? 0})
              </button>
            ))}
          </div>

          {queue.isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (queue.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing waiting in {TABLE_LABELS[table].toLowerCase()}.</p>
          ) : (
            <div className="space-y-3">
              {(queue.data ?? []).map((row) => (
                <ReviewCard key={row["id"]} table={table} row={row} />
              ))}
            </div>
          )}

          <section className="space-y-2">
            <h2 className="font-display text-lg font-semibold text-foreground">
              Reported by visitors ({open.length})
            </h2>
            {open.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open reports.</p>
            ) : (
              open.map((c: any) => (
                <div key={c.id} className="rounded-xl border border-border p-3 text-sm">
                  <p className="text-foreground">{c.note}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {c.row_label ?? c.table_name} · {new Date(c.submitted_at).toLocaleString()}
                  </p>
                  <button
                    onClick={() => resolve.mutate(c.id)}
                    className="mt-2 px-3 min-h-[34px] rounded-lg border border-border text-xs text-foreground"
                  >
                    Mark resolved
                  </button>
                </div>
              ))
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminReview;
