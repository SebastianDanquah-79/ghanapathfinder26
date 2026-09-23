/**
 * Shared builder for per-route head metadata (title, description, canonical,
 * Open Graph and Twitter tags) so every route self-references its own URL.
 */
export const SITE_URL = "https://ghanapathfinder.com";

export interface PageHeadOptions {
  title: string;
  description: string;
  /** Route path beginning with "/" (no trailing slash except the homepage). */
  path: string;
  ogTitle?: string;
  ogDescription?: string;
  /** Keep private/app-only pages out of search results. */
  noindex?: boolean;
}

export function pageHead({
  title,
  description,
  path,
  ogTitle,
  ogDescription,
  noindex = false,
}: PageHeadOptions) {
  const url = `${SITE_URL}${path === "/" ? "" : path}`;
  const meta: Array<Record<string, string>> = [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:title", content: ogTitle ?? title },
    { property: "og:description", content: ogDescription ?? description },
    { property: "og:url", content: url },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: ogTitle ?? title },
    { name: "twitter:description", content: ogDescription ?? description },
  ];
  if (noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  return {
    meta,
    links: noindex ? [] : [{ rel: "canonical", href: url || `${SITE_URL}/` }],
  };
}
