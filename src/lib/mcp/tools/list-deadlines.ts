import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_deadlines",
  title: "List upcoming deadlines",
  description:
    "List the signed-in student's upcoming GhanaPath deadlines and their application checklist tasks.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const [deadlines, checklist] = await Promise.all([
      supabase
        .from("deadlines")
        .select("id, title, category, due_date, notes")
        .eq("user_id", userId)
        .order("due_date", { ascending: true }),
      supabase
        .from("application_checklist")
        .select("id, task, target, due_date, done")
        .eq("user_id", userId)
        .order("due_date", { ascending: true, nullsFirst: false }),
    ]);
    const error = deadlines.error ?? checklist.error;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const payload = { deadlines: deadlines.data ?? [], checklist: checklist.data ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
