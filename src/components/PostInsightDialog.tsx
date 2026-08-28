import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "@/lib/router-compat";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  INSIGHT_CATEGORIES,
  STUDENT_STATUSES,
  useCreateInsight,
  useUpdateMyInsight,
} from "@/hooks/useInsights";
import {
  MAX_IMAGES,
  removeCommunityImages,
  signCommunityImages,
  uploadCommunityImages,
  validateImage,
} from "@/lib/communityImages";

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

export interface EditableInsight {
  id: string;
  university_id: string;
  student_status: string;
  category: string;
  programme: string | null;
  body: string;
  image_paths: string[] | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-selected institution when posting from a university page. */
  universityId?: string;
  /** When provided, the dialog edits this existing post instead of creating one. */
  editing?: EditableInsight | null;
}

const PostInsightDialog = ({ open, onClose, universityId, editing }: Props) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const create = useCreateInsight();
  const update = useUpdateMyInsight();
  const fileRef = useRef<HTMLInputElement>(null);

  const [term, setTerm] = useState("");
  const [uniId, setUniId] = useState(universityId ?? "");
  const [status, setStatus] = useState<string>(STUDENT_STATUSES[0]);
  const [category, setCategory] = useState<string>(INSIGHT_CATEGORIES[0]);
  const [programme, setProgramme] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [keptPaths, setKeptPaths] = useState<string[]>([]);
  const [keptUrls, setKeptUrls] = useState<Map<string, string>>(new Map());
  const [uploading, setUploading] = useState(false);

  const { data: unis } = useUniversitySearch(term);

  useEffect(() => {
    if (universityId) setUniId(universityId);
  }, [universityId]);

  // Load the post being edited into the form.
  useEffect(() => {
    if (!open) return;
    if (editing) {
      setUniId(editing.university_id);
      setStatus(editing.student_status);
      setCategory(editing.category);
      setProgramme(editing.programme ?? "");
      setBody(editing.body);
      setKeptPaths(editing.image_paths ?? []);
      setFiles([]);
      void signCommunityImages(editing.image_paths ?? []).then(setKeptUrls);
    } else {
      setKeptPaths([]);
      setKeptUrls(new Map());
    }
  }, [open, editing]);

  // Object URLs for newly picked files.
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

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

  const totalImages = keptPaths.length + files.length;
  const canPost = useMemo(() => !!uniId && body.trim().length >= 20, [uniId, body]);

  if (!open) return null;

  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const chosen = Array.from(list);
    const room = MAX_IMAGES - totalImages;
    if (room <= 0) {
      toast.error(`You can attach up to ${MAX_IMAGES} photos.`);
      return;
    }
    const accepted: File[] = [];
    for (const f of chosen.slice(0, room)) {
      const problem = validateImage(f);
      if (problem) toast.error(problem);
      else accepted.push(f);
    }
    if (accepted.length) setFiles((prev) => [...prev, ...accepted]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const reset = () => {
    setBody("");
    setProgramme("");
    setFiles([]);
    setKeptPaths([]);
    setKeptUrls(new Map());
  };

  const submit = async () => {
    if (!user) {
      toast.error("Sign in to share your experience.");
      navigate(`/auth?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    if (!canPost) {
      toast.error("Pick your institution and write at least 20 characters.");
      return;
    }

    let uploaded: string[] = [];
    if (files.length) {
      setUploading(true);
      try {
        uploaded = await uploadCommunityImages(user.id, files);
      } catch (e: unknown) {
        setUploading(false);
        toast.error(e instanceof Error ? e.message : "Could not upload your photos.");
        return;
      }
      setUploading(false);
    }

    const image_paths = [...keptPaths, ...uploaded];

    if (editing) {
      const dropped = (editing.image_paths ?? []).filter((p) => !keptPaths.includes(p));
      update.mutate(
        {
          id: editing.id,
          student_status: status,
          category,
          programme: programme || null,
          body: body.trim(),
          image_paths,
        },
        {
          onSuccess: () => {
            void removeCommunityImages(dropped);
            toast.success("Post updated.");
            reset();
            onClose();
          },
          onError: (e: unknown) => {
            void removeCommunityImages(uploaded);
            toast.error(e instanceof Error ? e.message : "Could not update your post.");
          },
        },
      );
      return;
    }

    create.mutate(
      {
        university_id: uniId,
        student_status: status,
        category,
        programme: programme || null,
        body: body.trim(),
        image_paths,
      },
      {
        onSuccess: () => {
          toast.success("Posted — thanks for helping other students.");
          reset();
          onClose();
        },
        onError: (e: unknown) => {
          void removeCommunityImages(uploaded);
          toast.error(e instanceof Error ? e.message : "Could not post your experience.");
        },
      },
    );
  };

  const busy = create.isPending || update.isPending || uploading;

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={editing ? "Edit your post" : "Share your experience"}
        className="relative w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-card border border-border p-4 space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-foreground">
            {editing ? "Edit your post" : "Share an experience"}
          </h2>
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

        {!editing && (
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
        )}

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

        {/* Photos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              Photos or screenshots (optional)
            </span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={totalImages >= MAX_IMAGES}
              className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-xs font-medium text-foreground disabled:opacity-50"
            >
              Add photo
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(e) => pickFiles(e.target.files)}
          />

          {totalImages > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {keptPaths.map((p) => (
                <div key={p} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                  {keptUrls.get(p) ? (
                    <img src={keptUrls.get(p)} alt="Attached" className="h-full w-full object-cover" />
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setKeptPaths((prev) => prev.filter((x) => x !== p))}
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {previews.map((url, idx) => (
                <div key={url} className="relative aspect-square rounded-lg overflow-hidden bg-secondary">
                  <img src={url} alt="Selected" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label="Remove photo"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted-foreground">
            Up to {MAX_IMAGES} images, 5 MB each. Don&apos;t upload photos that identify other people.
          </p>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">{body.trim().length}/20 min</span>
          <button
            onClick={() => void submit()}
            disabled={busy}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
          >
            {uploading
              ? "Uploading…"
              : busy
                ? "Saving…"
                : editing
                  ? "Save changes"
                  : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostInsightDialog;
