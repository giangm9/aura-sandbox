import GUI from "lil-gui"
import { CameraHelper, DirectionalLight } from "three"

export function bindDirectionalLight(
  gui: GUI,
  light: DirectionalLight,
  shadowHelper: CameraHelper
) {
  const state = {
    phi: (Math.random() * Math.PI) / 2,
    theta: Math.PI / 4,
    distance: 20,
    size: 15,
  }
  function updateLightPosition() {
    light.position.set(
      state.distance * Math.sin(state.theta) * Math.cos(state.phi),
      state.distance * Math.cos(state.theta),
      state.distance * Math.sin(state.theta) * Math.sin(state.phi)
    )
    light.updateMatrixWorld()
  }
  updateLightPosition()

  const folder = gui.addFolder("Directional Light")
  ;[
    folder.add(state, "phi", 0, Math.PI / 2),
    folder.add(state, "theta", 0, Math.PI / 2),
    folder.add(state, "distance", 0, 20),
  ].forEach((binding) => {
    binding.onChange(updateLightPosition)
  })
  folder.add(light.shadow, "normalBias", 0, 1).onChange(() => {
    light.shadow.needsUpdate = true
  })
  folder.add(light, "intensity", 0, 2)
  folder.add(state, "size", 0, 30).onChange(() => {
    light.shadow.camera.left = -state.size
    light.shadow.camera.right = state.size
    light.shadow.camera.top = state.size
    light.shadow.camera.bottom = -state.size
    light.shadow.camera.updateProjectionMatrix()
    shadowHelper.update()
  })
}
