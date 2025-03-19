import { atoms, Aura } from "aura";

const canvas = document.createElement("canvas");
Object.assign(canvas.style, {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
} as CSSStyleDeclaration);
document.body.appendChild(canvas);

const aura = new Aura();
aura.addDevPanel();
aura.load("/json/WM_entry.json");
aura.store.set(atoms.canvas, canvas);
const store = aura.store;

const button = document.createElement("button");
button.textContent = "Focus";
button.onclick = () => {
  const floors = store.get(atoms.focusBuildingFloors);
  store.set(atoms.focusFloor, floors[0].id);
};
button.style.position = "fixed";

document.body.appendChild(button);
