-- Keep the profile bundle RPC compatible after removing the deprecated contact field.
-- The parameter remains optional for backward compatibility, but is intentionally ignored.
CREATE OR REPLACE FUNCTION public.save_profile_bundle(
  p_full_name text,
  p_email text DEFAULT NULL::text,
  p_school text DEFAULT NULL::text,
  p_region text DEFAULT NULL::text,
  p_country_code text DEFAULT 'GH'::text,
  p_target_career text DEFAULT NULL::text,
  p_interests text[] DEFAULT '{}'::text[],
  p_pathways text[] DEFAULT '{}'::text[],
  p_qualification_code text DEFAULT NULL::text,
  p_qualification_name text DEFAULT NULL::text,
  p_grading_scale text DEFAULT NULL::text,
  p_overall_score text DEFAULT NULL::text,
  p_qualification_metadata jsonb DEFAULT '{}'::jsonb,
  p_wassce_results jsonb DEFAULT '[]'::jsonb,
  p_qualification_results jsonb DEFAULT '[]'::jsonb,
  p_account_role text DEFAULT 'student'::text,
  p_whatsapp_number text DEFAULT NULL::text,
  p_linkedin_url text DEFAULT NULL::text
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_qid uuid;
  r jsonb;
  v_role text := CASE
    WHEN p_account_role IN ('student','employer','employee','startup_founder') THEN p_account_role
    ELSE 'student'
  END;
  v_linkedin text := NULLIF(trim(p_linkedin_url),'');
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF v_linkedin IS NOT NULL
     AND v_linkedin !~ '^https://(www\.)?linkedin\.com/in/[A-Za-z0-9._-]+/?$' THEN
    RAISE EXCEPTION 'Invalid LinkedIn profile URL';
  END IF;

  UPDATE public.profiles SET
    full_name = NULLIF(trim(p_full_name),''),
    email = COALESCE(NULLIF(trim(p_email),''), email),
    school = NULLIF(trim(p_school),''),
    region = NULLIF(trim(p_region),''),
    country_code = COALESCE(NULLIF(trim(p_country_code),''),'GH'),
    target_career = NULLIF(trim(p_target_career),''),
    interests = COALESCE(p_interests,'{}'),
    pathways = COALESCE(p_pathways,'{}'),
    account_role = v_role,
    linkedin_url = v_linkedin,
    onboarded = true,
    updated_at = now()
  WHERE id = v_user;

  IF NOT FOUND THEN
    INSERT INTO public.profiles (
      id,full_name,email,school,region,country_code,target_career,interests,pathways,
      account_role,linkedin_url,onboarded
    ) VALUES (
      v_user,NULLIF(trim(p_full_name),''),NULLIF(trim(p_email),''),NULLIF(trim(p_school),''),
      NULLIF(trim(p_region),''),COALESCE(NULLIF(trim(p_country_code),''),'GH'),
      NULLIF(trim(p_target_career),''),COALESCE(p_interests,'{}'),COALESCE(p_pathways,'{}'),
      v_role,v_linkedin,true
    );
  END IF;

  IF v_role='student' THEN
    INSERT INTO public.student_profiles(user_id,intended_country)
    VALUES(v_user,COALESCE(NULLIF(trim(p_country_code),''),'GH'))
    ON CONFLICT(user_id) DO UPDATE SET intended_country=excluded.intended_country,updated_at=now();
  ELSIF v_role='employee' THEN
    INSERT INTO public.employee_profiles(user_id,professional_title)
    VALUES(v_user,NULLIF(trim(p_target_career),''))
    ON CONFLICT(user_id) DO UPDATE SET professional_title=excluded.professional_title,updated_at=now();
  ELSIF v_role='employer' THEN
    INSERT INTO public.employer_profiles(user_id,organization_name)
    VALUES(v_user,NULLIF(trim(p_school),''))
    ON CONFLICT(user_id) DO UPDATE SET organization_name=excluded.organization_name,updated_at=now();
  END IF;

  IF p_qualification_code IS NOT NULL AND trim(p_qualification_code)<>'' THEN
    INSERT INTO public.student_qualifications(
      user_id,country_code,qualification_code,qualification_name,grading_scale,overall_score,metadata
    )
    VALUES(
      v_user,COALESCE(NULLIF(trim(p_country_code),''),'GH'),trim(p_qualification_code),
      COALESCE(p_qualification_name,trim(p_qualification_code)),p_grading_scale,p_overall_score,
      COALESCE(p_qualification_metadata,'{}')
    )
    ON CONFLICT(user_id) DO UPDATE SET
      country_code=excluded.country_code,qualification_code=excluded.qualification_code,
      qualification_name=excluded.qualification_name,grading_scale=excluded.grading_scale,
      overall_score=excluded.overall_score,metadata=excluded.metadata,updated_at=now()
    RETURNING id INTO v_qid;

    DELETE FROM public.student_qualification_results WHERE qualification_id=v_qid;
    FOR r IN SELECT * FROM jsonb_array_elements(COALESCE(p_qualification_results,'[]')) LOOP
      IF NULLIF(trim(r->>'subject'),'') IS NOT NULL THEN
        INSERT INTO public.student_qualification_results(qualification_id,subject,grade,level)
        VALUES(v_qid,trim(r->>'subject'),COALESCE(NULLIF(trim(r->>'grade'),''),'Entered'),NULLIF(trim(r->>'level'),''));
      END IF;
    END LOOP;
  END IF;

  DELETE FROM public.wassce_results WHERE user_id=v_user;
  FOR r IN SELECT * FROM jsonb_array_elements(COALESCE(p_wassce_results,'[]')) LOOP
    IF NULLIF(trim(r->>'subject'),'') IS NOT NULL THEN
      INSERT INTO public.wassce_results(user_id,subject,grade)
      VALUES(v_user,trim(r->>'subject'),COALESCE(NULLIF(trim(r->>'grade'),''),'Entered'));
    END IF;
  END LOOP;

  RETURN jsonb_build_object('saved',true,'user_id',v_user,'account_role',v_role);
END;
$function$;