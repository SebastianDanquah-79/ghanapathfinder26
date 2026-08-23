import { useState } from "react";
import { toast } from "sonner";
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import {
  INSIGHT_CATEGORIES,
  STUDENT_STATUSES,
  useCreateInsight,
  useReportInsight,
  useUniversityInsights,
  type StudentInsight,
} from "@/hooks/useInsights";

const REPORT_REASONS = [
  { value: "misinformation", label: "Misinformation" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
];

const field =
  "w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const InsightCard = ({ insight }: { insight: StudentInsight }) => {
  const { user } = useAuth();
  const report = useReportInsight();
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("misinformation");
  const [expanded, setExpanded] = useState(false);
  const long = insight.body.length > 260;

  return (
    <article className="bg-glass rounded-xl p-4 space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
          Student Insight
        </span>
        <span className="text-muted-foreground">Anonymous — {insight.student_status}</span>
        {insight.programme && <span className="text-muted-foreground">· {insight.programme}</span>}
        {insight.rating && <span className="text-primary">· {insight.rating}/5</span>}
        <span className="ml-auto text-muted-foreground">
          {new Date(insight.created_at).toLocaleDateString()}
        </span>
      </div>

      <p className="text-xs text-primary">{insight.category}</p>

      <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
        {long && !expanded ? `${insight.body.slice(0, 260)}…` : insight.body}
      </p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-primary hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      {(insight.image_paths ?? []).length > 0 && (
        <div
          className={`grid gap-2 ${
            (insight.image_paths ?? []).length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {(insight.image_paths ?? []).map((path) => {
            const url = imageUrls?.get(path);
            if (!url) return null;
            return (
              <a
                key={path}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden rounded-xl bg-secondary"
              >
                <img
                  src={url}
                  alt="Photo shared by a student"
                  loading="lazy"
                  className="w-full max-h-72 object-cover"
                />
              </a>
            );
          })}
        </div>
      )}


      {insight.wish_i_knew && (
        <div className="rounded-lg bg-secondary/60 p-3">
          <p className="text-xs font-medium text-foreground mb-1">What I wish I knew before coming here</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{insight.wish_i_knew}</p>
        </div>
      )}
      {insight.advice && (
        <div className="rounded-lg bg-secondary/60 p-3">
          <p className="text-xs font-medium text-foreground mb-1">Advice for prospective students</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{insight.advice}</p>
        </div>
      )}

      {!reporting ? (
        <button
          type="button"
          onClick={() => {
            if (!user) {
              toast.error("Sign in to report an insight.");
              return;
            }
            setReporting(true);
          }}
          className="text-[11px] text-muted-foreground hover:text-foreground underline"
        >
          Report this insight
        </button>
      ) : (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={`${field} max-w-[200px]`}>
            {REPORT_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={report.isPending}
            onClick={() => {
              report.mutate(
                { insight_id: insight.id, reason },
                {
                  onSuccess: () => {
                    toast.success("Thanks — our team will review this.");
                    setReporting(false);
                  },
                  onError: (e: Error) => toast.error(e.message),
                },
              );
            }}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium"
          >
            Send report
          </button>
          <button
            type="button"
            onClick={() => setReporting(false)}
            className="px-3 py-2 rounded-lg bg-secondary text-xs text-muted-foreground"
          >
            Cancel
          </button>
        </div>
      )}
    </article>
  );
};

interface Props {
  universityId: string;
  universityName: string;
}

const StudentInsights = ({ universityId, universityName }: Props) => {
  const { user } = useAuth();
  const { data: insights, isLoading } = useUniversityInsights(universityId);
  const create = useCreateInsight();
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [form, setForm] = useState({
    student_status: STUDENT_STATUSES[0] as string,
    category: INSIGHT_CATEGORIES[0] as string,
    programme: "",
    year_of_study: "",
    rating: "",
    body: "",
    wish_i_knew: "",
    advice: "",
  });

  const list = insights ?? [];
  const visible = showAll ? list : list.slice(0, 3);

  const submit = () => {
    if (form.body.trim().length < 20) {
      toast.error("Please write at least 20 characters about your experience.");
      return;
    }
    create.mutate(
      {
        university_id: universityId,
        student_status: form.student_status,
        category: form.category,
        programme: form.programme,
        year_of_study: form.year_of_study,
        rating: form.rating ? Number(form.rating) : null,
        body: form.body.trim(),
        wish_i_knew: form.wish_i_knew,
        advice: form.advice,
      },
      {
        onSuccess: () => {
          toast.success("Shared anonymously. Thank you!");
          setOpen(false);
          setForm({ ...form, body: "", wish_i_knew: "", advice: "", rating: "" });
        },
        onError: (e: Error) => toast.error(e.message),
      },
    );
  };

  return (
    <section className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="font-display text-lg font-semibold text-foreground">Student Insights</h2>
        <button
          type="button"
          onClick={() => {
            if (!user) {
              toast.error("Sign in to share your experience.");
              return;
            }
            setOpen((v) => !v);
          }}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium min-h-[40px]"
        >
          {open ? "Close" : "Share your experience"}
        </button>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        These are personal student experiences shared anonymously — not official information from{" "}
        {universityName}. Always confirm facts with the official website.
      </p>

      {open && (
        <div className="bg-glass rounded-xl p-4 space-y-3 mb-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-xs text-muted-foreground space-y-1">
              <span>School / university (required)</span>
              <input className={field} value={universityName} readOnly />
            </label>
            <label className="text-xs text-muted-foreground space-y-1">
              <span>You are a…</span>
              <select
                className={field}
                value={form.student_status}
                onChange={(e) => setForm({ ...form, student_status: e.target.value })}
              >
                {STUDENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted-foreground space-y-1">
              <span>Topic</span>
              <select
                className={field}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {INSIGHT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted-foreground space-y-1">
              <span>Programme (optional)</span>
              <input
                className={field}
                value={form.programme}
                placeholder="e.g. BSc Computer Science"
                onChange={(e) => setForm({ ...form, programme: e.target.value })}
              />
            </label>
            <label className="text-xs text-muted-foreground space-y-1">
              <span>Year of study (optional)</span>
              <input
                className={field}
                value={form.year_of_study}
                placeholder="e.g. Level 200"
                onChange={(e) => setForm({ ...form, year_of_study: e.target.value })}
              />
            </label>
            <label className="text-xs text-muted-foreground space-y-1">
              <span>Overall rating (optional)</span>
              <select
                className={field}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
              >
                <option value="">No rating</option>
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} / 5
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="text-xs text-muted-foreground space-y-1 block">
            <span>Your experience</span>
            <textarea
              className={`${field} min-h-[110px]`}
              maxLength={4000}
              value={form.body}
              placeholder="Academics, accommodation, food, transport, facilities, cost of living…"
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />
          </label>
          <label className="text-xs text-muted-foreground space-y-1 block">
            <span>What I wish I knew before coming here (optional)</span>
            <textarea
              className={`${field} min-h-[70px]`}
              maxLength={2000}
              value={form.wish_i_knew}
              onChange={(e) => setForm({ ...form, wish_i_knew: e.target.value })}
            />
          </label>
          <label className="text-xs text-muted-foreground space-y-1 block">
            <span>Advice for prospective students (optional)</span>
            <textarea
              className={`${field} min-h-[70px]`}
              maxLength={2000}
              value={form.advice}
              onChange={(e) => setForm({ ...form, advice: e.target.value })}
            />
          </label>

          <p className="text-[11px] text-muted-foreground">
            Your name, email and contact details are never shown. Posts appear as “Anonymous —{" "}
            {form.student_status}”. Harassment, misinformation and personal attacks are removed.
          </p>

          <button
            type="button"
            onClick={submit}
            disabled={create.isPending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium min-h-[44px] disabled:opacity-60"
          >
            {create.isPending ? "Sharing…" : "Share anonymously"}
          </button>
        </div>
      )}

      {isLoading && <p className="text-sm text-muted-foreground py-4">Loading student insights…</p>}

      {!isLoading && list.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">
          No student insights yet.{" "}
          {user ? "Be the first to share what studying here is really like." : (
            <Link to="/auth" className="text-primary hover:underline">
              Sign in to be the first to share.
            </Link>
          )}
        </p>
      )}

      <div className="space-y-3">
        {visible.map((i) => (
          <InsightCard key={i.id} insight={i as StudentInsight} />
        ))}
      </div>

      {list.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 px-3 py-2 rounded-lg bg-secondary text-xs text-muted-foreground hover:text-foreground"
        >
          {showAll ? "Show fewer" : `Show all ${list.length} insights`}
        </button>
      )}
    </section>
  );
};

export default StudentInsights;
