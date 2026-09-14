-- Remove the Life Simulator database objects.
-- The original feature migration is intentionally kept in history; this migration
-- cleanly removes its runtime database objects from the production schema.

drop function if exists public.ensure_life_simulation_profile();
drop table if exists public.life_simulation_decisions cascade;
drop table if exists public.life_simulation_profiles cascade;
