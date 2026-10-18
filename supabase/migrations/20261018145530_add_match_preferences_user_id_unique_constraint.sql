-- The preferences UI loads one row per user and saves with onConflict: "user_id".
-- Enforce that one-to-one relationship so PostgREST upserts can resolve the conflict target.
ALTER TABLE public.match_preferences
  ADD CONSTRAINT match_preferences_user_id_key UNIQUE (user_id);
