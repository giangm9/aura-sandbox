import GUI from "lil-gui"
import {
  Color,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Raycaster,
  SphereGeometry,
  Vector2,
  Vector3,
} from "three"
import {
  populateFloors,
  populateLights,
} from "../render-pipeline/lib/populator"
import { setupBasic } from "../render-pipeline/setup"

const { canvas, scene, camera, renderer, updateFuncs, controls } = setupBasic()

const floors = populateFloors({ count: 10, radius: 0 })

controls.target.set(0, 5, 0)

scene.add(...floors)

const lights = populateLights()
scene.add(...lights.lights)
scene.add(new GridHelper(10, 10))

const state = {
  focusFloor: 11,
  margin: 1,
  width: 10,
  height: 10,
}
const gui = new GUI()
gui.add(state, "focusFloor", 0, 10, 1)
gui.add(state, "margin", 0, 5, 0.01)

updateFuncs.push(() => {
  floors.forEach((floor, i) => {
    const targetPosition = i <= state.focusFloor ? i : i + state.margin
    floor.position.y += (targetPosition - floor.position.y) * 0.1
  })
})

gui.add(state, "width", 1, 20, 1)
gui.add(state, "height", 1, 20, 1)

const debugMeshes = [] as Object3D[]
const raycast = new Raycaster()
const targetAlpha = floors.map(() => 1)
updateFuncs.push(() => {
  debugMeshes.forEach((mesh) => mesh.removeFromParent())
  debugMeshes.length = 0

  if (state.focusFloor >= floors.length) {
    return
  }
  const { width, height } = state

  let [xmin, ymin, xmax, ymax, w, h] = [1, 1, -1, -1, 2, 2]

  const geometry = (floors[state.focusFloor] as Mesh).geometry
  const position = geometry.attributes.position
  camera.updateProjectionMatrix()
  camera.updateMatrixWorld()
  const margin = 0.1
  for (let i = 0; i < position.count; i += 3) {
    const x = position.getX(i)
    const y = position.getY(i)
    const z = position.getZ(i)

    const world = floors[state.focusFloor].localToWorld(new Vector3(x, y, z))
    //
    const ndc = world.clone().project(camera)

    xmin = Math.min(xmin, ndc.x)
    ymin = Math.min(ymin, ndc.y)
    xmax = Math.max(xmax, ndc.x)
    ymax = Math.max(ymax, ndc.y)

    xmin = Math.max(xmin, -1)
    ymin = Math.max(ymin, -1)
    xmax = Math.min(xmax, 1)
    ymax = Math.min(ymax, 1)
    w = xmax - xmin
    h = ymax - ymin
  }
  const unit = { x: w / width, y: h / height }

  floors.forEach((_, index) => {
    targetAlpha[index] = 1
  })

  for (let x = xmin - margin; x <= xmax + margin; x += unit.x) {
    for (let y = ymin - margin; y <= ymax + margin; y += unit.y) {
      raycast.setFromCamera(new Vector2(x, y), camera)
      const intersects = raycast.intersectObject(floors[state.focusFloor])
      intersects.forEach((intersect) => {
        const normal = intersect.normal || new Vector3(1, 1, 1)
        const mesh = new Mesh(
          new SphereGeometry(0.1),
          new MeshBasicMaterial({
            color: new Color(
              Math.abs(normal.x),
              Math.abs(normal.y),
              Math.abs(normal.z)
            ),
          })
        )

        mesh.position.copy(intersect.point)
        scene.add(mesh)
        debugMeshes.push(mesh)
      })

      if (intersects.length > 0) {
        const intersects = raycast.intersectObjects(
          floors.filter((_, i) => i > state.focusFloor)
        )
        intersects.forEach((intersect) => {
          // @ts-expect-error none
          targetAlpha[floors.indexOf(intersect.object)] = 0.0
        })
      }
    }
  }

  floors.forEach((floor, i) => {
    // @ts-expect-error none
    floor.material.opacity += (targetAlpha[i] - floor.material.opacity) * 0.1
  })
})

updateFuncs.push(() => {
  controls.update()

  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
  camera.aspect = canvas.clientWidth / canvas.clientHeight
  camera.updateProjectionMatrix()

  renderer.render(scene, camera)
})
