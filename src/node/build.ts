import { build as viteBuild, InlineConfig } from "vite"
import { CLIENT_ENTRY_PATH, SERVER_ENTRY_PATH } from "./constants"
import react from "@vitejs/plugin-react"
import { join } from "path"
import fs from "fs-extra"
import { RollupOutput } from "rollup"

export async function build(root: string = process.cwd()) {
  // 1. build code, including client and server
  const [clientBundle, serverBundle] = await bundle(root)

  // 2. import server-entry module
  const serverEntryPath = join(root, ".temp", "ssr-entry.js")
  const { render } = require(serverEntryPath)

  // 3. server render, output
  await renderPage(render, root, clientBundle)
}

export async function renderPage(
  render: () => string,
  root: string,
  clientBundle: RollupOutput,
) {
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
</html>`.trim()

  await fs.ensureDir(join(root, "build"))
  await fs.writeFile(join(root, "build/index.html"), html)
  await fs.remove(join(root, ".temp"))
}

export async function bundle(root: string) {
  const resolveViteConfig = (isServer: boolean): InlineConfig => ({
    mode: "production",
    root,
    // remember to add this plugin
    // it will auto inject import React from "react"
    plugins: [react()],
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
