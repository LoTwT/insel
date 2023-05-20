import { build as viteBuild, InlineConfig } from "vite"
import type { RollupOutput } from "rollup"
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from "./constants"
import { dirname, join } from "path"
import fs from "fs-extra"
import ora from "ora"
import { SiteConfig } from "shared/types"
import pluginReact from "@vitejs/plugin-react"
import { pluginConfig } from "./plugin-insel/config"
import { createVitePlugins } from "./vitePlugins"

export interface Route {
  path: string
  element: React.ReactElement
  filePath: string
}

export async function bundle(root: string, config: SiteConfig) {
  const resolveViteConfig = async (
    isServer: boolean,
  ): Promise<InlineConfig> => ({
    mode: "production",
    root,
    plugins: await createVitePlugins(config, undefined, isServer),
    ssr: {
      // 注意加上这个配置，防止 cjs 产物中 require ESM 的产物，因为 react-router-dom 的产物为 ESM 格式
      noExternal: ["react-router-dom"],
    },
    build: {
      ssr: isServer,
      outDir: isServer ? join(root, ".temp") : join(root, "build"),
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? "cjs" : "esm",
        },
      },
    },
  })
  const spinner = ora()

  // spinner.start(`Building client + server bundles...`);

  try {
    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(await resolveViteConfig(false)),
      // server build
      viteBuild(await resolveViteConfig(true)),
    ])
    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput]
  } catch (e) {
    console.log(e)
  }
}

export async function renderPage(
  render: (url: string) => string,
  routes: Route[],
  root: string,
  clientBundle: RollupOutput,
) {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry,
  )
  return Promise.all(
    routes.map(async (route) => {
      const routePath = route.path
      const appHtml = render(routePath)
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>title</title>
    <meta name="description" content="xxx">
  </head>
  <body>
    <div id="root">${appHtml}</div>
    <script type="module" src="/${clientChunk?.fileName}"></script>
  </body>
</html>`.trim()
      const fileName = routePath.endsWith("/")
        ? `${routePath}index.html`
        : `${routePath}.html`
      await fs.ensureDir(join(root, "build", dirname(fileName)))
      await fs.writeFile(join(root, "build", fileName), html)
    }),
  )
}

export async function build(root: string = process.cwd(), config: SiteConfig) {
  // 1. bundle - client 端 + server 端
  const [clientBundle] = await bundle(root, config)
  // 2. 引入 server-entry 模块
  const serverEntryPath = join(root, ".temp", "ssr-entry.js")
  const { render, routes } = await import(serverEntryPath)
  // 3. 服务端渲染，产出 HTML
  try {
    await renderPage(render, routes, root, clientBundle)
  } catch (error) {
    console.log("Render page error.\n", error)
  }
}
