-- Phase 1: indexes for verification-infrastructure foreign keys.
-- Additive performance remediation for findings introduced by the Phase 1 tables.

create index if not exists idx_data_change_proposals_created_by
  on public.data_change_proposals(created_by);

create index if not exists idx_data_change_proposals_reviewed_by
  on public.data_change_proposals(reviewed_by);

create index if not exists idx_data_change_proposals_source_id
  on public.data_change_proposals(source_id);

create index if not exists idx_verification_log_source_id
  on public.verification_log(source_id);

create index if not exists idx_verification_log_run_id
  on public.verification_log(run_id);
