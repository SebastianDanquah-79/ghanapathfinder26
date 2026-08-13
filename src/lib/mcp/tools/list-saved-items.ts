import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_saved_items",
  title: "List saved universities and scholarships",
  description:
    "List the signed-in student's saved GhanaPath items (universities, programmes, scholarships, careers).",
  inputSchema: {
    itemType: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe("Optional filter, e.g. 'scholarship' or 'university'."),
    limit: z.number().int().min(1).max(100).default(50).optional(),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ itemType, limit }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("saved_items")
      .select("id, item_type, item_key, title, subtitle, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (itemType) query = query.eq("item_type", itemType);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
