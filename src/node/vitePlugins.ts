import { SiteConfig } from "shared/types"
import { pluginIndexHtml } from "./plugin-insel/indexHtml"
import pluginReact from "@vitejs/plugin-react"
import { pluginConfig } from "./plugin-insel/config"
import { pluginRoutes } from "./plugin-routes"
import { pluginMdx } from "./plugin-mdx"
import pluginUnocss from "unocss/vite"
import unocssOptions from "./unocssOptions"

export async function createVitePlugins(
  config: SiteConfig,
  restartServer?: () => Promise<void>,
  isSSR = false,
) {
  pluginUnocss(unocssOptions)
  return [
    pluginIndexHtml(),
    pluginReact({
      jsxRuntime: "automatic",
    }),
    pluginConfig(config, restartServer),
    pluginRoutes({
      root: config.root,
      isSSR,
    }),
    await pluginMdx(),
  ]
}
