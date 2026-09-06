ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _type TEXT := COALESCE(NEW.raw_user_meta_data ->> 'account_type', 'student');
BEGIN
  INSERT INTO public.profiles (id, full_name, email, account_type, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email, _type, NULLIF(NEW.raw_user_meta_data ->> 'phone', ''))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, CASE WHEN _type = 'parent' THEN 'parent'::public.app_role ELSE 'student'::public.app_role END)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;