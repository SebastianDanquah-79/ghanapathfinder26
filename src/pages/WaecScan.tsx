import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { computeAggregate, GRADE_POINTS, type SubjectResult } from "@/lib/admissionEngine";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import { toast } from "sonner";
import { Camera, CheckCircle2, FileImage, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";

type ReviewRow = {
  subject: string;
  grade: string;
  confidence: number;
  issue: string | null;
};

const GRADE_OPTIONS = Object.keys(GRADE_POINTS);
const inputClass = "w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/40";

async function compressToDataUrl(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG or WebP photo.");
  }
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1800;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not prepare this photo.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.78);
  const encoded = dataUrl.split(",")[1] ?? "";
  const bytes = Math.floor((encoded.length * 3) / 4);
  if (bytes > 2 * 1024 * 1024) {
    throw new Error("This photo is still too large. Crop it to show the result table and try again.");
  }
  return dataUrl;
}

const WaecScan = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [consented, setConsented] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [examYear, setExamYear] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ReviewRow[]>([]);

  const subjectResults = useMemo<SubjectResult[]>(
    () => rows.filter((row) => row.subject.trim() && GRADE_POINTS[row.grade]).map(({ subject, grade }) => ({ subject: subject.trim(), grade })),
    [rows],
  );
  const aggregate = useMemo(() => computeAggregate(subjectResults), [subjectResults]);
  const hasDuplicateSubjects = useMemo(() => {
    const names = rows.map((r) => r.subject.trim().toLowerCase()).filter(Boolean);
    return new Set(names).size !== names.length;
  }, [rows]);

  const scan = async () => {
    if (!photo || !user || !consented) return;
    setScanning(true);
    setRows([]);
    setNotes("");
    try {
      const imageDataUrl = await compressToDataUrl(photo);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Your session has expired. Sign in again.");

      const response = await fetch("/api/waec-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageDataUrl }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof payload.error === "string" ? payload.error : typeof payload.message === "string" ? payload.message : "The statement could not be read.");
      const found = Array.isArray(payload.results) ? payload.results : [];
      setRows(found.map((row: { subject?: unknown; grade?: unknown; confidence?: unknown; issue?: unknown }) => ({
        subject: typeof row.subject === "string" ? row.subject.slice(0, 80) : "",
        grade: typeof row.grade === "string" && GRADE_OPTIONS.includes(row.grade) ? row.grade : "",
        confidence: typeof row.confidence === "number" ? Math.max(0, Math.min(1, row.confidence)) : 0,
        issue: typeof row.issue === "string" ? row.issue : null,
      })));
      setExamYear(typeof payload.examYear === "string" ? payload.examYear : "");
      setNotes(typeof payload.notes === "string" ? payload.notes : "");
      toast.success("Results extracted. Review every subject and grade before saving.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The image could not be processed.");
    } finally {
      setPhoto(null);
      if (fileRef.current) fileRef.current.value = "";
      setScanning(false);
    }
  };

  const updateRow = (index: number, patch: Partial<ReviewRow>) => {
    setRows((current) => current.map((row, i) => i === index ? { ...row, ...patch } : row));
  };

  const save = async () => {
    if (!user || !subjectResults.length || hasDuplicateSubjects) return;
    setSaving(true);
    try {
      const { error } = await (supabase.rpc as any)("replace_my_wassce_results", {
        p_results: subjectResults,
      });
      if (error) throw error;
      toast.success("Your WASSCE results have been saved. Admission Match will use these grades.");
      void navigate({ to: "/admission-match" });
    } catch (error) {
      console.error("Saving scanned WASSCE results failed", error);
      toast.error(error instanceof Error ? error.message : "Your results could not be saved. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  if (!loading && !user) {
    void navigate("/auth?next=/waec-scan", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background px-4 pb-16 pt-20 sm:px-8">
      <Seo title="Scan WASSCE Results | GhanaPathFinder" description="Scan a WASSCE result statement, review the extracted grades, calculate your aggregate and use your results for university matching." path="/waec-scan" />
      <Navbar />
      <main className="mx-auto max-w-4xl">
        <Link to="/admission-match" className="mb-5 inline-flex text-sm text-muted-foreground hover:text-foreground">← Back to Admission Match</Link>
        <header className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Academic profile</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Scan your WASSCE results</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Take or upload a clear photo of the result table. GhanaPathFinder will read the subjects and grades, calculate your aggregate, and let you review everything before it updates your student profile.</p>
        </header>

        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Camera className="h-5 w-5" /></div>
            <div>
              <h2 className="font-semibold text-foreground">1. Add a photo of your statement</h2>
              <p className="mt-1 text-sm text-muted-foreground">Keep the page flat, well lit and in focus. Make sure every subject and grade is visible.</p>
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="sr-only"
            onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
          />
          <div className="mt-4 rounded-lg border border-dashed border-border bg-background p-5 text-center">
            <FileImage className="mx-auto h-8 w-8 text-muted-foreground" />
            {photo ? (
              <p className="mt-2 break-all text-sm font-medium text-foreground">{photo.name}</p>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">No image selected yet</p>
            )}
            <button type="button" onClick={() => fileRef.current?.click()} className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground hover:bg-secondary">
              {photo ? "Choose a different photo" : "Take photo or choose image"}
            </button>
            <p className="mt-2 text-xs text-muted-foreground">JPG, PNG or WebP · up to 2 MB after compression</p>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg bg-secondary/50 p-3">
            <input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />
            <span className="text-xs leading-5 text-muted-foreground">I understand that this photo is sent securely to the AI service to read the grades. GhanaPathFinder does not save the photo. I will check the extracted grades before saving them to my account.</span>
          </label>
          <button type="button" onClick={() => void scan()} disabled={!photo || !consented || scanning} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50">
            {scanning ? <><Loader2 className="h-4 w-4 animate-spin" /> Reading result slip…</> : <><Camera className="h-4 w-4" /> Scan result slip</>}
          </button>
        </section>

        {!!rows.length && (
          <section className="mt-5 rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-foreground">2. Review the extracted grades</h2>
                <p className="mt-1 text-sm text-muted-foreground">AI extraction can make mistakes. Check every row against your original statement.</p>
              </div>
              {examYear && <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">Exam year: {examYear}</span>}
            </div>
            {notes && <p className="mt-3 rounded-lg bg-secondary/50 p-3 text-xs leading-5 text-muted-foreground">{notes}</p>}
            <div className="mt-4 space-y-3">
              {rows.map((row, index) => (
                <div key={index} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-[minmax(0,1fr)_120px_36px] sm:items-center">
                  <label className="text-xs text-muted-foreground">
                    Subject
                    <input value={row.subject} onChange={(event) => updateRow(index, { subject: event.target.value })} className={inputClass + " mt-1"} maxLength={80} />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    Grade
                    <select value={row.grade} onChange={(event) => updateRow(index, { grade: event.target.value, issue: null })} className={inputClass + " mt-1"}>
                      <option value="">Select grade</option>
                      {GRADE_OPTIONS.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                    </select>
                  </label>
                  <button type="button" aria-label={`Remove ${row.subject || "subject"}`} onClick={() => setRows((current) => current.filter((_, i) => i !== index))} className="mt-3 grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive sm:mt-5">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="sm:col-span-3">
                    <p className={row.grade && row.confidence >= 0.85 ? "text-xs text-muted-foreground" : "text-xs text-amber-600"}>
                      {row.grade ? `Recognition confidence: ${Math.round(row.confidence * 100)}%` : "Grade needs manual review"}
                      {row.issue ? ` · ${row.issue}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setRows((current) => [...current, { subject: "", grade: "", confidence: 0, issue: "Enter the subject and grade manually." }])} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground">
              <Plus className="h-3.5 w-3.5" /> Add subject
            </button>

            <div className="mt-5 rounded-lg bg-secondary/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Calculated WASSCE aggregate</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">{aggregate.aggregate ?? "Not ready"}</p>
              {aggregate.aggregate !== null ? (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">Best six: {aggregate.usedSubjects.map((subject) => `${subject.subject} (${subject.grade})`).join(" · ")}</p>
              ) : (
                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  {aggregate.missingCores.length ? `Missing a C6-or-better pass in: ${aggregate.missingCores.join(", ")}. ` : ""}
                  Add three core subjects and at least three elective passes (C6 or better) to calculate the aggregate.
                </p>
              )}
              {!!aggregate.failedSubjects.length && <p className="mt-2 text-xs text-muted-foreground">Not counted: {aggregate.failedSubjects.map((s) => `${s.subject} (${s.grade})`).join(", ")}</p>}
            </div>

            {hasDuplicateSubjects && <p role="alert" className="mt-3 text-xs text-destructive">Two rows use the same subject name. Remove or rename the duplicate before saving.</p>}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => void save()} disabled={saving || !subjectResults.length || hasDuplicateSubjects} className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
                {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving grades…</> : <><CheckCircle2 className="h-4 w-4" /> Save reviewed grades</>}
              </button>
              <button type="button" onClick={() => { setRows([]); setExamYear(""); setNotes(""); }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-foreground">
                <RefreshCw className="h-4 w-4" /> Clear results
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">Saving replaces the WASSCE grades currently attached to your student profile. The uploaded photo itself is not saved.</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default WaecScan;
