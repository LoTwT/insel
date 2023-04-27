import path from "path"
import fse from "fs-extra"
import * as execa from "execa"

const exampleDir = path.resolve(__dirname, "../e2e/playground/basic")

const defaultExecaOpts = {
  cwd: exampleDir,
  stdout: process.stdout,
  stdin: process.stdin,
  stderr: process.stderr,
}

async function prepareE2E() {
  // ensure after build
  if (!fse.existsSync(path.resolve(__dirname, "../dist"))) {
    // exec build command
    execa.execaCommandSync("pnpm build", {
      cwd: path.resolve(__dirname, "../"),
    })
  }

  execa.execaCommandSync("npx playwright install", {
    ...defaultExecaOpts,
    cwd: path.join(__dirname, "../"),
  })

  execa.execaCommandSync("pnpm i", {
    ...defaultExecaOpts,
  })

  // exec dev command
  execa.execaCommandSync("pnpm dev", defaultExecaOpts)
}

prepareE2E()
