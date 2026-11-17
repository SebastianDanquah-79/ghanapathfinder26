import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedOrigins = new Set([
  "https://ghanapathfinder.com",
  "https://www.ghanapathfinder.com",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (allowedOrigins.has(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    return host.startsWith("ghanapathfinder26-") &&
      host.endsWith("-ghanapathfinder1.vercel.app");
  } catch {
    return false;
  }
}

const headersFor = (origin: string | null) => ({
  "Access-Control-Allow-Origin": isAllowedOrigin(origin)
    ? origin!
    : "https://ghanapathfinder.com",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
  "Content-Type": "application/json; charset=utf-8",
});

function json(body: unknown, status: number, headers: Record<string, string>) {
  return new Response(JSON.stringify(body), { status, headers });
}

function chunkText(text: string, maxChars = 2200, overlapChars = 250): string[] {
  const normalized = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length && chunks.length < 80) {
    let end = Math.min(start + maxChars, normalized.length);
    if (end < normalized.length) {
      const boundary = normalized.lastIndexOf(" ", end);
      if (boundary > start + Math.floor(maxChars * 0.65)) end = boundary;
    }
    const chunk = normalized.slice(start, end).trim();
    if (chunk.length >= 80) chunks.push(chunk);
    if (end >= normalized.length) break;
    start = Math.max(end - overlapChars, start + 1);
  }
  return chunks;
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

type IngestDocument = {
  title: string;
  content: string;
  countryCode?: string | null;
  category: string;
  sourceName: string;
  sourceUrl: string;
  publicationDate?: string | null;
  lastVerifiedAt?: string | null;
  verificationStatus?: "pending_review" | "unverified" | "verified" | "official";
  isPublished?: boolean;
  metadata?: Record<string, unknown>;
};

Deno.serve(async (req: Request) => {
  const headers = headersFor(req.headers.get("origin"));
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405, headers);

  const rawLength = Number(req.headers.get("content-length") ?? "0");
  if (rawLength > 1_000_000) return json({ error: "Ingestion request is too large." }, 413, headers);

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return json({ error: "Authentication required." }, 401, headers);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const openAiKey = Deno.env.get("OPENAI_API_KEY");
  if (!supabaseUrl || !serviceRoleKey || !openAiKey) {
    return json({ error: "The knowledge ingestion service is not configured." }, 503, headers);
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const token = authHeader.slice("Bearer ".length);
  const { data: authData, error: authError } = await admin.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "Invalid session." }, 401, headers);

  const { data: adminRole, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", authData.user.id)
    .eq("role", "admin")
    .maybeSingle();
  if (roleError || !adminRole) return json({ error: "Admin access required." }, 403, headers);

  const body = await req.json().catch(() => null) as { documents?: unknown } | null;
  if (!body || !Array.isArray(body.documents) || body.documents.length < 1 || body.documents.length > 5) {
    return json({ error: "Send between 1 and 5 knowledge documents per request." }, 400, headers);
  }

  const documents = body.documents as IngestDocument[];
  const results: Array<{ title: string; chunks: number; published: boolean }> = [];

  for (const input of documents) {
    if (
      !input || typeof input.title !== "string" || input.title.trim().length < 3 ||
      typeof input.content !== "string" || input.content.trim().length < 100 ||
      input.content.length > 50_000 ||
      typeof input.category !== "string" || input.category.trim().length < 2 ||
      typeof input.sourceName !== "string" || input.sourceName.trim().length < 2 ||
      typeof input.sourceUrl !== "string"
    ) {
      return json({ error: "Each document needs a title, content, category, source name and source URL. Content must be 100–50,000 characters." }, 400, headers);
    }

    let sourceUrl: URL;
    try {
      sourceUrl = new URL(input.sourceUrl);
    } catch {
      return json({ error: "Each source URL must be a valid HTTPS URL." }, 400, headers);
    }
    if (sourceUrl.protocol !== "https:") return json({ error: "Only HTTPS source URLs are accepted." }, 400, headers);

    const verificationStatus = input.verificationStatus ?? "pending_review";
    const isPublished = Boolean(input.isPublished) &&
      (verificationStatus === "verified" || verificationStatus === "official");
    const countryCode = typeof input.countryCode === "string" && /^[A-Za-z]{2}$/.test(input.countryCode)
      ? input.countryCode.toUpperCase()
      : null;
    const chunks = chunkText(input.content);
    if (!chunks.length) return json({ error: "The document did not contain enough readable text." }, 400, headers);

    const contentHash = await sha256([
      input.title.trim(),
      sourceUrl.toString(),
      input.content,
    ].join("\n"));

    const { data: documentRow, error: documentError } = await admin
      .from("ai_knowledge_documents")
      .upsert({
        title: input.title.trim().slice(0, 300),
        country_code: countryCode,
        category: input.category.trim().slice(0, 80),
        source_name: input.sourceName.trim().slice(0, 180),
        source_url: sourceUrl.toString(),
        publication_date: input.publicationDate ?? null,
        last_verified_at: input.lastVerifiedAt ?? null,
        verification_status: verificationStatus,
        visibility: "public",
        owner_user_id: null,
        content_hash: contentHash,
        is_published: isPublished,
        metadata: input.metadata ?? {},
        updated_at: new Date().toISOString(),
      }, { onConflict: "content_hash" })
      .select("id")
      .single();

    if (documentError || !documentRow?.id) {
      console.error("Knowledge document upsert failed", { code: documentError?.code });
      return json({ error: "A document could not be saved to the knowledge catalogue." }, 500, headers);
    }

    const documentId = documentRow.id;
    const { error: deleteError } = await admin
      .from("ai_knowledge_chunks")
      .delete()
      .eq("document_id", documentId);
    if (deleteError) {
      console.error("Knowledge chunk refresh failed", { code: deleteError.code });
      return json({ error: "Existing document chunks could not be refreshed." }, 500, headers);
    }

    for (let offset = 0; offset < chunks.length; offset += 32) {
      const batch = chunks.slice(offset, offset + 32);
      const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: Deno.env.get("OPENAI_EMBEDDING_MODEL") ?? "text-embedding-3-small",
          input: batch,
          dimensions: 1536,
          encoding_format: "float",
        }),
        signal: AbortSignal.timeout(25_000),
      });

      if (!embeddingResponse.ok) {
        console.error("Knowledge embedding batch failed", { status: embeddingResponse.status });
        return json({
          error: embeddingResponse.status === 429
            ? "Embedding capacity is temporarily limited. Retry this document later."
            : "The embedding provider could not process this document.",
          savedDocument: true,
        }, embeddingResponse.status === 429 ? 429 : 502, headers);
      }

      const embeddingPayload = await embeddingResponse.json() as {
        data?: Array<{ index: number; embedding: number[] }>;
      };
      const vectors = embeddingPayload.data ?? [];
      if (vectors.length !== batch.length || vectors.some((item) => !Array.isArray(item.embedding) || item.embedding.length !== 1536)) {
        return json({ error: "The embedding provider returned incomplete vectors.", savedDocument: true }, 502, headers);
      }

      const rows = batch.map((chunk, index) => ({
        document_id: documentId,
        chunk_index: offset + index,
        chunk_text: chunk,
        embedding: vectors.find((item) => item.index === index)?.embedding,
        metadata: { source_url: sourceUrl.toString(), category: input.category },
      }));
      const { error: chunkError } = await admin
        .from("ai_knowledge_chunks")
        .insert(rows);
      if (chunkError) {
        console.error("Knowledge chunk insert failed", { code: chunkError.code });
        return json({ error: "A knowledge batch could not be saved.", savedDocument: true }, 500, headers);
      }
    }

    results.push({
      title: input.title.trim(),
      chunks: chunks.length,
      published: isPublished,
    });
  }

  return json({ ok: true, documents: results.length, results }, 200, headers);
});
