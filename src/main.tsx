import { useState } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"

const params = new URLSearchParams(location.search)
const entry = params.get("entry")

if (entry) {
  document.title = entry.replace(/.*\//, "")
  import(/* @vite-ignore */ `./entries/${entry}`)
} else {
  const roots = ENTRY_MAP.filter((path) => path.split("/").length === 1)
  createRoot(document.getElementById("root")!).render(<App />)

  function App() {
    return (
      <div className="children-container main-panel" style={{ border: "none" }}>
        {roots.map((path) => (
          <Item key={path} path={path} />
        ))}
      </div>
    )
  }
  type ItemProps = {
    path: string
  }

  function Item({ path }: ItemProps) {
    const [open, setOpen] = useState(true)
    const [hover, setHover] = useState(false)
    const toggle = () => setOpen(!open)
    const openSandbox = () => {
      window.open(`?entry=${path}`, "_blank")
    }

    const name = path.split("/").pop()
    const closeChildren = ENTRY_MAP.filter((item) =>
      item.startsWith(path + "/")
    )
      .filter((item) => {
        return item.replace(path + "/", "").split("/").length === 1
      })
      .sort((a) => (a.endsWith(".tsx") ? 1 : -1))
    const type = path.endsWith(".tsx") ? "file" : "folder"
    const glyph = type == "folder" ? (open ? "📂" : "📁") : "⚛️"

    const onClick = type == "folder" ? toggle : openSandbox
    return (
      <>
        <div
          className="item"
          onClick={onClick}
          style={{
            textDecoration: hover ? "underline" : "none",
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {glyph}&nbsp;{name}
        </div>

        {open && (
          <div className="children-container" style={{ paddingLeft: "10px" }}>
            {closeChildren.map((path) => (
              <Item key={path} path={path} />
            ))}
          </div>
        )}
      </>
    )
  }
}
