import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createOpenAIResponsesModel } from "@/lib/openai.server";

type MatchInput = {
  profile: Record<string, unknown>;
  scholarships: Array<Record<string, unknown>>;
};

export type ScholarshipMatchResult = {
  matches: Array<{
    name: string;
    score: number;
    why: string;
    gaps: string[];
    nextStep: string;
  }>;
  summary: string;
};

const scholarshipMatchOutputSchema = z.object({
  matches: z.array(z.object({
    name: z.string(),
    score: z.number().min(0).max(100),
    why: z.string(),
    gaps: z.array(z.string()).max(6),
    nextStep: z.string(),
  })).max(6),
  summary: z.string(),
});
export const scholarshipMatch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): MatchInput => {
    const value = input as Partial<MatchInput> | null;
    if (
      !value ||
      typeof value !== "object" ||
      !value.profile ||
      typeof value.profile !== "object" ||
      Array.isArray(value.profile) ||
      !Array.isArray(value.scholarships)
    ) {
      throw new Error("Invalid input: expected { profile, scholarships }");
    }
    if (value.scholarships.length > 100) {
      throw new Error("Too many scholarships to analyse at once.");
    }
    return {
      profile: value.profile as Record<string, unknown>,
      scholarships: value.scholarships as Array<Record<string, unknown>>,
    };
  })
  .handler(async ({ data }): Promise<ScholarshipMatchResult> => {
    const { profile, scholarships } = data;
    if (scholarships.length === 0) {
      return { matches: [], summary: "There are no scholarship listings to compare yet." };
    }

    const prompt = `STUDENT PROFILE:
${JSON.stringify(profile, null, 2)}

AVAILABLE SCHOLARSHIPS:
${JSON.stringify(scholarships, null, 2)}

Rank up to six of the listed scholarships by fit for this student's profile.
Use only scholarship names that appear in the supplied list. Do not invent deadlines,
eligibility rules, providers, fees or scholarship benefits. Be honest about missing
information and eligibility gaps. A score is a prioritisation aid, not a probability
of winning an award.

Return ONLY a JSON object with this shape:
{"matches":[{"name":"exact scholarship name from the list","score":0,"why":"1-2 specific sentences","gaps":["short evidence-based gap"],"nextStep":"one practical action"}],"summary":"two-sentence funding strategy"} `;

    try {
      const result = await generateText({
        model: createOpenAIResponsesModel(),
        output: Output.object({ schema: scholarshipMatchOutputSchema }),
        system: "You are a precise scholarship advisor for GhanaPathFinder. Analyse only the supplied records. Return valid JSON without Markdown fences.",
        prompt,
        maxOutputTokens: 1400,
      });

      const parsed = result.output;
      if (!parsed) throw new Error("Scholarship matching did not return a complete structured result.");
      const allowedNames = new Set(
        scholarships.map((item) => String(item.name ?? "")).filter(Boolean),
      );
      const matches = Array.isArray(parsed.matches)
        ? parsed.matches
            .filter((item) => item && allowedNames.has(String(item.name ?? "")))
            .slice(0, 6)
            .map((item) => ({
              name: String(item.name),
              score: Math.max(0, Math.min(100, Math.round(Number(item.score) || 0))),
              why: String(item.why ?? "").slice(0, 700),
              gaps: Array.isArray(item.gaps) ? item.gaps.map(String).slice(0, 6) : [],
              nextStep: String(item.nextStep ?? "").slice(0, 400),
            }))
        : [];

      return {
        matches,
        summary: String(parsed.summary ?? "Review the eligibility details and official sources for the strongest matches."),
      };
    } catch (error) {
      console.error("OpenAI scholarship matching failed", error);
      throw new Error("Scholarship matching could not be completed. Check the OpenAI API key, model access and billing, then try again.");
    }
  });
