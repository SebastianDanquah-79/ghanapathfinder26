import { Link } from "@/lib/router-compat";
import { Trash2 } from "@/lib/icons";
import {
  PIPELINE_LABEL,
  PIPELINE_STAGES,
  usePipeline,
  useDeletePipeline,
  useUpdatePipeline,
  type PipelineStage,
} from "@/hooks/usePipeline";
import { daysLeft } from "@/lib/opportunityFormat";

const input =
  "w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-sm";

/** Jobs, internships and programmes the student is tracking (opportunity_pipeline). */
const PipelineTracker = () => {
  const { data: rows = [], isLoading } = usePipeline();
  const update = useUpdatePipeline();
  const remove = useDeletePipeline();

  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-semibold text-foreground">
        Jobs, internships & programmes
      </h2>
      <p className="text-sm text-muted-foreground mb-3">
        Use "Track this" on any{" "}
        <Link to="/opportunities" className="text-primary underline">
          opportunity
        </Link>{" "}
        to add it here.
      </p>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {!isLoading && !rows.length && (
        <p className="text-sm text-muted-foreground rounded-xl border border-border p-4">
          Nothing tracked yet.
        </p>
      )}
      <div className="space-y-3">
        {rows.map((r) => {
          const d = daysLeft(r.deadline_date);
          return (
            <div key={r.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium text-foreground break-words">
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                      >
                        {r.title}
                      </a>
                    ) : (
                      r.title
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {[
                      r.organisation,
                      r.item_kind,
                      d === null ? null : d < 0 ? "Closed" : `${d} days left`,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <button
                  onClick={() => remove.mutate(r.id)}
                  aria-label={`Remove ${r.title}`}
                  className="p-1 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 mt-3">
                <select
                  className={input}
                  value={r.stage}
                  aria-label="Stage"
                  onChange={(e) =>
                    update.mutate({
                      id: r.id,
                      patch: { stage: e.target.value },
                    })
                  }
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {PIPELINE_LABEL[s as PipelineStage]}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  className={input}
                  aria-label="Deadline"
                  value={r.deadline_date ?? ""}
                  onChange={(e) =>
                    update.mutate({
                      id: r.id,
                      patch: { deadline_date: e.target.value || null },
                    })
                  }
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PipelineTracker;
