import { createServerFn } from "@tanstack/react-start";

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

export const scholarshipMatch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown): MatchInput => {
    const value = input as Partial<MatchInput> | null;
    if (!value || typeof value !== "object" || typeof value.profile !== "object" || !Array.isArray(value.scholarships)) {
      throw new Error("Invalid input: expected { profile, scholarships }");
    }
    return { profile: value.profile as Record<string, unknown>, scholarships: value.scholarships };
  })
  .handler(async ({ data }): Promise<ScholarshipMatchResult> => {
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const { profile, scholarships } = data;

    const prompt = `You are a Ghanaian scholarship advisor helping an SHS/tertiary student.

STUDENT PROFILE:
${JSON.stringify(profile, null, 2)}

AVAILABLE SCHOLARSHIPS:
${JSON.stringify(scholarships, null, 2)}

Rank the 6 best-fitting scholarships for this student. Be honest about gaps.
Return ONLY JSON of shape:
{"matches":[{"name":"exact scholarship name","score":0-100,"why":"1-2 sentences, personal and specific","gaps":["short gap"],"nextStep":"one concrete action this week"}],"summary":"2 sentence overall funding strategy"}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a precise scholarship advisor. Reply with json only." },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error(`AI gateway error [${res.status}]: ${details}`);
      throw new Error(`AI request failed [${res.status}]: ${details}`);
    }

    const payload = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = payload.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(content) as ScholarshipMatchResult;
    } catch {
      return { matches: [], summary: content };
    }
  });
