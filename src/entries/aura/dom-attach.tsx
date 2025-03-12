import { createAura, DevPanel, DOMAttach, ProjectLoader, OsmLoader } from "aura"
const canvas = document.createElement("canvas")
Object.assign(canvas.style, {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
} as CSSStyleDeclaration)
document.body.appendChild(canvas)

const aura = createAura()
aura.add(DevPanel)

const loader = aura.get(ProjectLoader)
loader.load("/json/entry.json")
const loaderOSM = aura.get(OsmLoader)
loaderOSM.load("/json/entryOsm.json")
aura.initialize()

aura.get(DOMAttach).attach(canvas)
