import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    tanstackStart({ server: { entry: 'server' } }),
    nitroV2Plugin(),
    viteReact(),
    tailwindcss(),
    tsConfigPaths(),
  ],
  optimizeDeps: {
    exclude: ['@tanstack/start-client-core', '@tanstack/start-storage-context', '@tanstack/react-start'],
  },
})
