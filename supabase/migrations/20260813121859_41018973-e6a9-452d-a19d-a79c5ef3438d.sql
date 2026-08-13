
CREATE OR REPLACE FUNCTION public.find_duplicate_institution(_name text)
RETURNS TABLE(id uuid, name text, slug text, similarity real)
LANGUAGE sql STABLE SET search_path TO 'public'
AS $$
  SELECT u.id, u.name, u.slug, similarity(u.name, _name)::real
  FROM public.universities u
  WHERE lower(regexp_replace(u.name, '[^a-z0-9]+', '', 'gi')) = lower(regexp_replace(trim(_name), '[^a-z0-9]+', '', 'gi'))
     OR lower(coalesce(u.short_name,'')) = lower(trim(_name))
     OR EXISTS (SELECT 1 FROM unnest(u.aliases) a WHERE lower(a) = lower(trim(_name)))
     OR similarity(u.name, _name) > 0.92
  ORDER BY 4 DESC
  LIMIT 5;
$$;
