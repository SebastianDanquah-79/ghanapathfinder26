/// <reference types="vite/client" />
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { loadEnv } from "vite";

const serverEnv = loadEnv(process.env["NODE_ENV"] || "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
  ],
});
