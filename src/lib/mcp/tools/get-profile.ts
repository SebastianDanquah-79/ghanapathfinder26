import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_profile",
  title: "Get my GhanaPath profile",
  description:
    "Fetch the signed-in student's GhanaPath profile, WASSCE results and match preferences.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const [profile, wassce, prefs] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("wassce_results").select("subject, grade").eq("user_id", userId),
      supabase.from("match_preferences").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    const error = profile.error ?? wassce.error ?? prefs.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const payload = {
      profile: profile.data,
      wassceResults: wassce.data ?? [],
      matchPreferences: prefs.data,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
