-- Restrict all GhanaPathFinder admin-role checks to the designated administrator account.
-- Admin role: tumikwabena79@gmail.com (fixed auth.users UUID checked before assignment).

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT CASE
    WHEN _role = 'admin'::public.app_role THEN
      _user_id = 'ce0e9936-f5cb-4911-af3b-661976344cd0'::uuid
      AND EXISTS (
        SELECT 1
        FROM public.user_roles ur
        WHERE ur.user_id = _user_id
          AND ur.role = _role
      )
    ELSE EXISTS (
      SELECT 1
      FROM public.user_roles ur
      WHERE ur.user_id = _user_id
        AND ur.role = _role
    )
  END;
$function$;

CREATE OR REPLACE FUNCTION public.is_gpf_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
  SELECT private.has_role(
    (SELECT auth.uid()),
    'admin'::public.app_role
  );
$function$;

DO $block$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT u.id
    INTO v_admin_id
  FROM auth.users u
  WHERE lower(u.email) = 'tumikwabena79@gmail.com';

  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'The designated GhanaPathFinder administrator account was not found.';
  END IF;

  IF v_admin_id <> 'ce0e9936-f5cb-4911-af3b-661976344cd0'::uuid THEN
    RAISE EXCEPTION 'The designated administrator account ID did not match the reviewed account.';
  END IF;

  DELETE FROM public.user_roles
  WHERE role = 'admin'::public.app_role
    AND user_id <> v_admin_id;

  INSERT INTO public.user_roles (user_id, role)
  SELECT v_admin_id, 'admin'::public.app_role
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = v_admin_id
      AND ur.role = 'admin'::public.app_role
  );
END
$block$;
