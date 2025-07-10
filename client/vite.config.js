import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

// 👇 Manually define __dirname in ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "components": path.resolve(__dirname, "./src/components"),
      "hooks": path.resolve(__dirname, "./src/hooks"),
      "lib": path.resolve(__dirname, "./src/lib"),
      "ui": path.resolve(__dirname, "./src/components/ui"),
      "utils": path.resolve(__dirname, "./src/lib/utils"),
      "context": path.resolve(__dirname, "./src/context"),
      "assets": path.resolve(__dirname, "./src/assets"),
      "pages": path.resolve(__dirname, "./src/pages"),
      "styles": path.resolve(__dirname, "./src/styles"),
      "App": path.resolve(__dirname, "./src/App.jsx"),
    },
  },
})
