-- Ensure PostgREST can infer the upsert conflict target (source, source_id).
-- A full unique index also permits multiple NULL source_id values in PostgreSQL.
CREATE UNIQUE INDEX IF NOT EXISTS opportunities_source_source_id_full_uq
ON public.opportunities (source, source_id);