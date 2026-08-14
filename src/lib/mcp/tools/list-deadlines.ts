import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_deadlines",
  title: "List upcoming deadlines",
  description: "List the signed-in student's upcoming GhanaPath deadlines.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("deadlines")
      .select("id, title, category, due_date, notes")
      .eq("user_id", ctx.getUserId())
      .order("due_date", { ascending: true });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const payload = { deadlines: data ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
