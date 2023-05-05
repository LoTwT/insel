import { createServer } from "vite"
import { pluginIndexHtml } from "./plugin-insel/indexHtml"
import pluginReact from "@vitejs/plugin-react"
import { PACKAGE_ROOT } from "./constants"
import { resolveConfig } from "./config"
import { pluginConfig } from "./plugin-insel/config"

export async function createDevServer(root: string) {
  const config = await resolveConfig(root, "serve", "development")

  return createServer({
    root,
    plugins: [pluginIndexHtml(), pluginReact(), pluginConfig(config)],
    server: {
      fs: {
        allow: [PACKAGE_ROOT],
      },
    },
  })
}
