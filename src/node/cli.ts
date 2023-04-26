import cac from "cac"
import { resolve } from "path"
import { build } from "./build"
import { createDevServer } from "./dev"

const cli = cac("insel").version("0.0.1").help()

cli.command("dev [root]", "start dev server").action(async (root: string) => {
  const server = await createDevServer(root)
  await server.listen()
  server.printUrls()
})

cli
  .command("build [root]", "build in production")
  .action(async (root: string) => {
    try {
      root = resolve(root)
      await build(root)
    } catch (e) {
      console.log(e)
    }
  })

cli.parse()
