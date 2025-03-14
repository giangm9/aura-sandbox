import { Atoms, createAura, DevPanel, ProjectLoader, StoreAPI } from "aura";
import "./floor-react.css";
import { createRoot } from "react-dom/client";
import { Provider, useAtom } from "jotai";

const aura = createAura();
aura.add(DevPanel);
aura.initialize();
const loader = aura.get(ProjectLoader);

loader.load("public/json/entry.json");

function App() {
  const [floor, setFloor] = useAtom(Atoms.Focus.focusFloor);
  const [floors] = useAtom(Atoms.Focus.focusBuildingFloors);
  const targetId = floors?.[0]?.id;
  const [, setCanvas] = useAtom(Atoms.DOM.canvas);

  return (
    <div>
      <canvas className="canvas" ref={setCanvas} />
      <div className="ui">
        <div>Focusing Floor: {floor?.name || "NONE"} </div>
        <button
          onClick={() => {
            setFloor(targetId);
          }}
        >
          Focus
        </button>
      </div>
    </div>
  );
}

const root = document.getElementById("root");

createRoot(root).render(
  <Provider store={aura.get(StoreAPI).store}>
    <App />
  </Provider>
);
