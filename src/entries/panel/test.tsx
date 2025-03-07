import { createRoot } from "react-dom/client"
import { PanelContainer } from "../../lib/panel"

export function App() {
  return <PanelContainer />
}

createRoot(document.getElementById("root")!).render(<App />)
