import GUI from "lil-gui";
import { Object3D } from "three";
import { FLOOR_HEIGHT } from "../lib/populator";

export function createFloorState(gui: GUI, { count }: { count: number }) {
  const state = {
    focusFloor: -1,
    height: 2,
  };

  gui.add(state, "focusFloor", -1, count, 1);
  gui.add(state, "height", 0, 5, 0.01);

  return state;
}

export function animateFloorsWithState(
  state: ReturnType<typeof createFloorState>,
  floors: Object3D[]
) {
  return () => {
    floors.forEach((floor, i) => {
      const targetPosition =
        i * FLOOR_HEIGHT +
        (state.focusFloor == -1 || i < state.focusFloor ? 0 : state.height);
      floor.position.y += (targetPosition - floor.position.y) * 0.1;
    });
  };
}
