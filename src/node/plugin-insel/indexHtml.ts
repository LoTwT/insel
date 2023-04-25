import { readFile } from "fs/promises"
import { Plugin } from "vite"
import { DEFAULT_HTML_PATH, CLIENT_ENTRY_PATH } from "../constants"

export function pluginIndexHtml(): Plugin {
  return {
    name: "insel:index-html",
    apply: "serve",

    // insert entry script tag
    transformIndexHtml(html) {
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              type: "module",
              src: `/@fs/${CLIENT_ENTRY_PATH}`,
            },
            injectTo: "body",
          },
        ],
      }
    },

    configureServer(server) {
      return () => {
        server.middlewares.use(async (req, res, next) => {
          // 1. read the content of template.html
          let html = await readFile(DEFAULT_HTML_PATH, "utf-8")

          // 2. response HTML browser
          try {
            html = await server.transformIndexHtml(
              req.url,
              html,
              req.originalUrl,
            )

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
