import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_scholarship_applications",
  title: "List scholarship applications",
  description:
    "List the signed-in student's tracked scholarship applications with status, deadline and notes.",
  inputSchema: {
    status: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe("Optional status filter, e.g. interested, preparing, submitted, interview, awarded, rejected."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("scholarship_applications")
      .select("id, scholarship_name, provider, status, deadline, link, notes, submitted_at")
      .eq("user_id", ctx.getUserId())
      .order("deadline", { ascending: true, nullsFirst: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { applications: data ?? [] },
    };
  },
});
