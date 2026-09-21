# Safe English cleanup and confirmed bug fixes

## Confirmed checklist
- [ ] Remove the existing automatic page translation behavior so product copy remains English.
- [ ] Remove the onboarding language selector and the two French-only conditional placeholders.
- [ ] Preserve proper nouns, institution/programme names, country names, stored content, URLs, routes, identifiers, and API/database values.
- [ ] Fix current TypeScript failures in onboarding and the typed backend RPC wrapper using narrow, contract-preserving guards/casts.
- [ ] Fix malformed English punctuation already confirmed in password-reset and saved-item success messages.
- [ ] Treat the generated MCP file as read-only; fix its source files only if the source itself contains the confirmed errors.
- [ ] Inspect all major routes and user states for additional confirmed non-English strings or broken references before editing.

## Implementation
1. Disable multilingual presentation at the root and make onboarding English-only without changing layout or navigation.
2. Apply only exact string corrections and minimal null/type guards needed for confirmed failures.
3. If MCP source errors reproduce, correct the authored source and let the generated file remain untouched.
4. Do not change tables, migrations, policies, auth configuration, stored data, API response shapes, environment variables, or production records.

## Verification
- Run the existing type check/build, lint, and focused tests.
- Exercise public and signed-out flows across home, auth, onboarding redirect, directories, recommendations, scholarships, careers, internships, community, chat, and navigation.
- Exercise authenticated flows only with an approved existing test session; otherwise report them as unverified rather than guessing.
- Check desktop and mobile screenshots, browser console/runtime failures, loading/empty/error/success states, and the final changed-file list.
- Review the final diff to confirm no backend contract, schema, data, or visual-identity changes.

## Reporting
Provide the exact strings changed, confirmed bugs fixed, changed files, backend-preservation confirmation, verification results, and anything deliberately left unchanged for safety.
