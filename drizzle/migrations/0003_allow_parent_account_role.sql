-- Keep the auth signup flow consistent with the parent account option exposed by the UI.
-- The auth trigger copies account_type into profiles.account_role.
-- Parent accounts were previously rejected by profiles_account_role_check.
alter table public.profiles drop constraint if exists profiles_account_role_check;

alter table public.profiles add constraint profiles_account_role_check
check (
  account_role = any (array[
    'student',
    'parent',
    'employer',
    'employee',
    'startup_founder',
    'international_student'
  ])
);
