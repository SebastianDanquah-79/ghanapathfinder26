import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const isVercel = !!process.env['VERCEL'];

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: isVercel ? { preset: "vercel" } : true,
});
