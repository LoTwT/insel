import { App } from "./App"
import { renderToString } from "react-dom/server"

// For SSR component render
export function render() {
  return renderToString(<App />)
}
