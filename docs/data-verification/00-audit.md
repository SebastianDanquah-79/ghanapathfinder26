# GhanaPathFinder data verification audit — Phase 0

**Run date:** 2026-10-07  
**Scope:** read-only reconnaissance plus preparation for Phase 1. No production database writes were made.

## 1. System inventory

- GitHub source repository: `SebastianDanquah-79/ghanapathfinder26`
- Git default branch: `main`
- Supabase production project: `qcvypvvjzrooqylfvpza` (`ghanapath`, `eu-west-1`)
- Vercel project: `ghanapathfinder26`
- Vercel framework: TanStack Start
- Production domain: `ghanapathfinder.com`
- Supabase production database is healthy according to project status.
- Current database has 78 recorded migrations.

## 2. Repository findings

### README / architecture

The README is stale. It still describes an earlier Lovable-based GhanaPath application, references Lovable URLs, Claude, and a frontend-only architecture. This conflicts with the current GitHub + Vercel + Supabase/TanStack Start architecture and should be corrected in a later documentation PR.

### Build configuration

`package.json` declares TanStack Start/React 19, but also contains legacy Lovable/Vite configuration dependencies. `vite.config.ts` currently imports `@lovable.dev/vite-tanstack-config`. This violates the current no-Lovable architecture requirement and should be treated as a code/configuration issue.

### Routes

The TanStack route tree is active. The root route preloads university and scholarship catalogue data. The root shell contains authentication, analytics, PWA/service-worker, navigation, and assistant infrastructure.

### Migrations

The production database contains a long additive migration history. Relevant existing migrations include:
- verified-data review pipeline
- programme/institution linking
- source registry
- avatar storage
- CVs
- international pathway data
- Growth Path OS
- recent RLS policy deduplication

This is useful infrastructure, but it does not yet satisfy the requested verification model because the required `sources`, `entity_aliases`, `verification_log`, `data_change_proposals`, and `verification_runs` tables were not found by name in the current table inventory.

## 3. Production row counts

Exact counts queried from Supabase:

| Table | Rows |
|---|---:|
| institutions | 334 |
| universities | 228 |
| programmes | 213 |
| skills | 30 |
| companies | 154 |
| scholarships | 8 |
| internship_providers | 16 |
| internships | 0 |
| skill_providers | 18 |
| opportunities | 70 |
| learning_resources | 215 |
| news_articles | 6,726 |
| source_registry | 138 |
| data_sources | 0 |

### Thin / empty tables

- **Internships: 0** — empty and therefore a major coverage gap.
- **Scholarships: 8** — very thin for a student-facing Ghana platform.
- **Skill providers: 18** — thin.
- **Skills: 30** — thin for a career/skills catalogue.
- **Data sources: 0** — structurally important because source records are not being persisted there.
- **Internship providers: 16** — present but small.
- Many user-state tables are naturally empty because they only populate after users interact with the product; those should not be treated as catalogue gaps.

## 4. Current verification state

The existing schema uses inconsistent verification vocabularies.

### Institutions

`gtec_accreditation_status`:
- unverified: 176
- unrecognised: 89
- active: 69

This is **not** the requested canonical verification vocabulary and cannot be mapped silently. The 89 `unrecognised` records require careful reconciliation against the regulator's current notices/lists.

### Universities

`verification_status`:
- needs_review: 226
- verified: 2

### Programmes

`verification_status`:
- verified: 130
- source_confirmed: 83

Again, these do not exactly match the required Phase 1 vocabulary.

### Source presence

- Institutions: 334/334 have at least one source URL.
- Universities: 228/228 have at least one source URL.
- Programmes: 213/213 have at least one source URL.
- Companies: 135/154 have a source URL; 19 have none.
- Internship providers: 16/16 have source URLs.

A URL existing in the database is **not** evidence that it is authoritative or currently reachable.

## 5. Duplicate findings

Exact normalized-name duplicates exist in `institutions`. At least these names occur twice:
- Accra Technical University
- Ashesi University
- Bagabaga College of Education
- Central University
- Ghana Communication Technology University
- Kofi Annan International Peace Keeping Training Centre
- Koforidua Technical University
- Kumasi Technical University
- Kwame Nkrumah University of Science and Technology
- Takoradi Technical University
- University for Development Studies
- University of Cape Coast
- University of Education, Winneba
- University of Ghana
- University of Health and Allied Sciences
- University of Media, Arts and Communication
- University of Mines and Technology
- University of Professional Studies, Accra

No exact normalized duplicates were returned for `universities` or for programmes using the current (institution, normalized name, degree type) check.

**Action:** do not merge these records automatically. Per policy, they require proposals and approval.

## 6. Source systems opened in this session

- GTEC: unrecognized-institution notice, published 30 September 2026.
- GTEC: unaccredited institutions notice.
- GTEC: unaccredited centres notice dated 8 July 2026.
- CTVET: official site and accredited-provider register.
- CTVET: official private-institution list.
- Nursing and Midwifery Council of Ghana: official accredited-institutions register.
- GhanaPathFinder production site.
- Database and repository sources were inspected directly through their connected tools.

The official regulator pages above should be treated as starting points for Phase 2, with exact URLs stored in the new `sources` table once Phase 1 is approved and tested.

## 7. Production health

### Vercel

The production Vercel project exists and the latest listed production deployment is READY.

However, recent production runtime telemetry shows:
- 52 Seroval serialization errors on `/__server` in the latest reported cluster window.
- 51 `__exportAll is not a function` runtime errors across the reported period.
- 1 runtime error caused by code querying a non-existent `opportunities.verification_status` column.

These are production defects and should be handled as small, isolated PRs after the data-verification work is gated appropriately.

### Environment configuration

The Vercel project has Supabase-related environment variables, but the public/plain environment values point at a different Supabase project than the current connected production project inspected above. This is an architecture/data-integrity blocker.

The repository also contains a tracked `.env` file with credentials/secrets. This violates the no-secrets-in-repository rule. The values are intentionally not reproduced in this audit.

**Required approval/action:** rotate the exposed credentials and remove the tracked secret file from the repository/history using a controlled security remediation. Do not silently change auth or production credentials.

### Authentication / onboarding

The live site exposes:
- Google sign-in
- email/password sign-in
- password recovery
- onboarding profile fields
- WASSCE result entry and save/skip controls

A read-only web check confirms the UI routes render. It does **not** prove that Google OAuth, email sign-in, or profile persistence actually succeeds end-to-end. That requires an authenticated browser test, which has not been performed in this read-only pass.

### Storage

Supabase currently has public buckets named `avatars` and `feed-videos`. The storage object query returned no objects. Bucket existence therefore does not prove avatar upload is working.

## 8. Phase 0 blockers

1. A Supabase development branch is required before Phase 1 schema work.
2. The organization reports a development-branch cost of **$0.01344/hour**.
3. No Supabase development branches currently exist.
4. The production Vercel environment points at a different Supabase project than the inspected production database.
5. A tracked repository `.env` contains credentials/secrets and must be remediated.
6. Current production has runtime errors.
7. The existing verification statuses do not match the canonical vocabulary requested for Phase 1.

## 9. Phase 1 plan once the dev branch is approved

Create and test, additively, on the development branch:
- canonical verification fields on the real core tables
- `sources`
- `entity_aliases`
- `verification_log`
- `data_change_proposals`
- `verification_runs`
- stable slug/ID safeguards
- RLS for every new table
- admin-only writes
- public reads of verification metadata
- minimal proposal review page
- verification badge + accreditation display
- error-report moderation queue

Then:
1. regenerate database types;
2. run security and performance advisors;
3. resolve advisor findings;
4. run build/tests;
5. show a small sample of the first verification batch;
6. open a PR targeting `main`;
7. do not merge or apply production changes without review.

## 10. Decision required

**STOP:** the requested Phase 1 database work is blocked by the required Supabase development branch costing $0.01344/hour.

Please explicitly confirm whether you approve creation of that development branch at that rate. No paid branch has been created.
