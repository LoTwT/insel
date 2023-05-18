import { Plugin } from "vite"
import pluginMdx from "@mdx-js/rollup"
import remarkPluginGFM from "remark-gfm"
import rehypePluginAutolinkHeadings from "rehype-autolink-headings"
import rehypePluginSlug from "rehype-slug"
import remarkPluginFrontmatter from "remark-frontmatter"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"
import { rehypePluginPreWrapper } from "./rehypePlugins/preWrapper"
import { rehypePluginShiki } from "./rehypePlugins/shiki"
import shiki from "shiki"

export async function pluginMdxRollup(): Promise<Plugin> {
  return pluginMdx({
    remarkPlugins: [
      remarkPluginGFM,
      remarkPluginFrontmatter,
      [remarkMdxFrontmatter, { name: "frontmatter" }],
    ],
    rehypePlugins: [
      rehypePluginSlug,
      [
        rehypePluginAutolinkHeadings,
        {
          properties: {
            class: "header-anchor",
          },
          content: {
            type: "text",
            value: "#",
          },
        },
      ],
      rehypePluginPreWrapper,
      [
        rehypePluginShiki,
        { highlighter: await shiki.getHighlighter({ theme: "nord" }) },
      ],
    ],
  })
}
