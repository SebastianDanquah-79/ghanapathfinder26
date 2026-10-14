-- Add discipline-specific creative careers so arts programmes do not inherit only
-- generic or education-only routes. Interdisciplinary programme titles retain
-- their existing career options and receive the additional arts pathways too.
WITH additions AS (
  SELECT
    p.id,
    (
      CASE
        WHEN p.name ~* '(theatre|theater|drama|performing arts|acting|stage production)'
        THEN ARRAY[
          'Actor or theatre performer',
          'Theatre director or dramaturg',
          'Stage, production or live-events manager',
          'Playwright, scriptwriter or theatre researcher',
          'Arts administrator or theatre-company coordinator'
        ]::text[]
        ELSE ARRAY[]::text[]
      END
      ||
      CASE
        WHEN p.name ~* '(^|[^a-z])(music|musical|sound production|music production)([^a-z]|$)'
        THEN ARRAY[
          'Musician, composer or session performer',
          'Music producer or sound-recording assistant',
          'Sound engineer or live-audio technician',
          'Music director or ensemble coordinator',
          'Music event, publishing or label assistant'
        ]::text[]
        ELSE ARRAY[]::text[]
      END
      ||
      CASE
        WHEN p.name ~* '(fashion|textile|clothing and textiles|garment|apparel|fashion design)'
        THEN ARRAY[
          'Fashion or textile designer',
          'Pattern maker or garment-production technologist',
          'Stylist, costume designer or wardrobe assistant',
          'Fashion product developer or merchandising assistant',
          'Fashion label or creative-business owner'
        ]::text[]
        ELSE ARRAY[]::text[]
      END
      ||
      CASE
        WHEN p.name ~* '(graphic design|communication design|visual communication|industrial art|product design|interior design|art and design|design technology)'
        THEN ARRAY[
          'Graphic or communication designer',
          'Brand identity or visual-content designer',
          'Industrial, product or interior design assistant',
          '3D visualisation, illustration or production-art assistant',
          'Creative director pathway with portfolio and experience'
        ]::text[]
        ELSE ARRAY[]::text[]
      END
      ||
      CASE
        WHEN p.name ~* '(fine art|visual art|painting|sculpture|creative art|integrated art|arts and design|art education|arts education|ceramic|jewellery|jewelry|illustration)'
        THEN ARRAY[
          'Visual artist, painter, sculptor or illustrator',
          'Gallery, museum or cultural-programme assistant',
          'Art director or creative-studio assistant',
          'Commissioned artist or independent creative entrepreneur',
          'Arts education or community arts facilitator (where qualified)'
        ]::text[]
        ELSE ARRAY[]::text[]
      END
      ||
      CASE
        WHEN p.name ~* '(animation|film|cinema|photography|broadcast production|multimedia|motion graphics|video production)'
        THEN ARRAY[
          'Animator or motion-graphics artist',
          'Film, video or post-production editor',
          'Photographer, videographer or camera assistant',
          'Storyboard, visual-effects or multimedia artist',
          'Digital content producer or production coordinator'
        ]::text[]
        ELSE ARRAY[]::text[]
      END
    ) AS additions
  FROM public.programmes p
  WHERE p.name ~* '(theatre|theater|drama|performing arts|acting|stage production|music|musical|sound production|music production|fashion|textile|clothing and textiles|garment|apparel|graphic design|communication design|visual communication|industrial art|product design|interior design|art and design|design technology|fine art|visual art|painting|sculpture|creative art|integrated art|arts and design|art education|arts education|ceramic|jewellery|jewelry|illustration|animation|film|cinema|photography|broadcast production|multimedia|motion graphics|video production)'
),
merged AS (
  SELECT
    p.id,
    ARRAY(
      SELECT DISTINCT item
      FROM unnest(
        coalesce(p.career_opportunities, ARRAY[]::text[]) || a.additions
      ) WITH ORDINALITY AS route(item, route_position)
      ORDER BY item
    ) AS careers
  FROM public.programmes p
  JOIN additions a ON a.id = p.id
  WHERE cardinality(a.additions) > 0
)
UPDATE public.programmes target
SET career_opportunities = merged.careers,
    updated_at = now()
FROM merged
WHERE target.id = merged.id
  AND cardinality(merged.careers) > cardinality(coalesce(target.career_opportunities, ARRAY[]::text[]));

INSERT INTO public.programme_careers
  (programme_id, career, occupation, description, updated_at)
SELECT
  p.id,
  role.career,
  role.career,
  'Possible career route associated with ' || p.name ||
  '. Actual opportunities depend on portfolio, experience, employers and any current professional requirements.',
  now()
FROM public.programmes p
CROSS JOIN LATERAL unnest(coalesce(p.career_opportunities, ARRAY[]::text[])) AS role(career)
WHERE p.name ~* '(theatre|theater|drama|performing arts|acting|stage production|music|musical|sound production|music production|fashion|textile|clothing and textiles|garment|apparel|graphic design|communication design|visual communication|industrial art|product design|interior design|art and design|design technology|fine art|visual art|painting|sculpture|creative art|integrated art|arts and design|art education|arts education|ceramic|jewellery|jewelry|illustration|animation|film|cinema|photography|broadcast production|multimedia|motion graphics|video production)'
  AND coalesce(cardinality(p.career_opportunities), 0) > 0
ON CONFLICT (programme_id, career) DO UPDATE
SET occupation = EXCLUDED.occupation,
    description = EXCLUDED.description,
    updated_at = now();
