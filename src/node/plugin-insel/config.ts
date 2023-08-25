import { PACKAGE_ROOT } from "node/constants"
import { join, relative } from "node:path"
import { SiteConfig } from "shared/types/index"
import type { Plugin } from "vite"
import { normalizePath } from "vite"

const SITE_DATA_ID = "insel:site-data"

// this plugin is to make front-end have access to the content of sitedata
export function pluginConfig(
  config: SiteConfig,
  restartServer?: () => Promise<void>,
): Plugin {
  return {
    name: "insel:config",
    resolveId(id) {
      if (id === SITE_DATA_ID) {
        return "\0" + SITE_DATA_ID
      }
    },

    load(id) {
      if (id === "\0" + SITE_DATA_ID) {
        return `export default ${JSON.stringify(config.siteData)}`
      }
    },
    async handleHotUpdate(ctx) {
      const customWatchedFiles = [normalizePath(config.configPath)]
      const include = (id: string) =>
        customWatchedFiles.some((file) => id.includes(file))

      if (include(ctx.file)) {
        console.log(
          `\n${relative(config.root, ctx.file)} changed, restarting server...`,
        )
        // restart dev server
        await restartServer()
      }
    },
    config() {
      return {
        root: PACKAGE_ROOT,
        resolve: {
          alias: {
            "@runtime": join(PACKAGE_ROOT, "src", "runtime", "index.ts"),
          },
        },
        css: {
          modules: {
            localsConvention: "camelCaseOnly",
          },
        },
      }
    },
  }
}
