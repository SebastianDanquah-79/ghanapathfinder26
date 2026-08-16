# Fix indexing instead of changing the domain

## Why not change the domain

Google's own record for `https://ghanapathfinder.com` currently says **"URL is unknown to Google"**, and Search Console reports no performance rows for 17 Jul – 13 Aug 2026. That means Google has not crawled and indexed the homepage yet — it is not a signal that the domain name is hurting rankings.

A domain with no index presence has nothing to gain from a rename: a new domain would start from exactly the same "unknown to Google" state, while you would lose the verified Search Console property and have to redirect and re-verify everything. `ghanapathfinder.com` is also an exact brand match, which is the ideal case for a name.

Recommendation: keep the domain and fix discovery.

## What to do instead

1. **Confirm the sitemap is submitted and processing**
   Read the sitemap status for the verified property in Search Console. If it was never submitted or is erroring, submit `https://ghanapathfinder.com/sitemap.xml` once and record what Google reports back.

2. **Check the sitemap is actually current and reachable**
   Verify the generated sitemap is being served on the published domain, that every URL in it uses `https://ghanapathfinder.com`, and that the URL count matches the live content (universities, programmes, careers, scholarships).

3. **Verify robots.txt is not blocking the crawl**
   Confirm `public/robots.txt` allows crawling and points at the sitemap on the live domain.

4. **Confirm the published site serves real HTML**
   Fetch the live homepage and two deep pages (a university and a programme) and confirm the server-rendered HTML contains the real content and the correct canonical tag — not a loading placeholder.

5. **Re-check indexing status**
   Read Google's stored inspection result for the homepage and one deep page after the above, so you have a baseline to compare against.

## Notes

- Indexing a new site typically takes days to a few weeks after the sitemap is accepted; there is no way to force it faster from here.
- This tool cannot request indexing or run a live test. If a specific URL needs a manual push, that has to be done from the Search Console interface directly.

## Technical scope

Read-only diagnosis plus, at most, small corrections to `public/robots.txt`, the sitemap generation in `scripts/generate-sitemap.ts`, and canonical tags. One sitemap submission if the status shows it is missing. No domain changes, no schema changes, no redesign.
