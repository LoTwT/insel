import { Plugin } from "vite"
import { RouteService } from "./RouteService"

// dir structure -> routes data

export interface Route {
  path: string
  element: React.ReactElement
  filePath: string
}

interface PluginOptions {
  root: string
}

export const CONVENTIONAL_ROUTE_ID = "insel:routes"

export function pluginRoutes(options: PluginOptions): Plugin {
  const routeService = new RouteService(options.root)

  return {
    name: "insel:routes",
    async configResolved() {
      // when vite start, initialize RouteService
      await routeService.init()
    },
    resolveId(id) {
      if (id === CONVENTIONAL_ROUTE_ID) {
        return "\0" + id
      }
    },
    load(id) {
      if (id === "\0" + CONVENTIONAL_ROUTE_ID) {
        return routeService.generateRoutesCode()
      }
    },
  }
}
