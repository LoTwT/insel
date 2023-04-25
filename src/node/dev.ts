import { createServer as createViteDevServer } from "vite"
import { pluginIndexHtml } from "./plugin-insel/indexHtml"
import react from "@vitejs/plugin-react"

export async function createDevServer(root = process.cwd()) {
  return createViteDevServer({
    root,
    plugins: [pluginIndexHtml(), react()],
  })
}
