import { cac } from "cac"
import { resolve } from "path"
import { createDevServer } from "./dev"
import { build } from "./build"

const version = require("../../package.json").version

const cli = cac("create-insel").version(version).help()

cli
  .command("[root]", "start dev server")
  .alias("dev")
  .action(async (root: string) => {
    root = root ? resolve(root) : process.cwd()
    const server = await createDevServer(root)
    await server.listen()
    server.printUrls()
  })

cli
  .command("build [root]", "build for production")
  .action(async (root: string) => {
    try {
      root = resolve(root)
      await build(root)
    } catch (error) {
      console.log(error)
    }
  })

cli.parse()
