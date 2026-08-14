import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfileTool from "./tools/get-profile";
import listSavedItemsTool from "./tools/list-saved-items";
import listApplicationsTool from "./tools/list-applications";
import trackApplicationTool from "./tools/track-application";
import listDeadlinesTool from "./tools/list-deadlines";

const projectRef = import.meta.env['VITE_SUPABASE_PROJECT_ID'] ?? "project-ref-unset";

// The library's tool array type predates exactOptionalPropertyTypes; the
// per-tool generics are erased here (same shape, stricter optionality).
type McpTools = Parameters<typeof defineMcp>[0]["tools"];

export default defineMcp({
  name: "ghana-future-guide",
  title: "Ghana Future Guide",
  version: "0.1.0",
  instructions:
    "Tools for GhanaPath, a college, scholarship and career companion for Ghanaian students. Read the signed-in student's profile, saved universities and scholarships, tracked scholarship applications, deadlines and checklist, and add or update applications in their tracker.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getProfileTool,
    listSavedItemsTool,
    listApplicationsTool,
    trackApplicationTool,
    listDeadlinesTool,
  ] as unknown as McpTools,
});
