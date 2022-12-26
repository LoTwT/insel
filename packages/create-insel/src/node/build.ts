import { InlineConfig, build as viteBuild } from "vite"
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from "./constants"
import pluginReact from "@vitejs/plugin-react"
import { RollupOutput } from "rollup"
import { join } from "node:path"
import * as fse from "fs-extra"

export const build = async (root = process.cwd()) => {
  // 1. 打包代码，client + server
  const [clientBundle, serverBundle] = await bundle(root)
  // 2. 引入 server-entry 入口模块
  const serverEntryPath = join(root, ".temp", "ssr-entry.js")
  // 3. 服务端渲染
  const { render } = require(serverEntryPath)
  await renderPage(render, root, clientBundle)
}

export const bundle = async (root: string) => {
  const resolveViteConfig = (isServer: boolean): InlineConfig => ({
    mode: "production",
    root,
    // 自动注入 import React from "react" ，避免 React is not defined 的错误
    plugins: [pluginReact()],
    build: {
      ssr: isServer,
      outDir: isServer ? ".temp" : "build",
      rollupOptions: {
        input: isServer ? SERVER_ENTRY_PATH : CLIENT_ENTRY_PATH,
        output: {
          format: isServer ? "cjs" : "esm",
        },
      },
    },
  })

  console.log(`Building client + server bundles...`)

  try {
    // const clientBuild = async () => {
    //   return viteBuild({
    //     mode: "production",
    //     root,
    //     build: {
    //       outDir: "build",
    //       rollupOptions: {
    //         input: CLIENT_ENTRY_PATH,
    //         output: {
    //           format: "esm",
    //         },
    //       },
    //     },
    //   })
    // }

    // const serverBuild = async () => {
    //   return viteBuild({
    //     mode: "production",
    //     root,
    //     build: {
    //       ssr: true,
    //       outDir: ".temp",
    //       rollupOptions: {
    //         input: SERVER_ENTRY_PATH,
    //         output: {
    //           format: "cjs",
    //         },
    //       },
    //     },
    //   })
    // }

    // await clientBuild()
    // await serverBuild()

    const [clientBundle, serverBundle] = await Promise.all([
      // client build
      viteBuild(resolveViteConfig(false)),
      // server build
      viteBuild(resolveViteConfig(true)),
    ])

    return [clientBundle, serverBundle] as [RollupOutput, RollupOutput]
  } catch (error) {
    console.log(error)
  }
}

export const renderPage = async (
  render: () => string,
  root: string,
  clientBundle: RollupOutput,
) => {
  const clientChunk = clientBundle.output.find(
    (chunk) => chunk.type === "chunk" && chunk.isEntry,
  )

  console.log(`Rendering page in server side...`)

  const appHtml = render()
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
</html>
`.trim()

  await fse.ensureDir(join(root, "build"))
  await fse.writeFile(join(root, "build/index.html"), html)
  await fse.remove(join(root, ".temp"))
}
