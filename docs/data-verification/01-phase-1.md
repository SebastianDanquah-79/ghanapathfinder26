# Phase 1 verification infrastructure

## Status

Drafted on a GitHub feature branch. No Supabase production changes were made.

## Scope

This migration adds the audit infrastructure required for verified data:

- `sources`
- `entity_aliases`
- `verification_runs`
- `verification_log`
- `data_change_proposals`

RLS is enabled on each new table.

## Safety gate

The migration must be tested in an isolated Supabase development environment before production execution. The development branch was intentionally skipped because it has a cost.

No production schema mutation, data backfill, verification status update, type regeneration, or deployment is included in this draft.

## Follow-up

Before applying this migration:

1. Verify the existing admin authorization model.
2. Add least-privilege RLS policies.
3. Add verification metadata to the actual core tables after confirming their schemas.
4. Run Supabase security and performance advisors.
5. Regenerate database types.
6. Run the application build and tests.
7. Review the PR before any merge to `main`.
