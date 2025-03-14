import { Atoms, createAura, DOMAttach, ProjectLoader, StoreAPI } from "aura";
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
// aura.add(DevPanel)

const loader = aura.get(ProjectLoader);
loader.load("public/json/entry.json");
aura.initialize();

aura.get(DOMAttach).attach(canvas);

const store = aura.get(StoreAPI);

const button = document.createElement("button");
button.textContent = "Focus";
button.onclick = () => {
  const floors = store.get(Atoms.Focus.focusBuildingFloors);

  store.set(Atoms.Focus.focusFloor, floors[0].id);
};
button.style.position = "fixed";

document.body.appendChild(button);
