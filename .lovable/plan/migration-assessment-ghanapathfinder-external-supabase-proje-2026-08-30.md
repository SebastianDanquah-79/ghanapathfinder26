# Migration assessment: GhanaPathFinder → external Supabase project

Nothing was changed. This is a read-only findings report plus a recommended migration path.

## 1. Is the external project connected?

**No.** The external project `qcvypvvjzrooqylfvpza` is not configured anywhere in this project.

- `.env` and every runtime variable point only at the current Lovable Cloud backend (`hodvuidwrhlaildtcpww`).
- A search of the entire codebase for `qcvypvvjzrooqylfvpza` returns zero matches.
- No secret in this project holds a URL, anon/publishable key, service-role key, or database password for it.
- The external project does exist and its API is online (its REST and Auth endpoints answer, rejecting requests only because we hold no API key for it). So it is reachable, just not credentialed here.

Practical consequence: no migration step can run from inside this project until its credentials are supplied.

## 2. What is in the current backend (migration scope)

- 39 public tables, 92 RLS policies, ~50 database functions, ~45 triggers, `pg_trgm` extension, custom enum `app_role`.
- ~27 MB total database; largest tables: analytics_events (8.1k), programme_careers (3.6k), programme_curriculum (3.3k), programmes / programme_information (888 each), universities (369).
- 92 user profiles and 92 role rows, i.e. ~92 auth accounts to move.
- One storage bucket `community-images` (private) — currently zero objects, so storage migration is effectively trivial.
- One Supabase Edge Function (`mcp`), OAuth-issuer bound to the current project ref; the app also proxies it at `/functions/v1/mcp`.
- 42 SQL migration files already tracked in `supabase/migrations/`.

## 3. What is possible, and what is not

Possible:
- Recreate the full schema, RLS, functions, triggers and data in the external project from a `pg_dump`/`pg_restore` of the current database.
- Move auth users **with password hashes preserved** only via a direct `auth.users` table copy using the external project's database password (Supabase's own documented self-migration path). Users keep their passwords and IDs, so all `user_id` foreign keys stay valid.
- Repoint the app by swapping the six Supabase env values and the project ref used by the MCP server.

Not possible from inside Lovable:
- Lovable Cloud does not expose the service-role key or database password of the *current* project to the chat, and there is no built-in "export to my own Supabase" button. The dump must be taken with credentials you hold, or by Lovable support.
- Reading `auth.users` is blocked for the role available here, so auth export cannot be scripted in this sandbox; it must be run from your machine with both connection strings.
- Google/social provider settings, SMTP, redirect URLs, JWT settings and rate limits are project-level Auth config and do not travel in a dump — they must be re-entered in the new project's dashboard.

## 4. Credentials / steps required from you

1. External project (`qcvypvvjzrooqylfvpza`): Project URL, publishable/anon key, service-role key, and the database connection string (session pooler, with password).
2. Current project: its database connection string — available to Lovable Cloud users only through Lovable support, or by first connecting this project to your own Supabase org.
3. Decide whether analytics_events (8.1k rows, disposable telemetry) is migrated or dropped.

## 5. Recommended migration sequence (run later, on approval)

```text
1. pg_dump --schema-only  (old) -> psql (new)      schema, RLS, functions, triggers
2. pg_dump --data-only --schema public (old) -> new   with session_replication_role=replica
3. copy auth.users + auth.identities (old) -> new     preserves passwords and user IDs
4. re-create storage bucket community-images (private) + its RLS policies
5. re-configure Auth in the new dashboard: Google provider, site URL, redirect URLs, email templates
6. redeploy the mcp edge function against the new ref; update its OAuth issuer URL
7. swap the 6 env values + supabase/config.toml project_id; regenerate types
8. verify: sign-in, saved items, community post + image upload, admin analytics, MCP OAuth
9. keep the old project read-only for a rollback window, then decommission
```

## Technical notes

- Step 2 must disable triggers (`session_replication_role = replica`) or the autofill triggers on `programmes` and the counter triggers on `analytics_events`/`profiles` will fire during restore and corrupt derived rows.
- `handle_new_user()` is attached to `auth.users`; copy auth data *after* schema restore but ensure the trigger does not double-insert profiles — restore profiles after users, or drop the trigger during the copy.
- `pg_trgm` and the `app_role` enum must exist in the new project before data load.
- The `mcp` function's OAuth issuer is hard-coded to the old ref in `src/lib/mcp/index.ts`; existing MCP client authorizations will need re-consent after the switch.
- Nothing in this plan runs automatically; each step needs your explicit go-ahead and the credentials above.
