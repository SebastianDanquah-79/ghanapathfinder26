-- GhanaPathFinder AI knowledge retrieval foundation.
-- Shared knowledge is kept separate from private student records and requires service-role access.

CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

CREATE TABLE IF NOT EXISTS public.ai_knowledge_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  country_code text,
  category text NOT NULL,
  source_name text NOT NULL,
  source_url text NOT NULL,
  publication_date date,
  last_verified_at timestamptz,
  verification_status text NOT NULL DEFAULT 'pending_review'
    CHECK (verification_status IN ('pending_review', 'unverified', 'verified', 'official')),
  visibility text NOT NULL DEFAULT 'public'
    CHECK (visibility IN ('public', 'private')),
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content_hash text NOT NULL UNIQUE,
  is_published boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT ai_knowledge_private_owner_check
    CHECK (visibility <> 'private' OR owner_user_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS public.ai_knowledge_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.ai_knowledge_documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL CHECK (chunk_index >= 0),
  chunk_text text NOT NULL,
  embedding extensions.vector(1536),
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', chunk_text)) STORED,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS ai_knowledge_documents_category_idx
  ON public.ai_knowledge_documents (category, country_code, is_published);

CREATE INDEX IF NOT EXISTS ai_knowledge_chunks_search_vector_idx
  ON public.ai_knowledge_chunks USING gin (search_vector);

CREATE INDEX IF NOT EXISTS ai_knowledge_chunks_embedding_idx
  ON public.ai_knowledge_chunks USING hnsw (embedding vector_cosine_ops);

ALTER TABLE public.ai_knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_knowledge_chunks ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.ai_knowledge_documents FROM anon, authenticated;
REVOKE ALL ON TABLE public.ai_knowledge_chunks FROM anon, authenticated;
GRANT ALL ON TABLE public.ai_knowledge_documents TO service_role;
GRANT ALL ON TABLE public.ai_knowledge_chunks TO service_role;

CREATE OR REPLACE FUNCTION public.search_ai_knowledge(
  p_query_text text,
  p_query_embedding extensions.vector(1536),
  p_match_count integer DEFAULT 8,
  p_country_filter text DEFAULT NULL,
  p_category_filter text DEFAULT NULL
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  title text,
  country_code text,
  category text,
  source_name text,
  source_url text,
  publication_date date,
  last_verified_at timestamptz,
  verification_status text,
  chunk_text text,
  similarity double precision,
  retrieval_score double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, extensions
AS $$
  WITH query_terms AS (
    SELECT websearch_to_tsquery('simple', coalesce(p_query_text, '')) AS tsq
  ),
  full_text AS (
    SELECT
      c.id,
      row_number() OVER (
        ORDER BY ts_rank_cd(c.search_vector, q.tsq) DESC
      ) AS rank_ix
    FROM public.ai_knowledge_chunks c
    JOIN public.ai_knowledge_documents d ON d.id = c.document_id
    CROSS JOIN query_terms q
    WHERE d.is_published = true
      AND d.visibility = 'public'
      AND c.search_vector @@ q.tsq
      AND (p_country_filter IS NULL OR d.country_code = p_country_filter)
      AND (p_category_filter IS NULL OR d.category = p_category_filter)
    ORDER BY rank_ix
    LIMIT least(greatest(coalesce(p_match_count, 8), 1), 20) * 3
  ),
  semantic AS (
    SELECT
      c.id,
      row_number() OVER (ORDER BY c.embedding <=> p_query_embedding) AS rank_ix
    FROM public.ai_knowledge_chunks c
    JOIN public.ai_knowledge_documents d ON d.id = c.document_id
    WHERE d.is_published = true
      AND d.visibility = 'public'
      AND c.embedding IS NOT NULL
      AND (p_country_filter IS NULL OR d.country_code = p_country_filter)
      AND (p_category_filter IS NULL OR d.category = p_category_filter)
    ORDER BY c.embedding <=> p_query_embedding
    LIMIT least(greatest(coalesce(p_match_count, 8), 1), 20) * 3
  ),
  fused AS (
    SELECT
      coalesce(ft.id, s.id) AS id,
      coalesce(1.0 / (60 + ft.rank_ix), 0.0)
        + coalesce(1.0 / (60 + s.rank_ix), 0.0) AS score
    FROM full_text ft
    FULL OUTER JOIN semantic s ON s.id = ft.id
  )
  SELECT
    c.id AS chunk_id,
    d.id AS document_id,
    d.title,
    d.country_code,
    d.category,
    d.source_name,
    d.source_url,
    d.publication_date,
    d.last_verified_at,
    d.verification_status,
    c.chunk_text,
    (1.0 - (c.embedding <=> p_query_embedding))::double precision AS similarity,
    f.score::double precision AS retrieval_score
  FROM fused f
  JOIN public.ai_knowledge_chunks c ON c.id = f.id
  JOIN public.ai_knowledge_documents d ON d.id = c.document_id
  ORDER BY f.score DESC
  LIMIT least(greatest(coalesce(p_match_count, 8), 1), 20);
$$;

REVOKE ALL ON FUNCTION public.search_ai_knowledge(text, extensions.vector, integer, text, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_ai_knowledge(text, extensions.vector, integer, text, text)
  TO service_role;
