import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { checkApiRateLimit, readJsonBody, rateLimitResponse } from "@/lib/api-rate-limit";
import { createOpenAIResponsesModel } from "@/lib/openai.server";

type Company = {
  id: string;
  name: string;
  sector: string | null;
  location: string | null;
  region: string | null;
  description: string | null;
  websiteUrl: string | null;
  careersUrl: string | null;
  verificationStatus: string | null;
};

type Provider = {
  name: string;
  sector: string | null;
  programmeSummary: string | null;
  websiteUrl: string | null;
  applicationUrl: string | null;
  needsReview: boolean;
};

type Internship = {
  id: string;
  title: string;
  companyName: string | null;
  description: string | null;
  fields: string[];
  skills: string[];
  location: string | null;
  applicationUrl: string | null;
  deadline: string | null;
};

type RequestBody = {
  career?: unknown;
  programme?: unknown;
  companies?: unknown;
  providers?: unknown;
  internships?: unknown;
};

const safe = (value: unknown, max = 400) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

const parseObject = (value: string): Record<string, unknown> => {
  const cleaned = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const parsed = JSON.parse(cleaned);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The recommendation response was not a JSON object.");
  }
  return parsed as Record<string, unknown>;
};

export const Route = createFileRoute("/api/company-recommendations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rate = checkApiRateLimit(request, "company-recommendations", 8, 60_000);
        if (!rate.allowed) return rateLimitResponse(rate.retryAfterSeconds);

        let body: RequestBody;
        try {
          body = (await readJsonBody(request, 40 * 1024)) as RequestBody;
        } catch (error) {
          const tooLarge = error instanceof Error && error.message === "BODY_TOO_LARGE";
          return new Response(tooLarge ? "Recommendation data is too large." : "A valid JSON request is required.", {
            status: tooLarge ? 413 : 400,
          });
        }

        const career = safe(body?.career, 120);
        const programme = safe(body?.programme, 180);
        if (!career && !programme) {
          return new Response("A career or programme is required.", { status: 400 });
        }
        if (!Array.isArray(body?.companies) || body.companies.length > 40) {
          return new Response("Send no more than 40 company directory records.", { status: 400 });
        }
        if (!Array.isArray(body?.providers) || body.providers.length > 20 ||
            !Array.isArray(body?.internships) || body.internships.length > 30) {
          return new Response("The internship/provider data is invalid.", { status: 400 });
        }

        const companies: Company[] = body.companies
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item) => ({
            id: safe(item.id, 80),
            name: safe(item.name, 140),
            sector: safe(item.sector, 100) || null,
            location: safe(item.location, 100) || null,
            region: safe(item.region, 100) || null,
            description: safe(item.description, 360) || null,
            websiteUrl: safe(item.websiteUrl, 500) || null,
            careersUrl: safe(item.careersUrl, 500) || null,
            verificationStatus: safe(item.verificationStatus, 80) || null,
          }))
          .filter((item) => item.id && item.name && item.careersUrl);

        const providers: Provider[] = body.providers
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item) => ({
            name: safe(item.name, 140),
            sector: safe(item.sector, 120) || null,
            programmeSummary: safe(item.programmeSummary, 420) || null,
            websiteUrl: safe(item.websiteUrl, 500) || null,
            applicationUrl: safe(item.applicationUrl, 500) || null,
            needsReview: item.needsReview !== false,
          }))
          .filter((item) => item.name);

        const internships: Internship[] = body.internships
          .filter((item): item is Record<string, unknown> => !!item && typeof item === "object")
          .map((item) => ({
            id: safe(item.id, 80),
            title: safe(item.title, 180),
            companyName: safe(item.companyName, 140) || null,
            description: safe(item.description, 420) || null,
            fields: Array.isArray(item.fields) ? item.fields.slice(0, 8).map((x) => safe(x, 80)) : [],
            skills: Array.isArray(item.skills) ? item.skills.slice(0, 8).map((x) => safe(x, 80)) : [],
            location: safe(item.location, 120) || null,
            applicationUrl: safe(item.applicationUrl, 500) || null,
            deadline: safe(item.deadline, 80) || null,
          }))
          .filter((item) => item.id && item.title);

        if (companies.length === 0 && providers.length === 0 && internships.length === 0) {
          return Response.json({
            companies: [],
            providers: [],
            internships: [],
            note: "No company or internship directory records match this profile yet.",
          });
        }

        try {
          const result = await generateText({
            model: createOpenAIResponsesModel(),
            system: `You are GhanaPathFinder's company and early-career opportunity adviser. Match a learner's programme and career goal to the supplied company directory and internship records. Select only supplied IDs and names. Never claim a company is hiring unless a current internship/job record supplied here confirms it. Career-page links are routes to investigate, not proof of a vacancy. Internship providers marked needsReview are unverified directory leads, not confirmed placements. Be practical and Ghana/Africa-aware. Return valid JSON only.`,
            prompt: `CAREER GOAL: ${career || "Not specified"}
PROGRAMME: ${programme || "Not specified"}

COMPANIES (recommend only from this list):
${JSON.stringify(companies)}

INTERNSHIP PROVIDERS (some entries need verification):
${JSON.stringify(providers)}

CURRENT VERIFIED INTERNSHIP LISTINGS:
${JSON.stringify(internships)}

Return JSON:
{
  "companies": [{"id":"exact supplied company id","why":"why this sector/company is relevant to the programme or career","preparation":["one or two practical skills or portfolio actions"]}],
  "providers": [{"name":"exact supplied provider name","why":"why it may be worth investigating"}],
  "internship_note":"Explain whether any current verified internship listings are included. Never turn a provider directory entry into a current vacancy."
}
Return at most five companies, four providers and three preparation actions per company. Do not invent vacancy titles, deadlines, salaries or requirements.`,
            maxOutputTokens: 1400,
          });

          const payload = parseObject(result.text);
          const companyById = new Map(companies.map((item) => [item.id, item]));
          const providerByName = new Map(providers.map((item) => [item.name, item]));
          const rankedCompanies = Array.isArray(payload.companies)
            ? payload.companies.slice(0, 5).flatMap((item) => {
                if (!item || typeof item !== "object") return [];
                const row = item as Record<string, unknown>;
                const company = companyById.get(safe(row.id, 80));
                if (!company) return [];
                return [{
                  ...company,
                  why: safe(row.why, 500),
                  preparation: Array.isArray(row.preparation)
                    ? row.preparation.slice(0, 3).map((x) => safe(x, 180)).filter(Boolean)
                    : [],
                }];
              })
            : [];
          const rankedProviders = Array.isArray(payload.providers)
            ? payload.providers.slice(0, 4).flatMap((item) => {
                if (!item || typeof item !== "object") return [];
                const row = item as Record<string, unknown>;
                const provider = providerByName.get(safe(row.name, 140));
                if (!provider) return [];
                return [{ ...provider, why: safe(row.why, 420) }];
              })
            : [];

          return Response.json({
            companies: rankedCompanies,
            providers: rankedProviders,
            internships,
            note: safe(payload.internship_note, 600),
          }, { headers: { "Cache-Control": "no-store" } });
        } catch (error) {
          console.error("OpenAI company recommendations failed", error);
          return new Response("Company and internship recommendations are temporarily unavailable.", { status: 502 });
        }
      },
    },
  },
});
