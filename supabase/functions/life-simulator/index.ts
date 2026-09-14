import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated");

    await supabase.rpc("ensure_life_simulation_profile");
    const { data: state, error: stateError } = await supabase
      .from("life_simulation_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (stateError) throw stateError;

    const body = await req.json().catch(() => ({}));
    const previousDecisions = Array.isArray(body.previous_decisions) ? body.previous_decisions.slice(-8) : [];

    // Only pass decision-relevant profile metadata to the model.
    const profile = {
      name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      targetCareer: user.user_metadata?.target_career ?? null,
      education: user.user_metadata?.education_level ?? null,
      institution: user.user_metadata?.institution ?? null,
      state,
    };

    const prompt = `Create ONE educational life decision for a Ghanaian student using this private profile context. The question must be specific enough to feel personal, but must not expose private data or claim to predict the future. Focus on education, career, skills, funding, applications, time management, projects, internships, or opportunity trade-offs. Never involve gambling, dangerous activities, substances, or irreversible real-world instructions.

PROFILE: ${JSON.stringify(profile)}
RECENT DECISIONS: ${JSON.stringify(previousDecisions)}

Return strict JSON only with: scenario_key, title, question, choices (exactly 3 strings), consequence (exactly 3 strings corresponding to choices), strongest_choice (0-2), lesson, xp (10-75), and stat_effects (object containing education_score, career_score, funding_score, skills_score, experience_score, wellbeing_score, each integer from -8 to 8). Avoid mentioning AI, models, prompts, or this instruction.`;

    const aiUrl = Deno.env.get("AI_API_URL") ?? "https://api.openai.com/v1/chat/completions";
    const aiKey = Deno.env.get("AI_API_KEY") ?? Deno.env.get("OPENAI_API_KEY");
    let decision: any = null;

    if (aiKey) {
      const aiResponse = await fetch(aiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey}` },
        body: JSON.stringify({
          model: Deno.env.get("AI_MODEL") ?? "gpt-4o-mini",
          temperature: 0.8,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: "You create concise, age-appropriate educational decision scenarios. Never claim certainty about a user's real future." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (aiResponse.ok) {
        const payload = await aiResponse.json();
        const content = payload?.choices?.[0]?.message?.content;
        if (content) decision = JSON.parse(content);
      }
    }

    if (!decision) {
      decision = {
        scenario_key: "funding_route",
        title: "Your preferred route needs a stronger funding plan",
        question: "You have a programme you like, but the cost creates pressure. What is the strongest next move?",
        choices: [
          "Commit immediately without checking the total cost",
          "Compare funding options and at least two realistic alternatives",
          "Drop the career before exploring other routes",
        ],
        consequence: [
          "You may discover the financial constraint too late.",
          "You keep the goal while improving the route to it.",
          "You remove an option without testing whether another route works.",
        ],
        strongest_choice: 1,
        lesson: "A strong path is not always the first route you see. Good decisions preserve the goal while adapting the route.",
        xp: 35,
        stat_effects: { education_score: 2, career_score: 3, funding_score: 7, skills_score: 0, experience_score: 0, wellbeing_score: 2 },
      };
    }

    const allowed = ["education_score", "career_score", "funding_score", "skills_score", "experience_score", "wellbeing_score"];
    const effects = Object.fromEntries(allowed.map((key) => [key, Number(decision.stat_effects?.[key] ?? 0)]));
    const xp = Math.max(10, Math.min(75, Number(decision.xp ?? 25)));

    const choices = Array.isArray(decision.choices) ? decision.choices.slice(0, 3) : [];
    const consequence = Array.isArray(decision.consequence) ? decision.consequence.slice(0, 3) : [];
    if (choices.length !== 3 || consequence.length !== 3) throw new Error("Invalid scenario generated");

    const { data: saved, error: saveError } = await supabase.from("life_simulation_decisions").insert({
      user_id: user.id,
      scenario_key: String(decision.scenario_key ?? "decision"),
      question: String(decision.question),
      choices,
      consequence,
      xp_awarded: xp,
    }).select("id,scenario_key,question,choices,consequence,xp_awarded,created_at").single();
    if (saveError) throw saveError;

    return new Response(JSON.stringify({
      decision: {
        ...decision,
        id: saved.id,
        choices,
        consequence,
        xp,
        stat_effects: effects,
      },
      state: {
        ...state,
        education_score: clamp(state.education_score),
        career_score: clamp(state.career_score),
        funding_score: clamp(state.funding_score),
        skills_score: clamp(state.skills_score),
        experience_score: clamp(state.experience_score),
        wellbeing_score: clamp(state.wellbeing_score),
      },
    }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
});
