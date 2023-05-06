import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import rehypeStringify from "rehype-stringify"

describe("Markdown compile cases", () => {
  // init processor
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype)
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
})
