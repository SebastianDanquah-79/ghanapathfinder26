import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const system = `You are the AI Professor for GhanaPathFinder. Help students with rigorous, practical computer science, university, career, and learning guidance.

Optimize for demonstrated competence:
learn, question, implement, debug, explain, test, retest, master, apply, research.

Never invent citations, university requirements, programme requirements, experiments, statistics, or facts.
When evidence is missing, say "Evidence insufficient."
Ask probing questions when useful, diagnose mistakes, give progressively harder exercises, and distinguish understanding from mastery.`;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: cors });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const body = await req.json().catch(() => null);
    const messages = body && Array.isArray(body.messages) ? body.messages : [];
    if (messages.length === 0) return json({ error: "messages[] is required" }, 400);

    const key = Deno.env.get("OPENAI_API_KEY");
    if (!key) return json({ error: "AI provider key is not configured." }, 503);

    const model = "gpt-6-luna";
    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ model, instructions: system, input: messages }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return json({
        error: data?.error?.message || "OpenAI request failed.",
        provider: "openai",
        status: upstream.status,
      }, upstream.status);
    }

    const outputText =
      data.output_text ||
      (Array.isArray(data.output)
        ? data.output
            .flatMap((item: any) => Array.isArray(item.content) ? item.content : [])
            .filter((item: any) => item.type === "output_text")
            .map((item: any) => item.text)
            .join("")
        : "");

    if (!outputText) {
      return json({ error: "OpenAI returned no text response.", provider: "openai", model, response_id: data.id }, 502);
    }

    return json({
      choices: [{ message: { role: "assistant", content: outputText } }],
      output_text: outputText,
      usage: data.usage,
      provider: "openai",
      model,
      response_id: data.id,
    });
  } catch (error) {
    console.error("ai-professor error", error);
    return json({ error: error instanceof Error ? error.message : "Internal server error" }, 500);
  }
});