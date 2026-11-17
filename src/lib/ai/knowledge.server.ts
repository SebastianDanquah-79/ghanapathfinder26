import { embed } from "ai";
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
  similarity: number | null;
};

export type KnowledgeSearchResult = {
  available: boolean;
  records: KnowledgeSearchRecord[];
  note?: string;
};

const EMBEDDING_MODEL =
  process.env["AI_GATEWAY_MODEL_EMBEDDING"] || "openai/text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

export async function searchGlobalKnowledge(
  query: string,
  options: { countryCode?: string; category?: string; limit?: number } = {},
): Promise<KnowledgeSearchResult> {
  const normalizedQuery = query.trim().slice(0, 1200);
  if (normalizedQuery.length < 3) {
    return { available: true, records: [], note: "The search query is too short." };
  }

  try {
    // Use AI SDK's provider-neutral model routing. On Vercel this authenticates
    // to AI Gateway through the deployment's OIDC token, avoiding a second
    // direct OpenAI generation/embedding dependency in the application.
    const { embedding } = await embed({
      model: EMBEDDING_MODEL,
      value: normalizedQuery,
      maxRetries: 1,
      abortSignal: AbortSignal.timeout(12_000),
    });

    if (!Array.isArray(embedding) || embedding.length !== EMBEDDING_DIMENSIONS) {
      console.error("GhanaPathFinder query embedding had an unexpected dimension", {
        expected: EMBEDDING_DIMENSIONS,
        received: Array.isArray(embedding) ? embedding.length : 0,
      });
      return {
        available: false,
        records: [],
        note: "The knowledge search model returned an incompatible vector.",
      };
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
      message: error instanceof Error ? error.message.slice(0, 180) : "Unknown failure",
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
