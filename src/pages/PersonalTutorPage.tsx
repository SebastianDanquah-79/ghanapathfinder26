import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import type { FileUIPart } from "ai";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  BookOpenCheck,
  Check,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Seo from "@/components/Seo";
import AskPanel from "@/components/AskPanel";
import { supabase } from "@/integrations/supabase/client";

type TutorNotebook = {
  id: string;
  title: string;
  course: string | null;
  created_at: string;
  updated_at: string;
};

type TutorSource = {
  id: string;
  notebook_id: string;
  user_id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
};

const BUCKET = "ai-tutor-sources";
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_SELECTED_FILES = 3;
const MAX_NOTEBOOK_SOURCES = 50;
const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const database = supabase as unknown as SupabaseClient;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("The saved source could not be read."));
    };
    reader.onerror = () => reject(new Error("The saved source could not be read."));
    reader.readAsDataURL(blob);
  });
}

export default function PersonalTutorPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [notebooks, setNotebooks] = useState<TutorNotebook[]>([]);
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);
  const [sources, setSources] = useState<TutorSource[]>([]);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [sourceFiles, setSourceFiles] = useState<FileUIPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSources, setLoadingSources] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [notebookTitle, setNotebookTitle] = useState("");
  const [course, setCourse] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedNotebook = useMemo(
    () => notebooks.find((notebook) => notebook.id === selectedNotebookId) ?? null,
    [notebooks, selectedNotebookId],
  );

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      const user = authData.user;
      if (!user) {
        setUserId(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

      setUserId(user.id);
      setAuthChecked(true);
      const { data, error: notebookError } = await database
        .from("ai_tutor_notebooks")
        .select("id,title,course,created_at,updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (notebookError) throw notebookError;

      let rows = (data ?? []) as TutorNotebook[];
      if (rows.length === 0) {
        const { data: created, error: createError } = await database
          .from("ai_tutor_notebooks")
          .insert({ user_id: user.id, title: "My first study notebook" })
          .select("id,title,course,created_at,updated_at")
          .single();
        if (createError) throw createError;
        rows = [created as TutorNotebook];
      }

      setNotebooks(rows);
      setSelectedNotebookId((current) =>
        current && rows.some((notebook) => notebook.id === current)
          ? current
          : rows[0]?.id ?? null,
      );
    } catch (loadError) {
      console.error("Personal Tutor notebook library could not load", loadError);
      setAuthChecked(true);
      setError(loadError instanceof Error ? loadError.message : "Your study library could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLibrary();
  }, [loadLibrary]);

  useEffect(() => {
    if (!selectedNotebookId || !userId) {
      setSources([]);
      setSelectedSourceIds([]);
      setSourceFiles([]);
      return;
    }

    let active = true;
    setSources([]);
    setSelectedSourceIds([]);
    setSourceFiles([]);
    setError(null);

    const loadSources = async () => {
      const { data, error: sourcesError } = await database
        .from("ai_tutor_sources")
        .select("id,notebook_id,user_id,filename,storage_path,mime_type,size_bytes,created_at")
        .eq("user_id", userId)
        .eq("notebook_id", selectedNotebookId)
        .order("created_at", { ascending: false });

      if (!active) return;
      if (sourcesError) {
        setError(sourcesError.message);
        return;
      }
      setSources((data ?? []) as TutorSource[]);
    };

    void loadSources();
    return () => {
      active = false;
    };
  }, [selectedNotebookId, userId]);

  useEffect(() => {
    if (selectedSourceIds.length === 0) {
      setSourceFiles([]);
      setLoadingSources(false);
      return;
    }

    let active = true;
    setLoadingSources(true);
    setError(null);

    const loadSelectedFiles = async () => {
      try {
        const chosen = sources.filter((source) => selectedSourceIds.includes(source.id));
        const totalBytes = chosen.reduce((sum, source) => sum + source.size_bytes, 0);
        if (chosen.length > MAX_SELECTED_FILES || totalBytes > MAX_FILE_BYTES) {
          throw new Error("Select up to 3 sources with 2 MB total before asking a question.");
        }

        const parts = await Promise.all(chosen.map(async (source) => {
          const { data, error: downloadError } = await supabase.storage
            .from(BUCKET)
            .download(source.storage_path);
          if (downloadError || !data) {
            throw downloadError ?? new Error(`Could not load ${source.filename}.`);
          }
          return {
            type: "file" as const,
            mediaType: source.mime_type,
            filename: source.filename,
            url: await toDataUrl(data),
          } satisfies FileUIPart;
        }));

        if (active) setSourceFiles(parts);
      } catch (loadError) {
        if (active) {
          setSourceFiles([]);
          setError(loadError instanceof Error ? loadError.message : "A selected source could not be loaded.");
        }
      } finally {
        if (active) setLoadingSources(false);
      }
    };

    void loadSelectedFiles();
    return () => {
      active = false;
    };
  }, [selectedSourceIds, sources]);

  const createNotebook = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userId) return;
    const title = notebookTitle.trim() || "New study notebook";
    setCreating(true);
    setError(null);
    try {
      const { data, error: createError } = await database
        .from("ai_tutor_notebooks")
        .insert({
          user_id: userId,
          title,
          course: course.trim() || null,
        })
        .select("id,title,course,created_at,updated_at")
        .single();
      if (createError) throw createError;
      const created = data as TutorNotebook;
      setNotebooks((current) => [created, ...current]);
      setSelectedNotebookId(created.id);
      setNotebookTitle("");
      setCourse("");
      setNotice("Your new study notebook is ready.");
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "The notebook could not be created.");
    } finally {
      setCreating(false);
    }
  };

  const uploadSources = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    event.currentTarget.value = "";
    if (files.length === 0 || !userId || !selectedNotebookId) return;

    if (sources.length + files.length > MAX_NOTEBOOK_SOURCES) {
      setError(`A notebook can contain up to ${MAX_NOTEBOOK_SOURCES} source files.`);
      return;
    }
    const invalid = files.find((file) => !ACCEPTED_TYPES.has(file.type));
    if (invalid) {
      setError(`Unsupported file type: ${invalid.name}. Use PDF, JPG, PNG or WebP.`);
      return;
    }
    const oversized = files.find((file) => file.size > MAX_FILE_BYTES || file.size === 0);
    if (oversized) {
      setError(`${oversized.name} must be smaller than 2 MB and must not be empty.`);
      return;
    }

    setUploading(true);
    setError(null);
    setNotice(null);
    let uploadedCount = 0;
    try {
      for (const file of files) {
        const extension = file.type === "application/pdf" ? "pdf"
          : file.type === "image/jpeg" ? "jpg"
            : file.type === "image/png" ? "png" : "webp";
        const storagePath = `${userId}/${selectedNotebookId}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, {
            contentType: file.type,
            cacheControl: "3600",
            upsert: false,
          });
        if (uploadError) throw uploadError;

        const { error: insertError } = await database
          .from("ai_tutor_sources")
          .insert({
            notebook_id: selectedNotebookId,
            user_id: userId,
            filename: file.name.slice(0, 220),
            storage_path: storagePath,
            mime_type: file.type,
            size_bytes: file.size,
          });
        if (insertError) {
          await supabase.storage.from(BUCKET).remove([storagePath]);
          throw insertError;
        }
        uploadedCount += 1;
      }

      const { data, error: refreshError } = await database
        .from("ai_tutor_sources")
        .select("id,notebook_id,user_id,filename,storage_path,mime_type,size_bytes,created_at")
        .eq("user_id", userId)
        .eq("notebook_id", selectedNotebookId)
        .order("created_at", { ascending: false });
      if (refreshError) throw refreshError;
      setSources((data ?? []) as TutorSource[]);
      setNotice(`Saved ${uploadedCount} source ${uploadedCount === 1 ? "file" : "files"} to this notebook.`);
    } catch (uploadError) {
      console.error("Personal Tutor source upload failed", uploadError);
      setError(uploadError instanceof Error ? uploadError.message : "The source files could not be saved.");
    } finally {
      setUploading(false);
    }
  };

  const toggleSource = (source: TutorSource) => {
    setNotice(null);
    setError(null);
    if (selectedSourceIds.includes(source.id)) {
      setSelectedSourceIds((current) => current.filter((id) => id !== source.id));
      return;
    }

    const chosen = sources.filter((item) => selectedSourceIds.includes(item.id));
    if (chosen.length >= MAX_SELECTED_FILES) {
      setError("Choose no more than 3 files for one tutor question.");
      return;
    }
    const totalBytes = chosen.reduce((sum, item) => sum + item.size_bytes, 0) + source.size_bytes;
    if (totalBytes > MAX_FILE_BYTES) {
      setError("The sources selected for one question must stay within 2 MB total.");
      return;
    }
    setSelectedSourceIds((current) => [...current, source.id]);
  };

  const deleteSource = async (source: TutorSource) => {
    setError(null);
    setNotice(null);
    try {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([source.storage_path]);
      if (storageError) throw storageError;
      const { error: deleteError } = await database
        .from("ai_tutor_sources")
        .delete()
        .eq("id", source.id)
        .eq("user_id", userId);
      if (deleteError) throw deleteError;
      setSources((current) => current.filter((item) => item.id !== source.id));
      setSelectedSourceIds((current) => current.filter((id) => id !== source.id));
      setNotice("Source removed from your study library.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "The source could not be deleted.");
    }
  };

  const deleteNotebook = async () => {
    if (!selectedNotebook || !userId) return;
    const confirmed = window.confirm(`Delete "${selectedNotebook.title}" and all of its saved sources?`);
    if (!confirmed) return;
    setError(null);
    setNotice(null);
    try {
      const paths = sources.map((source) => source.storage_path);
      if (paths.length > 0) {
        const { error: storageError } = await supabase.storage.from(BUCKET).remove(paths);
        if (storageError) throw storageError;
      }
      const { error: deleteError } = await database
        .from("ai_tutor_notebooks")
        .delete()
        .eq("id", selectedNotebook.id)
        .eq("user_id", userId);
      if (deleteError) throw deleteError;

      const remaining = notebooks.filter((notebook) => notebook.id !== selectedNotebook.id);
      setNotebooks(remaining);
      setSelectedNotebookId(remaining[0]?.id ?? null);
      if (remaining.length === 0) {
        const { data: created, error: createError } = await database
          .from("ai_tutor_notebooks")
          .insert({ user_id: userId, title: "My study notebook" })
          .select("id,title,course,created_at,updated_at")
          .single();
        if (createError) throw createError;
        setNotebooks([created as TutorNotebook]);
        setSelectedNotebookId((created as TutorNotebook).id);
      }
      setNotice("Notebook and its source files were deleted.");
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "The notebook could not be deleted.");
    }
  };

  const clearSelection = () => {
    setSelectedSourceIds([]);
    setSourceFiles([]);
  };

  return (
    <div className="min-h-dvh bg-background pb-24 pt-20">
      <Seo
        title="Personal AI Tutor | GhanaPathFinder"
        description="A private, persistent study notebook and source-grounded AI tutor for lecture slides, PDFs and practice."
        path="/personal-tutor"
      />
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <header className="mb-7 max-w-4xl">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <BookOpenCheck className="size-3.5" />
            Private study workspace
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Learn directly from your materials.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
            Keep lecture slides and reading materials in course notebooks. Select the sources you want to study, then ask questions, request explanations or practise exam-style questions.
          </p>
        </header>

        {!authChecked || loading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 rounded-2xl border border-border bg-card text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading your private study library…
          </div>
        ) : !userId ? (
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Sign in to save your study materials</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Your notebooks and source files are private to your GhanaPathFinder account. Sign in to create a study library that stays available when you return.
            </p>
            {error && <p className="mt-3 text-xs text-destructive" role="alert">{error}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/auth" className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground">
                Sign in to GhanaPathFinder
              </Link>
              {error && (
                <button type="button" onClick={() => void loadLibrary()} className="min-h-10 rounded-lg border border-border px-4 text-sm font-medium text-foreground">
                  Retry
                </button>
              )}
            </div>
          </section>
        ) : (
          <>
            <section className="mb-6 grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
              <aside className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <label htmlFor="tutor-notebook" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Your notebooks
                  </label>
                  <select
                    id="tutor-notebook"
                    value={selectedNotebookId ?? ""}
                    onChange={(event) => setSelectedNotebookId(event.currentTarget.value || null)}
                    className="min-h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  >
                    {notebooks.map((notebook) => (
                      <option key={notebook.id} value={notebook.id}>{notebook.title}</option>
                    ))}
                  </select>
                  {selectedNotebook?.course && (
                    <p className="mt-2 text-xs text-muted-foreground">{selectedNotebook.course}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => void deleteNotebook()}
                    className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs text-muted-foreground hover:border-destructive/50 hover:text-destructive"
                  >
                    <Trash2 className="size-3.5" />
                    Delete notebook
                  </button>
                </div>

                <form onSubmit={createNotebook} className="rounded-2xl border border-border bg-card p-4">
                  <h2 className="text-sm font-semibold text-foreground">Create a notebook</h2>
                  <label htmlFor="new-notebook-title" className="mt-3 block text-xs text-muted-foreground">Notebook name</label>
                  <input
                    id="new-notebook-title"
                    value={notebookTitle}
                    onChange={(event) => setNotebookTitle(event.currentTarget.value)}
                    maxLength={120}
                    placeholder="e.g. Linear Algebra"
                    className="mt-1 min-h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  />
                  <label htmlFor="new-notebook-course" className="mt-3 block text-xs text-muted-foreground">Course (optional)</label>
                  <input
                    id="new-notebook-course"
                    value={course}
                    onChange={(event) => setCourse(event.currentTarget.value)}
                    maxLength={120}
                    placeholder="e.g. MATH 111"
                    className="mt-1 min-h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  />
                  <button
                    type="submit"
                    disabled={creating}
                    className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 text-sm font-semibold text-primary disabled:opacity-60"
                  >
                    {creating ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                    New notebook
                  </button>
                </form>
              </aside>

              <section className="rounded-2xl border border-border bg-card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">Source library</h2>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Upload up to 50 sources per notebook. Each file can be up to 2 MB.
                    </p>
                  </div>
                  <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg bg-primary px-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                    {uploading ? "Saving sources…" : "Upload sources"}
                    <input
                      type="file"
                      className="sr-only"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      multiple
                      disabled={uploading || !selectedNotebookId}
                      onChange={(event) => void uploadSources(event)}
                    />
                  </label>
                </div>

                {sources.length === 0 ? (
                  <div className="mt-5 rounded-xl border border-dashed border-border px-4 py-9 text-center">
                    <FolderOpen className="mx-auto size-8 text-muted-foreground" />
                    <p className="mt-3 text-sm font-medium text-foreground">This notebook is empty</p>
                    <p className="mt-1 text-xs text-muted-foreground">Add PDF lecture slides, notes or image pages to get started.</p>
                  </div>
                ) : (
                  <div className="mt-4 divide-y divide-border rounded-xl border border-border">
                    {sources.map((source) => {
                      const selected = selectedSourceIds.includes(source.id);
                      const isImage = source.mime_type.startsWith("image/");
                      return (
                        <div key={source.id} className="flex items-center gap-3 px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleSource(source)}
                            aria-label={`Use ${source.filename} in tutor chat`}
                            className="size-4 shrink-0 accent-primary"
                          />
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                            {isImage ? <ImageIcon className="size-4" /> : <FileText className="size-4" />}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">{source.filename}</p>
                            <p className="text-[11px] text-muted-foreground">{formatBytes(source.size_bytes)} · {new Date(source.created_at).toLocaleDateString()}</p>
                          </div>
                          {selected && <Check className="size-4 shrink-0 text-primary" />}
                          <button
                            type="button"
                            onClick={() => void deleteSource(source)}
                            aria-label={`Delete ${source.filename}`}
                            className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">
                    {selectedSourceIds.length} selected · {formatBytes(sources.filter((source) => selectedSourceIds.includes(source.id)).reduce((sum, source) => sum + source.size_bytes, 0))} / 2 MB for the next question
                  </p>
                  <button
                    type="button"
                    onClick={clearSelection}
                    disabled={selectedSourceIds.length === 0}
                    className="min-h-8 rounded-lg px-2 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-40"
                  >
                    Clear selection
                  </button>
                </div>
              </section>
            </section>

            {(error || notice) && (
              <div className={`mb-4 rounded-xl border px-4 py-3 text-sm ${error ? "border-destructive/30 bg-destructive/5 text-destructive" : "border-primary/25 bg-primary/5 text-foreground"}`} role="status">
                {error || notice}
              </div>
            )}

            <section className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="min-w-0">
                {loadingSources && (
                  <p className="mb-2 inline-flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3.5 animate-spin" />
                    Loading selected source files…
                  </p>
                )}
                <AskPanel
                  query={selectedNotebook
                    ? `Personal tutor for ${selectedNotebook.title}. Use only the user's currently selected private source files as primary references and distinguish source-backed statements from extra explanation.`
                    : "Personal study tutor."}
                  items={[]}
                  mode="personal-tutor"
                  sourceFiles={sourceFiles}
                  suggestions={[
                    "Explain the hardest concept in these sources one small step at a time.",
                    "Create a structured study guide and identify the learning objectives.",
                    "Quiz me one question at a time. Wait for my attempt before giving the answer.",
                    "Create rigorous university-style exam questions from the selected sources.",
                    "Compare the sources and identify important differences or contradictions.",
                    "Make concise active-recall flashcards from the selected materials.",
                  ]}
                />
              </div>
              <aside className="rounded-xl border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground">How this tutor works</h2>
                <ol className="mt-3 space-y-3 text-xs leading-5 text-muted-foreground">
                  {[
                    "Create one notebook for each course or topic.",
                    "Upload PDFs and image pages. They stay in your private account library.",
                    "Select up to 3 sources with 2 MB total for a question.",
                    "Ask for a step-by-step explanation, examples or an exam-style test.",
                    "Return later. Your saved notebook files will still be there.",
                  ].map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 border-t border-border pt-3 text-[11px] leading-5 text-muted-foreground">
                  Files are stored in a private bucket and protected by account-level access rules. Selected files are sent to the configured AI provider when you submit a tutor question. Do not upload private identity, health or financial records.
                </p>
                <Link to="/ai-cofounder" className="mt-4 inline-flex min-h-9 items-center text-xs font-semibold text-primary hover:underline">
                  Open AI Co-Founder →
                </Link>
              </aside>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
