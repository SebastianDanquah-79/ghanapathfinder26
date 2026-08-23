import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  INSIGHT_CATEGORIES,
  STUDENT_STATUSES,
  useCreateInsight,
} from "@/hooks/useInsights";

const field =
  "w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

const useUniversitySearch = (term: string) =>
  useQuery({
    queryKey: ["insight-uni-search", term],
    queryFn: async () => {
      let q = supabase
        .from("universities")
        .select("id, name, location")
        .order("name")
        .limit(20);
      if (term.trim()) q = q.ilike("name", `%${term.trim()}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 60_000,
  });

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-selected institution when posting from a university page. */
  universityId?: string;
}

const PostInsightDialog = ({ open, onClose, universityId }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const create = useCreateInsight();

  const [term, setTerm] = useState("");
  const [uniId, setUniId] = useState(universityId ?? "");
  const [status, setStatus] = useState<string>(STUDENT_STATUSES[0]);
  const [category, setCategory] = useState<string>(INSIGHT_CATEGORIES[0]);
  const [programme, setProgramme] = useState("");
  const [body, setBody] = useState("");

  const { data: unis } = useUniversitySearch(term);

  useEffect(() => {
    if (universityId) setUniId(universityId);
  }, [universityId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const canPost = useMemo(() => !!uniId && body.trim().length >= 20, [uniId, body]);

  if (!open) return null;

  const submit = () => {
    if (!user) {
      toast.error("Sign in to share your experience.");
      navigate("/auth");
      return;
    }
    if (!canPost) {
      toast.error("Pick your institution and write at least 20 characters.");
      return;
    }
    create.mutate(
      {
        university_id: uniId,
        student_status: status,
        category,
        programme: programme || null,
        body: body.trim(),
      },
      {
        onSuccess: () => {
          toast.success("Posted — thanks for helping other students.");
          setBody("");
          setProgramme("");
          onClose();
        },
        onError: (e: unknown) =>
          toast.error(e instanceof Error ? e.message : "Could not post your experience."),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share your experience"
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-foreground">Share an experience</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-secondary"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Posts appear anonymously. Share what you honestly experienced — no names, no abuse.
        </p>

        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Institution</label>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search your university or college…"
            className={field}
          />
          <select value={uniId} onChange={(e) => setUniId(e.target.value)} className={field}>
            <option value="">Select institution…</option>
            {(unis ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
                {u.location ? ` — ${u.location}` : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={field}>
            {STUDENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={field}>
            {INSIGHT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <input
          value={programme}
          onChange={(e) => setProgramme(e.target.value)}
          placeholder="Programme (optional)"
          className={field}
        />

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="What should other students know? Accommodation, fees, lecturers, transport, campus life…"
          className={field}
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">{body.trim().length}/20 min</span>
          <button
            onClick={submit}
            disabled={create.isPending}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
          >
            {create.isPending ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostInsightDialog;
