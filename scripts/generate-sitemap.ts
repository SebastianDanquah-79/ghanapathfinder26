// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { mockCareerData, careerSlug } from "../src/data/careers";
import { scholarships, scholarshipSlug } from "../src/data/scholarships";

const BASE_URL = "https://ghanapathfinder.com";

const SUPABASE_URL = "https://hodvuidwrhlaildtcpww.supabase.co";
const SUPABASE_KEY = "sb_publishable_wqp_iN83ecIrDOA3coovlA_mPt57xlX";

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/search", changefreq: "weekly", priority: "0.9" },
  { path: "/programmes", changefreq: "weekly", priority: "0.9" },
  { path: "/scholarships", changefreq: "weekly", priority: "0.9" },
  { path: "/admission-match", changefreq: "monthly", priority: "0.8" },
  { path: "/matcher", changefreq: "monthly", priority: "0.6" },
  { path: "/compare", changefreq: "monthly", priority: "0.6" },
  { path: "/compare-scholarships", changefreq: "monthly", priority: "0.6" },
  { path: "/careers", changefreq: "monthly", priority: "0.8" },
  { path: "/inspiration", changefreq: "monthly", priority: "0.6" },
  { path: "/auth", changefreq: "yearly", priority: "0.3" },
];

async function fetchRows(table: string): Promise<{ slug: string }[]> {
  const out: { slug: string }[] = [];
  const pageSize = 1000;
  for (let from = 0; ; from += pageSize) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?select=slug&order=slug.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          Range: `${from}-${from + pageSize - 1}`,
        },
      },
    );
    if (!res.ok) {
      console.warn(`sitemap: could not read ${table} (${res.status})`);
      return out;
    }
    const rows = (await res.json()) as { slug: string }[];
    out.push(...rows);
    if (rows.length < pageSize) return out;
  }
}

function generateSitemap(entries: SitemapEntry[]) {
  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const [universities, programmes] = await Promise.all([
  fetchRows("universities"),
  fetchRows("programmes"),
]);

const entries: SitemapEntry[] = [
  ...staticEntries,
  ...Object.values(mockCareerData).map((c) => ({
    path: `/careers/${careerSlug(c.major)}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
  ...scholarships.map((s) => ({
    path: `/scholarships/${scholarshipSlug(s.name)}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
  ...universities.map((u) => ({
    path: `/university/${u.slug}`,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
  ...programmes.map((p) => ({
    path: `/programme/${p.slug}`,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
];

writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
