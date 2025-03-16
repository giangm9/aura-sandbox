import { createAura, DevPanel, DOMAttach, ProjectLoader } from "aura";
const canvas = document.createElement("canvas");
Object.assign(canvas.style, {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
} as CSSStyleDeclaration);
document.body.appendChild(canvas);

const aura = createAura();
aura.add(DevPanel);
aura.initialize();

const loader = aura.get(ProjectLoader);
loader.load("/json/WM_entry.json");

aura.get(DOMAttach).attach(canvas);
