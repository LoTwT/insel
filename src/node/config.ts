import fse from "fs-extra"
import { resolve } from "path"
import { loadConfigFromFile } from "vite"
import { UserConfig, SiteConfig } from "../shared/types/index"

type RawConfig =
  | UserConfig
  | Promise<UserConfig>
  | (() => UserConfig | Promise<UserConfig>)

export async function resolveUserConfig(
  root: string,
  command: "serve" | "build",
  mode: "development" | "production",
) {
  // 1. get the path of the config file
  const configPath = getUserConfigPath(root)

  // 2. read the config file
  const result = await loadConfigFromFile(
    {
      command,
      mode,
    },
    configPath,
    root,
  )

  if (result) {
    const { config: rawConfig = {} as RawConfig } = result
    // three situations
    // 1. object
    // 2. promise
    // 3. function
    const userConfig = await (typeof rawConfig === "function"
      ? rawConfig()
      : rawConfig)

    return [configPath, userConfig] as const
  } else {
    return [configPath, {} as UserConfig] as const
  }
}

export function resolveSiteData(userConfig: UserConfig): UserConfig {
  return {
    title: userConfig.title || "Insel.js",
    description: userConfig.description || "SSG Framework",
    themeConfig: userConfig.themeConfig || {},
    vite: userConfig.vite || {},
  }
}

export async function resolveConfig(
  root: string,
  command: "serve" | "build",
  mode: "development" | "production",
) {
  const [configPath, userConfig] = await resolveUserConfig(root, command, mode)

  const siteConfig: SiteConfig = {
    root,
    configPath,
    siteData: resolveSiteData(userConfig as UserConfig),
  }

  return siteConfig
}

function getUserConfigPath(root: string) {
  try {
    const supportConfigFiles = ["config.ts", "config.js"]
    const configPath = supportConfigFiles
      .map((file) => resolve(root, file))
      .find(fse.pathExistsSync)

    return configPath
  } catch (error) {
    console.error(`Fail to load user config: ${error}`)
    throw error
  }
}

export function defineConfig(config: UserConfig) {
  return config
}
