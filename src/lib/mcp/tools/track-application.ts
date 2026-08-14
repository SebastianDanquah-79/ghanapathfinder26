import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

const STATUSES = ["interested", "preparing", "submitted", "interview", "awarded", "rejected"] as const;

export default defineTool({
  name: "track_scholarship_application",
  title: "Add or update a scholarship application",
  description:
    "Add a scholarship to the signed-in student's tracker, or update the status/deadline/notes of an existing one.",
  inputSchema: {
    scholarshipName: z.string().trim().min(1).describe("Scholarship name."),
    status: z.enum(STATUSES).default("interested").optional(),
    provider: z.string().trim().min(1).optional(),
    deadline: z.string().trim().min(1).optional().describe("Deadline as YYYY-MM-DD."),
    link: z.string().trim().url().optional(),
    notes: z.string().trim().max(2000).optional(),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ scholarshipName, status, provider, deadline, link, notes }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = supabaseForUser(ctx);
    const userId = ctx.getUserId();

    const { data: existing, error: findError } = await supabase
      .from("scholarship_applications")
      .select("id")
      .eq("user_id", userId)
      .eq("scholarship_name", scholarshipName)
      .maybeSingle();
    if (findError) return { content: [{ type: "text", text: findError.message }], isError: true };

    const patch: Record<string, unknown> = {};
    if (status) patch['status'] = status;
    if (provider) patch['provider'] = provider;
    if (deadline) patch['deadline'] = deadline;
    if (link) patch['link'] = link;
    if (notes) patch['notes'] = notes;
    if (status === "submitted") patch['submitted_at'] = new Date().toISOString();

    const { data, error } = existing
      ? await supabase
          .from("scholarship_applications")
          .update(patch)
          .eq("id", existing.id)
          .eq("user_id", userId)
          .select()
      : await supabase
          .from("scholarship_applications")
          .insert({
            user_id: userId,
            scholarship_name: scholarshipName,
            status: status ?? "interested",
            ...patch,
          })
          .select();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [
        { type: "text", text: `${existing ? "Updated" : "Added"} ${scholarshipName}.` },
      ],
      structuredContent: { application: data?.[0] },
    };
  },
});
