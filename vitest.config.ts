import { defineConfig } from "vitest/config"
import AutoImport from "unplugin-auto-import/vite"

export default defineConfig({
  plugins: [
    AutoImport({
      imports: ["vitest"],
    }),
  ],
  test: {
    environment: "node",
    passWithNoTests: true,
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    threads: true,
  },
})
