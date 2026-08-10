# GhanaPath: Student Accounts, Dashboard & Matching

Turn GhanaPath from a one-visit browsing site into a place students come back to: personal accounts, a saved-everything dashboard, a scholarship matcher, and side-by-side comparisons. Parent logins are designed for now and built in a second phase.

## Phase 1 — Accounts

- Sign up / sign in with email + password and Google.
- Student profile: name, school, WASSCE results (subject + grade), target career, region, interests.
- A short onboarding flow after first sign-up so the dashboard is useful immediately.
- Everything a student saves is private to them.

## Phase 2 — Student dashboard

A single `/dashboard` page with cards:

- Profile summary: WASSCE aggregate, target career.
- Matched programmes (from results + career).
- Saved universities, saved scholarships, saved careers.
- Upcoming application deadlines, sorted, with "days left".
- Application checklist: per-university tasks the student can tick off.
- Recommendations + suggested next steps.

Save buttons ("heart" / "Save") get added to the existing university, scholarship and career sections. Signed-out users are prompted to sign in when they tap save.

## Phase 3 — Scholarship matcher

A short form (level of study, field, region, financial need, gender, grades) scores each scholarship in the existing dataset and returns ranked matches with a "why you match" explanation and eligibility gaps. Matches can be saved to the dashboard and deadlines flow into the dashboard countdown.

## Phase 4 — Compare tool

- Compare up to 3 universities side by side: location, type, fees range, cut-off points, notable programmes, campus life.
- Compare programmes: duration, requirements, typical careers, which universities offer it.
- Add-to-compare buttons in the directory; comparison is shareable and savable.

## Phase 5 — Parent accounts

- A parent signs up and invites their child by email, or the student generates an invite code.
- Once linked, parents get a read-only view of the student's dashboard: deadlines, checklist progress, saved schools, estimated costs.
- Students control the link and can revoke it at any time.

This phase ships after you send the extra details you mentioned.

## Technical details

- Backend: Lovable Cloud (already enabled) for auth and database.
- Tables: `profiles`, `wassce_results`, `saved_items` (polymorphic: university / scholarship / career / programme), `application_checklist`, `deadlines`, `parent_links`. Row-level security so each student only reads and writes their own rows; parents read a linked student's rows only through an approved link.
- Roles live in a separate `user_roles` table (`student`, `parent`) — never on the profile — checked through a security-definer function.
- Routes: `/auth`, `/onboarding`, `/dashboard`, `/compare`, `/matcher`, plus the existing landing page.
- Matching logic runs client-side against `src/data/scholarships.ts` and `src/data/universities.ts`; university data may need extra fields (cut-off points, fee ranges) to power comparisons.
- Saves are optimistic with React Query caching.

## Suggested order

Phases 1 and 2 first (accounts + dashboard) — that is the retention win. Then 3, then 4. Phase 5 waits for your details.
