-- Backend hardening: remove superseded duplicate RLS policies and duplicate profile timestamp trigger.
-- Applied to Supabase project qcvypvvjzrooqylfvpza on 2026-10-08.

begin;

drop policy if exists "gpf_rls_cf6fc961a47c770b891b2fe0e8268975" on public.corrections;
drop policy if exists "gpf_rls_26491f0a3c53df70b81d6df231214736" on public.corrections;
drop policy if exists "gpf_rls_0df8a459d2bd96dae9a8b21e36b57106" on public.corrections;
drop policy if exists "gpf_rls_873179b70179f3cc943d48dcc17a2c20" on public.corrections;

drop policy if exists "gpf_rls_b9cce6e0ca6368c3595beb857020f4b3" on public.institutions;
drop policy if exists "gpf_rls_295803979728418e6655294255069a5a" on public.institutions;
drop policy if exists "gpf_rls_c77cf733f7fbe7d7a58187ed0fccf809" on public.institutions;
drop policy if exists "gpf_rls_03867bdefdb7229598078cfa4965c6fd" on public.institutions;
drop policy if exists "gpf_rls_37bfe107b0b499362113411fd4f1ac7e" on public.institutions;

drop policy if exists "gpf_rls_86decc4317143fea342283894081ca0a" on public.internship_providers;
drop policy if exists "gpf_rls_597590a3d4ecee84d38d17aff2bc709d" on public.internship_providers;
drop policy if exists "gpf_rls_2d2b78cb7cbca878518417833f887e5f" on public.internship_providers;
drop policy if exists "gpf_rls_c3d075393ac277db00b77af9e0e31cbd" on public.internship_providers;
drop policy if exists "gpf_rls_f0a3c34cc30e0adc28f0c8dff5422ea4" on public.internship_providers;

drop policy if exists "gpf_rls_82d255586fdea11a43f942d9ea7f0018" on public.programmes;
drop policy if exists "gpf_rls_6e836e45ee3a80f947d05eca003b6662" on public.programmes;
drop policy if exists "gpf_rls_0e01c2cee42a4e43df80e84da85db2ba" on public.programmes;
drop policy if exists "gpf_rls_b17fe8448b9c9918aad50d64b7dc34c8" on public.programmes;
drop policy if exists "gpf_rls_b3ad636896d58c992576dabd6fd83dd0" on public.programmes;

drop policy if exists "gpf_rls_2af5ef8325d9235015a17a2195965868" on public.skill_providers;
drop policy if exists "gpf_rls_0a3ce5229e47a37667877d783318f924" on public.skill_providers;
drop policy if exists "gpf_rls_ea9361c989fa695b52e6b99f863bcf05" on public.skill_providers;
drop policy if exists "gpf_rls_2fb17179386da95d2830945e0bdb1150" on public.skill_providers;
drop policy if exists "gpf_rls_38d4e89d97f260d6a42ae3a2b1d4da72" on public.skill_providers;

drop policy if exists "gpf_rls_a0be449efb25b5c36ff876fc6f8ebf39" on public.universities;
drop policy if exists "gpf_rls_8717f45f3871a72806973e395b8509b6" on public.universities;
drop policy if exists "gpf_rls_e8905e227cfbeee679d76b50ef6e460d" on public.universities;
drop policy if exists "gpf_rls_fc5c710016c44bc7e688569537714430" on public.universities;
drop policy if exists "gpf_rls_8a5250b398421f3e17b85af9f9f60df4" on public.universities;

drop trigger if exists "trg_profiles_updated" on public.profiles;

notify pgrst, 'reload schema';
commit;