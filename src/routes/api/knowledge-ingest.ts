import { createFileRoute } from "@tanstack/react-router";
import { createOpenAI } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { checkApiRateLimit, rateLimitResponse, readJsonBody } from "@/lib/api-rate-limit";

type DbError = { code?: string; message: string };
type DbResult<T> = { data: T | null; error: DbError | null };
type AdminQuery = PromiseLike<DbResult<unknown>> & {
  select(columns?: string): AdminQuery;
  eq(column: string, value: string): AdminQuery;
  maybeSingle(): Promise<DbResult<Record<string, unknown>>>;
  single(): Promise<DbResult<Record<string, unknown>>>;
  upsert(values: Record<string, unknown>, options?: { onConflict?: string }): AdminQuery;
  delete(): AdminQuery;
  insert(values: Array<Record<string, unknown>>): AdminQuery;
};
type AdminClient = {
  auth: {
    getUser(token: string): Promise<{
      data: { user: { id: string } | null };
      error: DbError | null;
    }>;
  };
  from(table: string): AdminQuery;
};

const MAX_BODY_BYTES = 320_000;
const MAX_DOCUMENTS = 5;
const MAX_CONTENT_CHARS = 50_000;
const EMBEDDING_DIMENSIONS = 1536;

const verificationStatuses = new Set([
  "pending_review",
  "unverified",
  "verified",
  "official",
]);

type KnowledgeDocumentInput = {
  title: string;
  content: string;
  sourceName: string;
  sourceUrl: string;
  countryCode: string | null;
  category: string;
  publicationDate: string | null;
  lastVerifiedAt: string | null;
  verificationStatus: "pending_review" | "unverified" | "verified" | "official";
  isPublished: boolean;
  metadata: Record<string, unknown>;
};

function chunkText(input: string, maxChars = 2200, overlapChars = 250): string[] {
  const normalized = input.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
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
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function parseDocuments(body: unknown): KnowledgeDocumentInput[] {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("A valid JSON request is required.");
  }

  const rawDocuments = (body as Record<string, unknown>)["documents"];
  if (!Array.isArray(rawDocuments) || rawDocuments.length < 1 || rawDocuments.length > MAX_DOCUMENTS) {
    throw new Error("Send between 1 and 5 documents per request.");
  }

  return rawDocuments.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new Error(`Document ${index + 1} is invalid.`);
    }
    const row = raw as Record<string, unknown>;
    const title = typeof row["title"] === "string" ? row["title"].trim() : "";
    const content = typeof row["content"] === "string" ? row["content"].trim() : "";
    const sourceName = typeof row["sourceName"] === "string" ? row["sourceName"].trim() : "";
    const sourceUrl = typeof row["sourceUrl"] === "string" ? row["sourceUrl"].trim() : "";
    const category = typeof row["category"] === "string" ? row["category"].trim() : "";
    const countryCode = typeof row["countryCode"] === "string" && /^[A-Za-z]{2}$/.test(row["countryCode"])
      ? row["countryCode"].toUpperCase()
      : null;
    const verificationStatus = typeof row["verificationStatus"] === "string" &&
      verificationStatuses.has(row["verificationStatus"])
      ? row["verificationStatus"] as KnowledgeDocumentInput["verificationStatus"]
      : "pending_review";
    const isPublished = row["isPublished"] === true;
    const metadata = row["metadata"] && typeof row["metadata"] === "object" && !Array.isArray(row["metadata"])
      ? row["metadata"] as Record<string, unknown>
      : {};

    if (title.length < 3 || title.length > 300) throw new Error(`Document ${index + 1}: title must be 3–300 characters.`);
    if (content.length < 100 || content.length > MAX_CONTENT_CHARS) throw new Error(`Document ${index + 1}: source text must be 100–50,000 characters.`);
    if (sourceName.length < 2 || sourceName.length > 180) throw new Error(`Document ${index + 1}: source name is required.`);
    if (category.length < 2 || category.length > 80) throw new Error(`Document ${index + 1}: select a valid category.`);

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(sourceUrl);
    } catch {
      throw new Error(`Document ${index + 1}: enter a valid HTTPS source URL.`);
    }
    if (parsedUrl.protocol !== "https:") throw new Error(`Document ${index + 1}: source URLs must use HTTPS.`);
    if (isPublished && verificationStatus !== "verified" && verificationStatus !== "official") {
      throw new Error(`Document ${index + 1}: only verified or official material can be published.`);
    }

    const publicationDate = typeof row["publicationDate"] === "string" && /^\d{4}-\d{2}-\d{2}$/.test(row["publicationDate"])
      ? row["publicationDate"]
      : null;
    const lastVerifiedAt = typeof row["lastVerifiedAt"] === "string" &&
      !Number.isNaN(Date.parse(row["lastVerifiedAt"]))
      ? new Date(row["lastVerifiedAt"]).toISOString()
      : null;

    return {
      title,
      content,
      sourceName,
      sourceUrl: parsedUrl.toString(),
      countryCode,
      category,
      publicationDate,
      lastVerifiedAt,
      verificationStatus,
      isPublished,
      metadata,
    };
  });
}

async function createEmbeddings(chunks: string[]): Promise<number[][]> {
  const useGateway = process.env["AI_PROVIDER"]?.trim().toLowerCase() === "vercel-gateway";
  let model: string | ReturnType<ReturnType<typeof createOpenAI>["embeddingModel"]>;

  if (useGateway) {
    const gatewayModel = process.env["AI_GATEWAY_MODEL_EMBEDDING"]?.trim() || "openai/text-embedding-3-small";
    if (!gatewayModel.includes("/")) {
      throw new Error("Configure AI_GATEWAY_MODEL_EMBEDDING with a provider/model identifier.");
    }
    // A plain provider/model string uses AI Gateway's Vercel OIDC
    // authentication in deployed Vercel functions; no OIDC token is read
    // from process.env or manually forwarded by application code.
    model = gatewayModel;
  } else {
    const apiKey = process.env["OPENAI_API_KEY"]?.trim();
    if (!apiKey) {
      throw new Error("The OpenAI embedding credential is not configured on this deployment.");
    }
    const modelName = process.env["OPENAI_EMBEDDING_MODEL"]?.trim() || "text-embedding-3-small";
    model = createOpenAI({ apiKey }).embeddingModel(modelName);
  }

  const { embeddings } = await embedMany({
    model,
    values: chunks,
    maxRetries: 0,
    maxParallelCalls: 2,
    abortSignal: AbortSignal.timeout(30_000),
  });

  if (embeddings.length !== chunks.length || embeddings.some(
    (vector) => !Array.isArray(vector) || vector.length !== EMBEDDING_DIMENSIONS ||
      vector.some((value) => !Number.isFinite(value)),
  )) {
    throw new Error("The embedding provider returned an incomplete or invalid vector set.");
  }
  return embeddings;
}

export const Route = createFileRoute("/api/knowledge-ingest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkApiRateLimit(request, "knowledge-ingest", 4, 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);

        let body: unknown;
        try {
          body = await readJsonBody(request, MAX_BODY_BYTES);
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return Response.json({
            error: tooLarge ? "The ingestion request is too large." : "A valid JSON request is required.",
          }, { status: tooLarge ? 413 : 400 });
        }

        const authorization = request.headers.get("Authorization") || "";
        if (!authorization.startsWith("Bearer ")) {
          return Response.json({ error: "Sign in with an administrator account to add knowledge." }, { status: 401 });
        }

        let documents: KnowledgeDocumentInput[];
        try {
          documents = parseDocuments(body);
        } catch (error) {
          return Response.json({
            error: error instanceof Error ? error.message : "The ingestion request is invalid.",
          }, { status: 400 });
        }

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const admin = supabaseAdmin as unknown as AdminClient;
          const token = authorization.slice("Bearer ".length);
          const { data: authData, error: authError } = await admin.auth.getUser(token);
          if (authError || !authData.user) {
            return Response.json({ error: "Your session is invalid. Sign in again." }, { status: 401 });
          }

          const { data: adminRole, error: roleError } = await admin
            .from("user_roles")
            .select("role")
            .eq("user_id", authData.user.id)
            .eq("role", "admin")
            .maybeSingle();

          if (roleError || !adminRole) {
            return Response.json({ error: "Only authorised GhanaPathFinder administrators can add AI knowledge." }, { status: 403 });
          }

          const results: Array<{ title: string; chunks: number; published: boolean }> = [];
          for (const document of documents) {
            const chunks = chunkText(document.content);
            if (chunks.length === 0) throw new Error(`No readable text was found in "${document.title}".`);

            // Generate vectors before replacing database chunks. A model/provider
            // error therefore leaves the previous searchable version untouched.
            const vectors = await createEmbeddings(chunks);
            const contentHash = await sha256([
              document.title,
              document.sourceUrl,
              document.content,
            ].join("\n"));

            const { data: savedDocument, error: documentError } = await admin
              .from("ai_knowledge_documents")
              .upsert({
                title: document.title,
                country_code: document.countryCode,
                category: document.category,
                source_name: document.sourceName,
                source_url: document.sourceUrl,
                publication_date: document.publicationDate,
                last_verified_at: document.lastVerifiedAt,
                verification_status: document.verificationStatus,
                visibility: "public",
                owner_user_id: null,
                content_hash: contentHash,
                is_published: document.isPublished,
                metadata: {
                  ...document.metadata,
                  ingested_by: authData.user.id,
                  ingestion_method: "vercel-admin-api",
                },
                updated_at: new Date().toISOString(),
              }, { onConflict: "content_hash" })
              .select("id")
              .single();

            if (documentError || !savedDocument?.["id"]) {
              console.error("Knowledge document save failed", { code: documentError?.code });
              throw new Error("A source document could not be saved.");
            }

            const documentId = String(savedDocument["id"]);
            const { error: deleteError } = await admin
              .from("ai_knowledge_chunks")
              .delete()
              .eq("document_id", documentId);
            if (deleteError) {
              console.error("Knowledge chunk replacement failed", { code: deleteError.code });
              throw new Error("Existing source chunks could not be refreshed.");
            }

            const rows = chunks.map((chunk, index) => ({
              document_id: documentId,
              chunk_index: index,
              chunk_text: chunk,
              embedding: vectors[index],
              metadata: {
                source_url: document.sourceUrl,
                category: document.category,
                country_code: document.countryCode,
              },
            }));
            const { error: chunksError } = await admin
              .from("ai_knowledge_chunks")
              .insert(rows);
            if (chunksError) {
              console.error("Knowledge chunks insert failed", { code: chunksError.code });
              throw new Error("Searchable knowledge chunks could not be saved.");
            }

            results.push({
              title: document.title,
              chunks: chunks.length,
              published: document.isPublished,
            });
          }

          return Response.json({
            ok: true,
            documents: results.length,
            results,
          }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          console.error("Knowledge ingestion failed", error instanceof Error ? error.message : "Unknown error");
          const message = error instanceof Error ? error.message : "Knowledge ingestion failed.";
          const status = /rate-limited/i.test(message) ? 429 : 500;
          return Response.json({ error: message }, {
            status,
            headers: { "Cache-Control": "no-store" },
          });
        }
      },
    },
  },
});
