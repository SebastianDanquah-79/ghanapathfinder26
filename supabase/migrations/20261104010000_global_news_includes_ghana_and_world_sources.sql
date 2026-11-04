CREATE OR REPLACE FUNCTION public.gpf_news_feed_v2(p_category text DEFAULT 'All'::text, p_country_code text DEFAULT NULL::text, p_published_after timestamp with time zone DEFAULT NULL::timestamp with time zone, p_limit integer DEFAULT 40, p_offset integer DEFAULT 0)
 RETURNS TABLE(id uuid, title text, excerpt text, original_url text, image_url text, country_code text, category text, published_at timestamp with time zone, source_name text, fetched_at timestamp with time zone)
 LANGUAGE sql
 STABLE
 SET search_path TO 'public'
AS $function$
  WITH base AS (
    SELECT n.id,n.title,n.excerpt,n.original_url,n.image_url,n.country_code,
      n.published_at,n.source_name,n.fetched_at,n.category AS source_category,
      lower(coalesce(n.title,'')) AS story_text
    FROM public.news_articles n
    WHERE p_published_after IS NULL OR n.published_at >= p_published_after
  ),
  tagged AS (
    SELECT b.*,
      CASE
        WHEN b.story_text ~ '(education|school|teacher|student|university|universities|college|campus|exam|scholarship|admission|waec|wassce|curriculum|classroom|academic|learning|tuition|tertiary)' THEN 'Education'
        WHEN b.story_text ~ '(culture|arts?|artist|artwork|music|musician|movie|film|cinema|festival|heritage|fashion|literature|book launch|dance|traditional|entertainment|celebrity)' THEN 'Culture'
        WHEN b.story_text ~ '(science|scientist|research|researcher|discovery|space|nasa|climate|environment|physics|chemistry|biology|astronomy|wildlife|medical research|health research|vaccine|disease|outbreak)' THEN 'Science'
        WHEN b.story_text ~ '(politic|election|president|parliament|minister|government|cabinet|opposition|lawmakers|voting|votes|legislation|senate|governor|mps|referendum|bill|npp|ndc)' THEN 'Politics'
        WHEN b.story_text ~ '(^|[^a-z])(sports?|football|soccer|basketball|athletics|tennis|championship|league table|olympic|premier league|champions league|la liga|ligue 1|striker|winger|goalkeeper|coach|transfer|stadium|fixture|trophy|caf awards|uefa|fifa|gfa|black challenge|black queens|black stars|black maidens)([^a-z]|$)'
          OR (b.story_text ~ 'world cup' AND b.story_text !~ '(explosion|dynamite|smuggl|cocaine|seizure|bomb|fire|police)') THEN 'Sports'
        WHEN b.story_text ~ '(business|finance|economy|economic|market|investment|investor|funding|startup|company|companies|banking|inflation|trade|profit|revenue|jobs report)' THEN 'Business'
        WHEN b.story_text ~ '(technology|tech industry|artificial intelligence|cybersecurity|software|robotics|digital|telecom|fintech|mobile money|innovation)' THEN 'Technology'
        WHEN upper(coalesce(b.country_code,''))='GH' THEN 'Ghana'
        WHEN upper(coalesce(b.country_code,''))='NG' THEN 'Nigeria'
        WHEN upper(coalesce(b.country_code,''))='AF'
          OR lower(coalesce(b.source_category,'')) ~ '(africa|pan-african)' THEN 'Africa'
        WHEN upper(coalesce(b.country_code,''))='NA' THEN 'Namibia'
        WHEN upper(coalesce(b.country_code,''))='EG' THEN 'Egypt'
        ELSE 'Global'
      END AS feed_category
    FROM base b
  ),
  scoped AS (
    SELECT t.* FROM tagged t
    WHERE CASE upper(coalesce(p_country_code,''))
      WHEN 'GH' THEN upper(coalesce(t.country_code,''))='GH'
      WHEN 'NG' THEN upper(coalesce(t.country_code,''))='NG'
      WHEN 'AFRICA' THEN
        upper(coalesce(t.country_code,'')) IN ('GH','NG','AF','NA','RW','KE','TZ','UG','ZA','EG','DZ','AO','BJ','BW','BF','BI','CV','CM','CF','TD','KM','CD','CG','CI','DJ','GQ','ER','SZ','ET','GA','GM','GN','GW','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NE','RE','ST','SN','SC','SL','SO','SS','SD','TG','TN','ZM','ZW')
        OR (t.country_code IS NULL AND lower(coalesce(t.source_category,'')) ~ '(africa|pan-african)')
      WHEN 'GLOBAL' THEN
        (
          upper(coalesce(t.country_code,'')) = 'GH'
          OR t.country_code IS NULL
          OR upper(t.country_code) NOT IN ('GH','NG','AF','NA','RW','KE','TZ','UG','ZA','EG','DZ','AO','BJ','BW','BF','BI','CV','CM','CF','TD','KM','CD','CG','CI','DJ','GQ','ER','SZ','ET','GA','GM','GN','GW','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NE','RE','ST','SN','SC','SO','SS','SD','TG','TN','ZM','ZW')
        )

      ELSE TRUE
    END
  )
  SELECT s.id,s.title,s.excerpt,s.original_url,s.image_url,s.country_code,
    s.feed_category,s.published_at,s.source_name,s.fetched_at
  FROM scoped s
  WHERE coalesce(p_category,'All')='All'
    OR (p_category='Ghana' AND upper(coalesce(s.country_code,''))='GH')
    OR (p_category='Nigeria' AND upper(coalesce(s.country_code,''))='NG')
    OR (p_category='Africa' AND (
      upper(coalesce(s.country_code,'')) IN ('GH','NG','AF','NA','RW','KE','TZ','UG','ZA','EG','DZ','AO','BJ','BW','BF','BI','CV','CM','CF','TD','KM','CD','CG','CI','DJ','GQ','ER','SZ','ET','GA','GM','GN','GW','LS','LR','LY','MG','MW','ML','MR','MU','MA','MZ','NE','RE','ST','SN','SC','SL','SO','SS','SD','TG','TN','ZM','ZW')
      OR lower(coalesce(s.source_category,'')) ~ '(africa|pan-african)'
    ))
    OR s.feed_category=p_category
  ORDER BY s.published_at DESC NULLS LAST,s.fetched_at DESC
  LIMIT least(greatest(coalesce(p_limit,40),1),200)
  OFFSET greatest(coalesce(p_offset,0),0);
$function$;

NOTIFY pgrst, 'reload schema';
