import { createServer } from "vite"
import { pluginIndexHtml } from "./plugin-insel/indexHtml"
import react from "@vitejs/plugin-react"

export async function createDevServer(root = process.cwd()) {
  return createServer({
    root,
    plugins: [pluginIndexHtml(), react()],
  })
}
