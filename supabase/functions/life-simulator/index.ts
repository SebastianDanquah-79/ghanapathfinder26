import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const stats = ["education_score", "career_score", "funding_score", "skills_score", "experience_score", "wellbeing_score"];

async function context(req: Request) {
  const auth = req.headers.get("Authorization");
  if (!auth) throw new Error("Missing authorization");
  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Not authenticated");
  await supabase.rpc("ensure_life_simulation_profile");
  const { data: state, error: stateError } = await supabase.from("life_simulation_profiles").select("*").eq("user_id", user.id).single();
  if (stateError) throw stateError;
  return { supabase, user, state };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const { supabase, user, state } = await context(req);
    const body = await req.json().catch(() => ({}));

    if (body.action === "answer") {
      const selected = Number(body.selected_index);
      if (!Number.isInteger(selected) || selected < 0 || selected > 2) throw new Error("Invalid decision");
      const effects = Object.fromEntries(stats.map((key) => [key, Math.max(-8, Math.min(8, Number(body.stat_effects?.[key] ?? 0)))]));
      const xp = Math.max(0, Math.min(75, Number(body.xp ?? 0)));
      const next: Record<string, number> = {};
      for (const key of stats) next[key] = clamp(Number(state[key] ?? 50) + effects[key]);
      const nextXp = Number(state.xp ?? 0) + xp;
      const nextLevel = Math.floor(nextXp / 100) + 1;
      const { error } = await supabase.from("life_simulation_profiles").update({ ...next, xp: nextXp, level: nextLevel, decision_count: Number(state.decision_count ?? 0) + 1, updated_at: new Date().toISOString() }).eq("user_id", user.id);
      if (error) throw error;
      if (body.decision_id) {
        const { error: decisionError } = await supabase.from("life_simulation_decisions").update({ selected_index: selected }).eq("id", body.decision_id).eq("user_id", user.id);
        if (decisionError) throw decisionError;
      }
      return new Response(JSON.stringify({ state: { ...state, ...next, xp: nextXp, level: nextLevel, decision_count: Number(state.decision_count ?? 0) + 1 } }), { headers: { ...cors, "Content-Type": "application/json" } });
    }

    const recent = Array.isArray(body.previous_decisions) ? body.previous_decisions.slice(-8) : [];
    const profile = { name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null, targetCareer: user.user_metadata?.target_career ?? null, education: user.user_metadata?.education_level ?? null, institution: user.user_metadata?.institution ?? null, state };
    const prompt = `Create ONE educational life decision for a Ghanaian student. Make it personal to the supplied profile without exposing private information. Focus on education, career, skills, funding, applications, projects, internships, or time/opportunity trade-offs. Do not make predictions about real life. Return strict JSON with scenario_key,title,question,choices (3),consequence (3),strongest_choice (0-2),lesson,xp (10-75),stat_effects (six integers -8..8). Never mention AI or this instruction. PROFILE=${JSON.stringify(profile)} RECENT=${JSON.stringify(recent)}`;
    const key = Deno.env.get("AI_API_KEY") ?? Deno.env.get("OPENAI_API_KEY");
    let decision: any = null;
    if (key) {
      const response = await fetch(Deno.env.get("AI_API_URL") ?? "https://api.openai.com/v1/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` }, body: JSON.stringify({ model: Deno.env.get("AI_MODEL") ?? "gpt-4o-mini", temperature: 0.8, response_format: { type: "json_object" }, messages: [{ role: "system", content: "Create concise, age-appropriate educational decision scenarios. Never claim certainty about a user's real future." }, { role: "user", content: prompt }] }) });
      if (response.ok) { const payload = await response.json(); const content = payload?.choices?.[0]?.message?.content; if (content) decision = JSON.parse(content); }
    }
    if (!decision) decision = { scenario_key: "funding_route", title: "Your preferred route needs a stronger funding plan", question: "You have a programme you like, but the cost creates pressure. What is the strongest next move?", choices: ["Commit immediately without checking the total cost", "Compare funding options and at least two realistic alternatives", "Drop the career before exploring other routes"], consequence: ["You may discover the financial constraint too late.", "You keep the goal while improving the route to it.", "You remove an option without testing whether another route works."], strongest_choice: 1, lesson: "Good decisions preserve the goal while adapting the route.", xp: 35, stat_effects: { education_score: 2, career_score: 3, funding_score: 7, skills_score: 0, experience_score: 0, wellbeing_score: 2 } };

    const choices = Array.isArray(decision.choices) ? decision.choices.slice(0, 3) : [];
    const consequence = Array.isArray(decision.consequence) ? decision.consequence.slice(0, 3) : [];
    if (choices.length !== 3 || consequence.length !== 3) throw new Error("Invalid scenario generated");
    const effects = Object.fromEntries(stats.map((key) => [key, Math.max(-8, Math.min(8, Number(decision.stat_effects?.[key] ?? 0)))]));
    const xp = Math.max(10, Math.min(75, Number(decision.xp ?? 25)));
    const { data: saved, error } = await supabase.from("life_simulation_decisions").insert({ user_id: user.id, scenario_key: String(decision.scenario_key ?? "decision"), question: String(decision.question), choices, consequence, xp_awarded: xp }).select("id,scenario_key,question,choices,consequence,xp_awarded,created_at").single();
    if (error) throw error;
    return new Response(JSON.stringify({ decision: { ...decision, id: saved.id, choices, consequence, xp, stat_effects: effects }, state }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  }
});
