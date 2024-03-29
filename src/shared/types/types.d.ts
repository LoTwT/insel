declare module "insel:site-data" {
  import type { UserConfig } from "shared/types"
  const siteData: UserConfig
  export default siteData
}

declare module "insel:routes" {
  import { RouteObject } from "react-router-dom"
  const routes: RouteObject[]
  export { routes }
}

declare module "*.module.scss" {
  const classes: { [key: string]: string }
  export default classes
}
