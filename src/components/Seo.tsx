import { Helmet } from "react-helmet-async";

const SITE_URL = "https://ghanapathfinder.com";
const DEFAULT_IMAGE = `${SITE_URL}/app-icon-512.png`;

interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  /** Optional JSON-LD blocks rendered into the head. */
  jsonLd?: Record<string, unknown>[];
  /**
   * Render only the JSON-LD blocks. Use on routes whose title, description,
   * canonical and Open Graph tags already come from the route `head()` option,
   * so those tags are not emitted twice.
   */
  jsonLdOnly?: boolean;
}

/** Per-route title, description, canonical and Open Graph tags. */
const Seo = ({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  jsonLd = [],
  jsonLdOnly = false,
}: SeoProps) => {
  const url = `${SITE_URL}${path}`;
  if (jsonLdOnly) {
    return (
      <Helmet>
        {jsonLd.map((block, i) => (
          <script key={i} type="application/ld+json">
            {JSON.stringify(block)}
          </script>
        ))}
      </Helmet>
    );
  }
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:site_name" content="GhanaPathFinder" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd.map((block, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(block)}
        </script>
      ))}
    </Helmet>
  );
};

export const SITE_ORIGIN = SITE_URL;

export const breadcrumbLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: `${SITE_URL}${item.path}`,
  })),
});

export default Seo;
