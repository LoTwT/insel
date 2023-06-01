import { PageData } from "shared/types"
import { Layout } from "../theme-default"
import { matchRoutes } from "react-router-dom"
import { routes } from "insel:routes"
import siteData from "insel:site-data"

export function App() {
  return <Layout />
}

export async function initPageData(routePath: string): Promise<PageData> {
  // 获取路由组件编译后的模块内容
  const matched = matchRoutes(routes, routePath)

  if (matched) {
    // preload route component
    // @ts-ignore
    const moduleInfo = await matched[0].route.preload()

    return {
      pageType: "doc",
      siteData,
      frontmatter: moduleInfo.frontmatter,
      pagePath: routePath,
    }
  }

  return {
    pageType: "404",
    siteData,
    pagePath: routePath,
    frontmatter: {},
  }
}
