// Lovable's wrapper wires TanStack Start, React, Tailwind and Nitro, and writes
// the deployable build to dist/ (Lovable hosting). Nitro honours NITRO_PRESET,
// so Vercel builds (vercel.json sets NITRO_PRESET=vercel) still work.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: { build: { cssMinify: false } },
});
