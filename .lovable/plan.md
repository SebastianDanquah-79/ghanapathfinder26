# Verify programmes and institution logos

## Scope
- Apply the existing source-and-review workflow to programmes for the approved Ghanaian institutions, starting with the highest-use universities.
- Replace generic favicon records with official institution logos only when a trustworthy official source can be verified.
- Put uncertain or incomplete records into `/admin/review`; publish only records that match official institutional and accreditation sources.

## Changes
- Enrich programme records with official programme names, qualifications, duration, admission guidance, programme links, source links, verification dates, and review status.
- Resolve official logos from institutional websites or clearly attributable sources, record the logo source, and keep initials as the safe fallback.
- Improve the admin review view where needed so programme sources and logo previews are easy to verify before approval.
- Process the work in reviewable batches to avoid silently marking weak matches as verified.

## Verification
- Confirm approved programmes appear in the programme directory and profile pages with source-backed verification details.
- Confirm approved logos render in institution listings and profiles, with broken or unverified images falling back to initials.
- Check the admin queue, authorization, application build, and representative mobile/desktop pages.
