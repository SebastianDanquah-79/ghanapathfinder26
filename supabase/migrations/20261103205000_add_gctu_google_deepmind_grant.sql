-- Add the official GCTU institutional highlight to the university profile.
-- Idempotent: repeated application does not duplicate the source URL.
UPDATE public.universities
SET
  short_description = 'Public technology-oriented university in Accra, Ghana, with academic programmes across computing, engineering, business and communication technology.',
  description = 'Notable development: on 3 June 2026, GCTU announced that its Department of Computer Engineering had secured a Google DeepMind AI Research Foundation grant to advance AI education, research and capacity building. The initiative is intended to train faculty AI Champions, who will then support teaching assistants and students in emerging AI technologies and model development. This is a university-reported achievement; current programme participation and admissions details should be confirmed directly with GCTU.',
  source_urls = CASE
    WHEN 'https://site.gctu.edu.gh/news/gctu-secures-google-deepmind-ai-research-foundation-grant.aspx' = ANY(COALESCE(source_urls, ARRAY[]::text[]))
    THEN COALESCE(source_urls, ARRAY[]::text[])
    ELSE ARRAY_APPEND(
      COALESCE(source_urls, ARRAY[]::text[]),
      'https://site.gctu.edu.gh/news/gctu-secures-google-deepmind-ai-research-foundation-grant.aspx'
    )
  END,
  field_sources = jsonb_set(
    COALESCE(field_sources, '{}'::jsonb),
    '{institutional_highlight}',
    jsonb_build_object(
      'claim', 'GCTU Department of Computer Engineering secured a Google DeepMind AI Research Foundation grant for AI education, research and capacity building.',
      'source_url', 'https://site.gctu.edu.gh/news/gctu-secures-google-deepmind-ai-research-foundation-grant.aspx',
      'source_kind', 'official university announcement',
      'published_on', '2026-06-03',
      'observed_on', '2026-11-03'
    ),
    true
  ),
  updated_at = now()
WHERE id = '4cb9e048-7c16-4dc1-a053-426e64ae28fd';
