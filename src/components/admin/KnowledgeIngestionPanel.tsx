import { useState, type FormEvent } from "react";
import { Database, Loader2, ShieldCheck, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type VerificationStatus = "pending_review" | "unverified" | "verified" | "official";

type IngestionResponse = {
  ok?: boolean;
  documents?: number;
  results?: Array<{ title: string; chunks: number; published: boolean }>;
  error?: string;
};

const categories = [
  "education",
  "international_education",
  "careers",
  "scholarships",
  "technology",
  "science",
  "business",
  "employment",
  "research",
  "countries",
  "skills",
];

export default function KnowledgeIngestionPanel({ enabled }: { enabled: boolean }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [category, setCategory] = useState("international_education");
  const [publicationDate, setPublicationDate] = useState("");
  const [lastVerifiedAt, setLastVerifiedAt] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>("pending_review");
  const [publish, setPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [lastResult, setLastResult] = useState<IngestionResponse | null>(null);

  if (!enabled) return null;

  const canPublish = verificationStatus === "verified" || verificationStatus === "official";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLastResult(null);

    if (content.trim().length < 100) {
      toast.error("Add at least 100 characters of source text.");
      return;
    }
    try {
      const parsed = new URL(sourceUrl.trim());
      if (parsed.protocol !== "https:") {
        toast.error("Use an official HTTPS source URL.");
        return;
      }
    } catch {
      toast.error("Enter a valid source URL.");
      return;
    }
    if (countryCode.trim() && !/^[A-Za-z]{2}$/.test(countryCode.trim())) {
      toast.error("Country code must be two letters, such as GH, NG, US or GB.");
      return;
    }
    if (publish && !canPublish) {
      toast.error("Only verified or official records can be published to AI retrieval.");
      return;
    }

    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke<IngestionResponse>("knowledge-ingest", {
        body: {
          documents: [{
            title: title.trim(),
            content: content.trim(),
            sourceName: sourceName.trim(),
            sourceUrl: sourceUrl.trim(),
            countryCode: countryCode.trim().toUpperCase() || null,
            category,
            publicationDate: publicationDate || null,
            lastVerifiedAt: lastVerifiedAt ? new Date(lastVerifiedAt).toISOString() : null,
            verificationStatus,
            isPublished: publish && canPublish,
            metadata: { ingestionMethod: "admin-console" },
          }],
        },
      });

      if (error) {
        const bodyText = await error.context?.text?.().catch(() => "");
        throw new Error(bodyText || error.message || "The knowledge document could not be ingested.");
      }
      if (!data?.ok) throw new Error(data?.error || "The knowledge document could not be ingested.");

      setLastResult(data);
      const detail = data.results?.[0];
      toast.success(detail
        ? `Added ${detail.chunks} searchable chunks. ${detail.published ? "Published to AI retrieval." : "Saved for review; not yet searchable by users."}`
        : "Knowledge document ingested.");
      setTitle("");
      setContent("");
      setSourceName("");
      setSourceUrl("");
      setPublicationDate("");
      setLastVerifiedAt("");
      setVerificationStatus("pending_review");
      setPublish(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Knowledge ingestion failed.";
      console.error("Knowledge ingestion failed", error);
      toast.error(message.slice(0, 240));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-glass p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">Global AI knowledge library</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            Add sourced material from official Ghanaian, African and international education, career, science and research sources.
            Text is indexed for semantic and keyword retrieval; it is not used to train or fine-tune the foundation model.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background/50 p-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Admin-only ingestion</span>
        <span>Pending and unverified records remain private to the retrieval layer until approved.</span>
        <span>Use text from sources you are permitted to store.</span>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground" htmlFor="ai-knowledge-title">Document title</label>
          <input id="ai-knowledge-title" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={300} required
            placeholder="e.g. International student admission guidance"
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground" htmlFor="ai-knowledge-source">Source or organisation</label>
          <input id="ai-knowledge-source" value={sourceName} onChange={(event) => setSourceName(event.target.value)} maxLength={180} required
            placeholder="e.g. UNESCO, GTEC, official university"
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-foreground" htmlFor="ai-knowledge-url">Official source URL</label>
          <input id="ai-knowledge-url" type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} maxLength={1000} required
            placeholder="https://..."
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground" htmlFor="ai-knowledge-category">Knowledge category</label>
          <select id="ai-knowledge-category" value={category} onChange={(event) => setCategory(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            {categories.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground" htmlFor="ai-knowledge-country">Country code (optional)</label>
          <input id="ai-knowledge-country" value={countryCode} onChange={(event) => setCountryCode(event.target.value.toUpperCase().slice(0, 2))} maxLength={2}
            placeholder="GH, NG, US, GB..."
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground" htmlFor="ai-knowledge-published">Publication date (optional)</label>
          <input id="ai-knowledge-published" type="date" value={publicationDate} onChange={(event) => setPublicationDate(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground" htmlFor="ai-knowledge-verified-date">Last verified date (optional)</label>
          <input id="ai-knowledge-verified-date" type="date" value={lastVerifiedAt} onChange={(event) => setLastVerifiedAt(event.target.value)}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground" htmlFor="ai-knowledge-verification">Verification status</label>
          <select id="ai-knowledge-verification" value={verificationStatus}
            onChange={(event) => {
              const value = event.target.value as VerificationStatus;
              setVerificationStatus(value);
              if (value !== "verified" && value !== "official") setPublish(false);
            }}
            className="min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm">
            <option value="pending_review">Pending review</option>
            <option value="unverified">Unverified</option>
            <option value="verified">Verified</option>
            <option value="official">Official source confirmed</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className={`flex min-h-11 w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm ${canPublish ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
            <input type="checkbox" checked={publish} disabled={!canPublish} onChange={(event) => setPublish(event.target.checked)} />
            Publish to AI retrieval
          </label>
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-foreground" htmlFor="ai-knowledge-content">Source text</label>
          <textarea id="ai-knowledge-content" value={content} onChange={(event) => setContent(event.target.value)}
            minLength={100} maxLength={50_000} rows={9} required
            placeholder="Paste the factual text you are authorised to store. Include headings and the relevant details; the source URL is stored with every searchable chunk."
            className="w-full rounded-lg border border-input bg-background px-3 py-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-primary/20" />
          <p className="mt-1 text-right text-xs text-muted-foreground">{content.length.toLocaleString()} / 50,000 characters</p>
        </div>
        <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-xs leading-5 text-muted-foreground">
            Only publish material after checking that the source is authoritative, current and appropriate to store.
            This adds retrieval knowledge; it does not change the model's underlying training weights.
          </p>
          <button type="submit" disabled={busy || !title.trim() || !content.trim() || !sourceName.trim() || !sourceUrl.trim()}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><UploadCloud className="h-4 w-4" /> Add to knowledge library</>}
          </button>
        </div>
      </form>

      {lastResult?.results?.[0] && (
        <p className="mt-4 rounded-lg border border-border bg-background/50 p-3 text-xs text-muted-foreground">
          Last document: {lastResult.results[0].title}. {lastResult.results[0].chunks} chunks created.
          {lastResult.results[0].published ? " It is available to AI retrieval." : " It is saved but not searchable by public AI until published."}
        </p>
      )}
    </section>
  );
}
