import { atoms, Aura } from "aura";
import { Provider, useAtom } from "jotai";
import { createRoot } from "react-dom/client";
import "./floor-react.css";

const aura = new Aura();
aura.addDevPanel();
aura.load("/json/WM_entry.json");

function App() {
  const [floor, setFloor] = useAtom(atoms.focusFloor);
  const [floors] = useAtom(atoms.focusBuildingFloors);
  const targetId = floors?.[0]?.id;
  const [, setCanvas] = useAtom(atoms.canvas);

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
  <Provider store={aura.store}>
    <App />
  </Provider>
);
