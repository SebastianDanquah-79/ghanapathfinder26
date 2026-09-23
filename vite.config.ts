import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";
import { loadEnv } from "vite";

const serverEnv = loadEnv(process.env["NODE_ENV"] || "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

export default defineConfig({
  tanstackStart: { server: { entry: "server" } },
  vite: { plugins: [mcpPlugin()] },
});
