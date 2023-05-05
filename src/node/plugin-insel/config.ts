import { SiteConfig } from "shared/types/index"
import type { Plugin } from "vite"

const SITE_DATA_ID = "insel:site-data"

// this plugin is to make front-end have access to the content of sitedata
export function pluginConfig(config: SiteConfig): Plugin {
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
  }
}
