import "uno.css"
import { Content } from "../../runtime/Content"

export function Layout() {
  return (
    <div>
      <h1 p2 m4 text-red>
        Common Content
      </h1>
      <h1>Doc Content</h1>
      <Content />
    </div>
  )
}
