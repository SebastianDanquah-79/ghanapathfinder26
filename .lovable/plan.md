# Extend GhanaPathFinder: Advisor, Opportunity Feed, Tracker, Career Explorer, My Path

Additive work on the existing product. No route, nav flow, auth behaviour, catalogue, scholarship, international pathway, CV or My Path feature is removed.

## What already exists (reuse, do not duplicate)

| Feature | Existing pieces |
|---|---|
| AI Advisor | `FloatingAskAssistant`, `AskPanel`, `/api/chat`, `askContext.ts`, mounted in `__root.tsx` |
| Opportunity Feed | `opportunities` table already has source_url, source_name, verified, deadline/deadline_date, opportunity_type, country/location, eligibility, last_verified_at, published; `internships` + `/internships` pages; `data/employers.ts` |
| Application Tracker | `/applications` (`ApplicationTracker.tsx`), `useApplications`, `scholarship_applications`; `opportunity_pipeline` table (user_id, item_kind, item_ref, stage, deadline_date) is unused in UI; MCP tools list/track applications |
| Career Path Explorer | `/careers`, `/careers/$slug`, `/career-path`, `DreamJobOpportunities`, `CareerPathway`, `data/careerPaths.ts`, `programme_careers`, `occupation_salaries` |
| Profile / My Path | `/my-path` (MyPath, PathOS, PathIntelligence, OpportunityGraph, WorldClassPathLayer), `life_path_items`, `profiles`, `wassce_results`, `match_preferences`, `saved_items`, `/dashboard` |

Conclusion: no new top-level concept needs a new table except one optional column set (below). All five features are wiring and UI on existing data.

## Increments (each shippable and testable alone)

### 1. AI Advisor entry point
- Add a visible "Ask an advisor" entry in the Plan nav group, on Dashboard and on My Path, opening the existing `AskPanel` (no new chat backend).
- Pass page context (current programme/career/opportunity) through `askContext.ts` so answers are grounded in what the student is viewing.
- Keep existing no-"AI"-branding rule in copy.

### 2. Opportunity Feed
- New route `/opportunities` (public, SSR, own head()) listing rows from `opportunities` where `published = true and is_active = true`.
- Filters via URL search params: type, country/location, field, deadline window, verified only.
- Each card shows source name + link, verification badge (reuse `VerificationBadge`), last verified date, deadline with days left. Expired items hidden by default.
- Detail at `/opportunities/$slug` with "Track this" and "Save" (signed-out: inline sign-in prompt, return-to-page).
- No seeded or invented rows. If the table is empty, the feed shows an honest empty state and links to Internships and Scholarships. Populating it goes through the existing `/admin/review` flow with official sources only.

### 3. Application Tracker (unify, don't duplicate)
- Keep `/applications` and `scholarship_applications` as-is.
- Add a second tab "Jobs, internships & programmes" backed by the existing `opportunity_pipeline` table, using the same stage UI and status pattern.
- "Track this" buttons on opportunity, internship and programme pages write to `opportunity_pipeline` (item_kind + item_ref).
- Dashboard "upcoming deadlines" merges both sources.

### 4. Career Path Explorer
- Upgrade `/careers/$slug` into the explorer view: stages (school -> programme -> internships -> entry role -> senior), reusing `careerPaths.ts`, `programme_careers`, `occupation_salaries`, and `DreamJobOpportunities`.
- Add "Related opportunities" from `opportunities` filtered by fields/skills.
- "Add to My Path" writes stages into `life_path_items`.

### 5. Richer Student Profile / My Path
- Profile completeness panel on My Path (profile, WASSCE results, preferences, target career) linking to the existing edit screens.
- Show tracked applications, saved items and upcoming deadlines as a compact summary on My Path (read-only, reusing hooks).
- Optional profile fields (see migration) editable in Preferences.

## Database changes (additive only)

One migration, only if confirmed missing at build time:
- `opportunities`: add `verification_status text default 'unverified'` (verified / unverified / expired / needs_review), backfilled from `verified`. Keep `verified` for existing readers.
- `profiles`: add nullable `bio`, `skills text[] default '{}'`, `languages text[] default '{}'`, `links jsonb default '[]'`.
- Indexes: `opportunities(published, is_active, deadline_date)`, `opportunity_pipeline(user_id, deadline_date)`.

RLS: no policy loosened. Before building, verify by query that `opportunity_pipeline` and `life_path_items` policies are scoped to `auth.uid() = user_id` for all commands, and that `opportunities` public SELECT is limited to `published = true`; if either is broader, tighten it. Any new user-owned table (none planned) would get GRANTs + RLS + `auth.uid()` policies in the same migration.

## Verification per increment
- Check build log and typecheck after each increment.
- Playwright: signed-out browse of `/opportunities` and `/careers/$slug`; signed-in (minted session) track an opportunity, change stage, see it on Dashboard and My Path, open the advisor from each entry point.
- Confirm all existing routes still return 200 and existing nav links still work.
- Each new public route gets unique head() metadata.

## Assumptions to correct if wrong
- "CV functionality" and "career marketplace" refer to existing career/employer pages; they are not modified.
- Opportunity data will be added by you or through admin review; I will not insert listings.
- Changes are made in this project; you sync to GitHub `main` and Vercel deploys as before.
