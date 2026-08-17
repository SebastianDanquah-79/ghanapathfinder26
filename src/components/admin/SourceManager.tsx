import { useState } from "react";
import { Loader2, Link2, Trash2, Search as SearchIcon } from "@/lib/icons";
import { toast } from "sonner";
import {
  RECORD_TYPES,
  SOURCE_STATUSES,
  SOURCE_TYPES,
  useAdminSources,
  useDeleteSource,
  useSaveSource,
  useSourceTargets,
  type DataSource,
} from "@/hooks/useAdminSources";
import { formatVerified, prettyHost, sourceTypeLabel } from "@/lib/legal";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  id: undefined as string | undefined,
  record_type: "institution",
  record_id: "",
  targetLabel: "",
  source_url: "",
  source_name: "",
  source_type: "official_university",
  verification_status: "verified",
  verified_at: today(),
  notes: "",
};

const field = "min-h-[44px] w-full rounded-lg bg-secondary border border-border text-xs text-foreground px-3";

/** Admin-only CRUD for the source records behind the public References page. */
const SourceManager = ({ enabled }: { enabled: boolean }) => {
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [targetSearch, setTargetSearch] = useState("");
  const sources = useAdminSources(search, enabled);
  const targets = useSourceTargets(form.record_type, targetSearch, enabled);
  const save = useSaveSource();
  const remove = useDeleteSource();

  const set = (patch: Partial<typeof emptyForm>) => setForm((f) => ({ ...f, ...patch }));

  const edit = (s: DataSource) => {
    setForm({
      id: s.id,
      record_type: s.record_type,
      record_id: s.record_id,
      targetLabel: "",
      source_url: s.source_url,
      source_name: s.source_name ?? "",
      source_type: s.source_type,
      verification_status: s.verification_status,
      verified_at: (s.verified_at ?? new Date().toISOString()).slice(0, 10),
      notes: (s as DataSource & { notes?: string | null }).notes ?? "",
    });
    setTargetSearch("");
  };

  const submit = async () => {
    if (!form.record_id || !form.source_url.trim()) {
      toast.error("Attach the source to a record and add its URL");
      return;
    }
    try {
      await save.mutateAsync(form);
      toast.success(form.id ? "Source updated" : "Source added");
      setForm({ ...emptyForm, record_type: form.record_type });
      setTargetSearch("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save source");
    }
  };

  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-foreground mb-1 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-primary" /> Source management
      </h2>
      <p className="text-xs text-muted-foreground mb-3">
        Records added here power the public References &amp; Acknowledgements directory. Only add a
        source when the information was actually verified there.
      </p>

      <div className="bg-glass rounded-xl p-4 grid gap-3 lg:grid-cols-3">
        <select
          value={form.record_type}
          onChange={(e) => set({ record_type: e.target.value, record_id: "", targetLabel: "" })}
          className={field}
        >
          {RECORD_TYPES.map((t) => (
            <option key={t} value={t}>
              Connect to: {t}
            </option>
          ))}
        </select>

        <div className="lg:col-span-2">
          <input
            value={form.targetLabel || targetSearch}
            onChange={(e) => {
              setTargetSearch(e.target.value);
              set({ targetLabel: "", record_id: "" });
            }}
            placeholder={`Search ${form.record_type} to attach`}
            className={field}
          />
          {!form.record_id && (targets.data ?? []).length > 0 && (
            <div className="mt-1 max-h-40 overflow-y-auto rounded-lg border border-border bg-card">
              {(targets.data ?? []).map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    set({ record_id: t.id, targetLabel: t.label });
                    setTargetSearch("");
                  }}
                  className="block w-full text-left px-3 py-2 text-xs text-muted-foreground hover:text-primary hover:bg-secondary/60"
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <input
          value={form.source_name}
          onChange={(e) => set({ source_name: e.target.value })}
          placeholder="Source name (e.g. GTEC accredited institutions)"
          className={field}
        />
        <input
          value={form.source_url}
          onChange={(e) => set({ source_url: e.target.value })}
          placeholder="https://official-source.gov.gh/page"
          className={`${field} lg:col-span-2`}
        />

        <select value={form.source_type} onChange={(e) => set({ source_type: e.target.value })} className={field}>
          {SOURCE_TYPES.map((t) => (
            <option key={t} value={t}>
              {sourceTypeLabel(t)}
            </option>
          ))}
        </select>
        <select
          value={form.verification_status}
          onChange={(e) => set({ verification_status: e.target.value })}
          className={field}
        >
          {SOURCE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={form.verified_at}
          onChange={(e) => set({ verified_at: e.target.value })}
          className={field}
        />

        <input
          value={form.notes}
          onChange={(e) => set({ notes: e.target.value })}
          placeholder="Notes (what exactly was verified here)"
          className={`${field} lg:col-span-2`}
        />
        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={save.isPending}
            className="flex-1 min-h-[44px] rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
          >
            {save.isPending ? "Saving…" : form.id ? "Update source" : "Add source"}
          </button>
          {form.id && (
            <button
              onClick={() => {
                setForm(emptyForm);
                setTargetSearch("");
              }}
              className="px-3 min-h-[44px] rounded-lg bg-secondary text-xs text-muted-foreground"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="relative my-3 max-w-md">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search stored sources"
          className="w-full pl-10 pr-3 min-h-[44px] rounded-xl bg-secondary border border-border text-sm text-foreground"
        />
      </div>

      {sources.isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      ) : (
        <div className="space-y-2">
          {(sources.data ?? []).map((s) => (
            <div key={s.id} className="bg-glass rounded-xl p-3 flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-foreground truncate">{s.source_name ?? prettyHost(s.source_url)}</p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {sourceTypeLabel(s.source_type)} • {s.record_type} • {s.verification_status} • Last
                  verified: {formatVerified(s.verified_at) ?? "unknown"}
                </p>
                <a
                  href={s.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-primary"
                >
                  {prettyHost(s.source_url)}
                </a>
              </div>
              <button onClick={() => edit(s)} className="text-xs text-primary font-medium px-2 min-h-[40px]">
                Edit
              </button>
              <button
                onClick={() => {
                  if (confirm("Remove this source record?")) remove.mutate(s.id);
                }}
                className="text-xs text-destructive px-2 min-h-[40px] inline-flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            </div>
          ))}
          {(sources.data ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground">No source records match this search.</p>
          )}
        </div>
      )}
    </section>
  );
};

export default SourceManager;
