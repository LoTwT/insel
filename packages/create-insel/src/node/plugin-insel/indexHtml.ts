import { readFile } from "node:fs/promises"
import { Plugin } from "vite"
import { DEFAULT_HTML_PATH } from "../constants"

export function pluginIndexHtml(): Plugin {
  return {
    name: "insel:index-html",
    apply: "serve",
    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          const html = await readFile(DEFAULT_HTML_PATH, "utf-8")

          try {
            res.statusCode = 200
            res.setHeader("Content-Type", "text/html")
            res.end(html)
          } catch (error) {
            return next(error)
          }
        })
      }
    },
  }
}