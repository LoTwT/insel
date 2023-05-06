import fastGlob from "fast-glob"
import { normalizePath } from "vite"
import path from "node:path"

interface RouteMeta {
  routePath: string
  absolutePath: string
}

export class RouteService {
  #scanDir: string
  #routeData: RouteMeta[] = []

  constructor(scanDir: string) {
    this.#scanDir = scanDir
  }

  async init() {
    const files = fastGlob
      .sync(["**/*.{js,jsx,ts,tsx,md,mdx}"], {
        cwd: this.#scanDir,
        absolute: true,
        ignore: ["**/node_modules/**", "**/build/**", "config.ts"],
      })
      .sort()

    files.forEach((file) => {
      const fileRelativePath = normalizePath(path.relative(this.#scanDir, file))

      // route path
      const routePath = this.normalizeRoutePath(fileRelativePath)
      // file absolute path
      this.#routeData.push({
        routePath,
        absolutePath: file,
      })
    })
  }

  // get route data for testing
  getRouteMeta(): RouteMeta[] {
    return this.#routeData
  }

  normalizeRoutePath(rawPath: string) {
    const routePath = rawPath.replace(/\.(.*)?$/, "").replace(/index$/, "")
    return routePath.startsWith("/") ? routePath : `/${routePath}`
  }

  generateRoutesCode() {
    return `
import React from 'react';
import loadable from '@loadable/component';
${this.#routeData
  .map((route, index) => {
    return `const Route${index} = loadable(() => import('${route.absolutePath}'));`
  })
  .join("\n")}
export const routes = [
${this.#routeData
  .map((route, index) => {
    return `{ path: '${route.routePath}', element: React.createElement(Route${index}) }`
  })
  .join(",\n")}
];
`
  }
}
