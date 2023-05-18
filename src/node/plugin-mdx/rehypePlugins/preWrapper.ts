import type { Plugin } from "unified"
import { visit } from "unist-util-visit"
import type { Element, Root } from "hast"

export const rehypePluginPreWrapper: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, "element", (node) => {
      // <pre><code>...</code></pre>
      // 1. find the pre element
      if (
        node.tagName === "pre" &&
        node.children[0]?.type === "element" &&
        node.children[0].tagName === "code" &&
        // prevent endless loop
        !node.data?.isVisited
      ) {
        const codeNode = node.children[0]
        const codeClassName = codeNode.properties?.className?.toString() || ""

        // 2. resolve the language name
        // language-xxx
        const lang = codeClassName.split("-")[1]

        // codeNode.properties.className = ""

        // 3. transform HTML ast
        const clonedNode: Element = {
          type: "element",
          tagName: "pre",
          children: node.children,
          data: {
            isVisited: true,
          },
        }

        // modify the original pre tag -> div tag
        node.tagName = "div"
        node.properties = node.properties || {}
        node.properties.className = codeClassName

        // add the children of div
        node.children = [
          {
            type: "element",
            tagName: "span",
            properties: {
              className: "lang",
            },
            children: [
              {
                type: "text",
                value: lang,
              },
            ],
          },
          clonedNode,
        ]
      }
    })
  }
}
