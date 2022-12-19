import { createServer } from "vite"
import { pluginIndexHtml } from "./plugin-insel/indexHtml"

export async function createDevServer(root = process.cwd()) {
  return createServer({
    root,
    plugins: [pluginIndexHtml()],
  })
}
