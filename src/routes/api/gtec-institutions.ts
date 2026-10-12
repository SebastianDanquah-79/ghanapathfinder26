import { createFileRoute } from "@tanstack/react-router";

const GTEC_CATEGORIES = new Set([
  "Chartered Private Tertiary Institution",
  "Distance Learning Institution",
  "Private College of Education",
  "Private Nurses/Health Training College",
  "Public Nurses/Health Training College",
  "Private Tertiary Institutions Offering HND/Degree Programmes",
  "Public Degree Awarding and Professional Institution",
  "Registered Foreign Institution",
  "Tutorial College",
  "Private University",
  "Public Technical University",
  "Traditional University",
  "Public College of Education",
  "College of Agriculture",
  "Private Polytechnic",
  "Regionally-Owned (West Africa) Tertiary Institution",
]);

type GtecInstitution = {
  name: string;
  location: string | null;
  status: string;
  start_date: string | null;
  end_date: string | null;
  programme_url: string | null;
};

const decodeHtml = (value: string) =>
  value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;|&#038;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0*39;|&apos;/gi, "'")
    .replace(/&ndash;|&#8211;/gi, "–")
    .replace(/&mdash;|&#8212;/gi, "—")
    .replace(/&#(\d+);/g, (_, code: string) => {
      const point = Number(code);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : " ";
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
      const point = Number.parseInt(code, 16);
      return Number.isFinite(point) && point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : " ";
    })
    .replace(/\s+/g, " ")
    .trim();

export const Route = createFileRoute("/api/gtec-institutions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const category = params.get("category") ?? "";
        const page = Number(params.get("page") ?? "1");

        if (!GTEC_CATEGORIES.has(category)) {
          return Response.json(
            { institutions: [], error: "Unsupported GTEC category." },
            { status: 400 },
          );
        }
        if (!Number.isInteger(page) || page < 1 || page > 30) {
          return Response.json(
            { institutions: [], error: "Page must be an integer from 1 to 30." },
            { status: 400 },
          );
        }

        const source = new URL("https://gtec.edu.gh/institutions/");
        source.searchParams.set("category", category);
        if (page > 1) source.searchParams.set("pg", String(page));

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
          const response = await fetch(source.toString(), {
            signal: controller.signal,
            headers: {
              Accept: "text/html,application/xhtml+xml",
              "User-Agent": "GhanaPathFinder/1.0 official-registry-reader",
            },
          });
          if (!response.ok) {
            return Response.json(
              {
                institutions: [],
                category,
                page,
                source_url: source.toString(),
                error: `GTEC returned HTTP ${response.status}.`,
              },
              { status: 502 },
            );
          }

          const html = (await response.text()).slice(0, 2_500_000);
          const institutions: GtecInstitution[] = [];
          for (const rowMatch of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
            const row = rowMatch[1] ?? "";
            const cells = Array.from(
              row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi),
            ).map((match) => decodeHtml(match[1] ?? ""));

            const statusIndex = cells.findIndex((cell) =>
              /^(active|expired|inactive|suspended|pending|not active)$/i.test(cell),
            );
            if (statusIndex < 2) continue;

            const name = cells[statusIndex - 2] ?? "";
            const location = cells[statusIndex - 1] ?? "";
            const status = cells[statusIndex] ?? "";
            const startDate = cells[statusIndex + 1] ?? "";
            const endDate = cells[statusIndex + 2] ?? "";

            if (!name || /^(name|institution)$/i.test(name)) continue;

            const programmeHref =
              row.match(/href=["']([^"']*\/programmes\/\?institutionId=\d+[^"']*)["']/i)?.[1] ??
              null;
            let programmeUrl: string | null = null;
            if (programmeHref) {
              try {
                programmeUrl = new URL(programmeHref, source).toString();
              } catch {
                programmeUrl = null;
              }
            }

            institutions.push({
              name,
              location: location || null,
              status,
              start_date: startDate || null,
              end_date: endDate || null,
              programme_url: programmeUrl,
            });
          }

          return Response.json(
            {
              category,
              page,
              source_url: source.toString(),
              observed_at: new Date().toISOString(),
              count: institutions.length,
              institutions,
            },
            {
              headers: {
                "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
              },
            },
          );
        } catch {
          return Response.json(
            {
              institutions: [],
              category,
              page,
              source_url: source.toString(),
              error: "Unable to retrieve the GTEC registry right now.",
            },
            { status: 502 },
          );
        } finally {
          clearTimeout(timeout);
        }
      },
    },
  },
});
