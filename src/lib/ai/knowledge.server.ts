import type { SupabaseClient } from "@supabase/supabase-js";

export type KnowledgeSearchRecord = {
  title: string;
  country_code: string | null;
  category: string;
  source_name: string;
  source_url: string;
  publication_date: string | null;
  last_verified_at: string | null;
  verification_status: string;
  chunk_text: string;
  similarity: number;
};

export type KnowledgeSearchResult = {
  available: boolean;
  records: KnowledgeSearchRecord[];
  note?: string;
};

const EMBEDDING_MODEL = process.env["OPENAI_EMBEDDING_MODEL"] || "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

export async function searchGlobalKnowledge(
  query: string,
  options: { countryCode?: string; category?: string; limit?: number } = {},
): Promise<KnowledgeSearchResult> {
  const normalizedQuery = query.trim().slice(0, 1200);
  if (normalizedQuery.length < 3) {
    return { available: true, records: [], note: "The search query is too short." };
  }

  const apiKey = process.env["OPENAI_API_KEY"];
  if (!apiKey) {
    return { available: false, records: [], note: "Knowledge search is not configured." };
  }

  try {
    const embeddingResponse = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: normalizedQuery,
        dimensions: EMBEDDING_DIMENSIONS,
        encoding_format: "float",
      }),
      signal: AbortSignal.timeout(12_000),
    });

    if (!embeddingResponse.ok) {
      console.error("GhanaPathFinder knowledge embedding request failed", {
        status: embeddingResponse.status,
      });
      return {
        available: false,
        records: [],
        note: embeddingResponse.status === 429
          ? "Semantic search is temporarily rate-limited."
          : "Semantic search is temporarily unavailable.",
      };
    }

    const embeddingPayload = await embeddingResponse.json() as {
      data?: Array<{ embedding?: number[] }>;
    };
    const embedding = embeddingPayload.data?.[0]?.embedding;
    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS) {
      console.error("GhanaPathFinder embedding response had an unexpected shape");
      return { available: false, records: [], note: "Semantic search returned an invalid embedding." };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const client = supabaseAdmin as unknown as SupabaseClient;
    const { data, error } = await client.rpc("search_ai_knowledge" as never, {
      p_query_text: normalizedQuery,
      p_query_embedding: JSON.stringify(embedding),
      p_match_count: Math.min(Math.max(options.limit ?? 8, 1), 12),
      p_country_filter: options.countryCode?.toUpperCase() ?? null,
      p_category_filter: options.category ?? null,
    } as never);

    if (error) {
      console.error("GhanaPathFinder knowledge retrieval failed", {
        code: error.code,
        message: error.message.slice(0, 240),
      });
      return {
        available: false,
        records: [],
        note: "The searchable knowledge store is not available yet.",
      };
    }

    return {
      available: true,
      records: (Array.isArray(data) ? data : []) as KnowledgeSearchRecord[],
    };
  } catch (error) {
    console.error("GhanaPathFinder knowledge retrieval failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    return {
      available: false,
      records: [],
      note: error instanceof Error && error.name === "TimeoutError"
        ? "Semantic search timed out."
        : "Semantic search is temporarily unavailable.",
    };
  }
}
