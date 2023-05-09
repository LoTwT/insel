import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"
import { rehypePluginPreWrapper } from "../../node/plugin-mdx/rehypePlugins/preWrapper"

describe("Markdown compile cases", () => {
  // init processor
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePluginPreWrapper)
    .use(rehypeStringify)

  test("Compile title", async () => {
    const mdContent = "# 123"
    const result = processor.processSync(mdContent)

    expect(result.value).toMatchInlineSnapshot
  })

  test("Compile code", async () => {
    const mdContent = "I am using `Insel.js`"
    const result = processor.processSync(mdContent)

    expect(result.value).toMatchInlineSnapshot(
      '"<p>I am using <code>Insel.js</code></p>"',
    )
  })

  test("Compile code block", async () => {
    const mdContent = "```js\nconsole.log(123);\n```"
    const result = processor.processSync(mdContent)
    expect(result.value).toMatchInlineSnapshot(`
      "<div class=\\"language-js\\"><span class=\\"lang\\">js</span><pre><code class=\\"\\">console.log(123);
      </code></pre></div>"
    `)
  })
})
