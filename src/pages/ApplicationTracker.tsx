import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList, ExternalLink, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { celebrate } from "@/lib/celebrate";
import { scholarships } from "@/data/scholarships";
import { estimateDeadlineDate, toISODate, daysUntil, urgencyLabel } from "@/lib/scholarshipDates";
import {
  APPLICATION_STATUSES,
  ApplicationStatus,
  STATUS_META,
  useAddApplication,
  useApplications,
  useDeleteApplication,
  useUpdateApplication,
} from "@/hooks/useApplications";
import Navbar from "@/components/Navbar";

const card = "bg-glass rounded-xl p-5";
const input =
  "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/50";

const ApplicationTracker = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { data: apps = [], isLoading } = useApplications();
  const addApp = useAddApplication();
  const updateApp = useUpdateApplication();
  const deleteApp = useDeleteApplication();

  const [picked, setPicked] = useState("");
  const [manual, setManual] = useState("");
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");

  if (!loading && !user) {
    navigate("/auth", { replace: true });
  }

  const visible = useMemo(
    () => (filter === "all" ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    apps.forEach((a) => (c[a.status] = (c[a.status] ?? 0) + 1));
    return c;
  }, [apps]);

  const submittedCount = apps.filter((a) =>
    ["submitted", "interview", "awarded"].includes(a.status),
  ).length;

  const addFromCatalogue = async () => {
    const s = scholarships.find((x) => x.name === picked);
    if (!s) return;
    if (apps.some((a) => a.scholarship_name === s.name)) return toast.info("Already in your tracker");
    const date = estimateDeadlineDate(s.deadline);
    await addApp.mutateAsync({
      scholarship_name: s.name,
      provider: s.provider,
      link: s.link ?? null,
      deadline: date ? toISODate(date) : null,
    });
    setPicked("");
    celebrate("Added to your tracker", `${s.name} is now part of your application pipeline.`);
  };

  const addManual = async () => {
    const name = manual.trim();
    if (!name) return;
    if (apps.some((a) => a.scholarship_name.toLowerCase() === name.toLowerCase()))
      return toast.info("Already in your tracker");
    await addApp.mutateAsync({ scholarship_name: name });
    setManual("");
    celebrate("Added to your tracker", "Update its status as you make progress.");
  };

  const setStatus = async (id: string, status: ApplicationStatus, name: string) => {
    await updateApp.mutateAsync({
      id,
      patch: { status, submitted_at: status === "submitted" ? new Date().toISOString().slice(0, 10) : undefined },
    });
    if (status === "submitted") celebrate("Application submitted", `${name} is officially in. Well done.`);
    if (status === "awarded") celebrate("You were awarded!", `${name} came through. Enjoy this one.`);
  };

  return (
    <div className="min-h-screen bg-background px-4 sm:px-8 lg:px-12 pt-20 pb-12">
      <Navbar />
      <div className="max-w-7xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Application tracker
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Every scholarship you are chasing, and exactly where each one stands.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 mb-5">
          <div className={card}>
            <p className="text-xs text-muted-foreground">Tracking</p>
            <p className="font-display text-2xl font-bold text-foreground">{apps.length}</p>
          </div>
          <div className={card}>
            <p className="text-xs text-muted-foreground">Submitted or further</p>
            <p className="font-display text-2xl font-bold text-foreground">{submittedCount}</p>
          </div>
          <div className={card}>
            <p className="text-xs text-muted-foreground">Awarded</p>
            <p className="font-display text-2xl font-bold text-foreground">{counts.awarded ?? 0}</p>
          </div>
        </div>

        <div className={`${card} mb-5`}>
          <h2 className="font-display font-semibold text-foreground mb-3">Add an application</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex gap-2">
              <select className={input} value={picked} onChange={(e) => setPicked(e.target.value)}>
                <option value="">Pick from GhanaPath scholarships</option>
                {scholarships.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={addFromCatalogue}
                disabled={!picked || addApp.isPending}
                className="px-3 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
                aria-label="Add selected scholarship"
              >
                {addApp.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </button>
            </div>
            <div className="flex gap-2">
              <input
                className={input}
                placeholder="Or type any other scholarship"
                maxLength={140}
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addManual()}
              />
              <button
                onClick={addManual}
                disabled={!manual.trim() || addApp.isPending}
                className="px-3 rounded-lg bg-secondary text-foreground disabled:opacity-50"
                aria-label="Add custom scholarship"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", ...APPLICATION_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {s === "all" ? `All (${apps.length})` : `${STATUS_META[s].label} (${counts[s] ?? 0})`}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading your applications…</p>}
          {!isLoading && !visible.length && (
            <div className={card}>
              <p className="text-sm text-muted-foreground">
                {apps.length
                  ? "Nothing in this stage yet."
                  : "Add your first scholarship above — even one entry makes the next step obvious."}
              </p>
            </div>
          )}

          {visible.map((a) => {
            const meta = STATUS_META[(a.status as ApplicationStatus) ?? "interested"] ?? STATUS_META.interested;
            const u = a.deadline ? urgencyLabel(daysUntil(a.deadline)) : null;
            return (
              <div key={a.id} className={card}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground break-words">{a.scholarship_name}</h3>
                    {a.provider && <p className="text-xs text-muted-foreground">{a.provider}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${meta.tone}`}>
                      {meta.label}
                    </span>
                    <button
                      onClick={() => deleteApp.mutate(a.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                      aria-label={`Remove ${a.scholarship_name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      a.status === "rejected" ? "bg-destructive/60" : "bg-primary"
                    }`}
                    style={{ width: `${(meta.step / 5) * 100}%` }}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  <label className="text-xs text-muted-foreground">
                    Status
                    <select
                      className={`${input} mt-1`}
                      value={a.status}
                      onChange={(e) => setStatus(a.id, e.target.value as ApplicationStatus, a.scholarship_name)}
                    >
                      {APPLICATION_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Deadline
                    <input
                      type="date"
                      className={`${input} mt-1`}
                      value={a.deadline ?? ""}
                      onChange={(e) => updateApp.mutate({ id: a.id, patch: { deadline: e.target.value || null } })}
                    />
                  </label>
                </div>

                <textarea
                  className={`${input} mt-3 min-h-20`}
                  placeholder="Notes — documents needed, referees, essay ideas…"
                  defaultValue={a.notes ?? ""}
                  maxLength={1000}
                  onBlur={(e) => {
                    if (e.target.value !== (a.notes ?? "")) {
                      updateApp.mutate({ id: a.id, patch: { notes: e.target.value || null } });
                    }
                  }}
                />

                <div className="flex flex-wrap items-center gap-3 mt-3">
                  {u && <span className={`text-xs ${u.tone}`}>{u.text}</span>}
                  {a.link && (
                    <a
                      href={a.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-primary"
                    >
                      Official page <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApplicationTracker;
