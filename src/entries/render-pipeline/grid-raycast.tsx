import {
  DoubleSide,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2,
} from "three"
import { setupBasic } from "./setup"
import GUI from "lil-gui"

const { renderer, updateFuncs, camera, controls } = setupBasic()

const scene = new Scene()

const grid = new GridHelper(10, 10)
scene.add(grid)

const mesh = new Mesh(
  new PlaneGeometry(10, 10),
  new MeshBasicMaterial({ color: 0x00ff00, side: DoubleSide })
)
scene.add(mesh)

const state = {
  width: 10,
  height: 10,
}

const gui = new GUI()
gui.add(state, "width", 1, 20, 1)
gui.add(state, "height", 1, 20, 1)

const debugMeshes = [] as Object3D[]
const raycast = new Raycaster()
updateFuncs.push(() => {
  debugMeshes.forEach((mesh) => mesh.removeFromParent())
  debugMeshes.length = 0

  const { width, height } = state
  const unit = { x: 2 / width, y: 2 / height }

  let count = 0
  for (let x = -1 + 0.5 * unit.x; x < 1; x += unit.x) {
    for (let y = -1 + 0.5 * unit.y; y < 1; y += unit.y) {
      console.log(x, y)
      raycast.setFromCamera(new Vector2(x, y), camera)
      count++

      const intersects = raycast.intersectObject(mesh)
      if (intersects.length) {
        const point = intersects[0].point
        const debugMesh = new Mesh(
          new SphereGeometry(0.1),
          new MeshBasicMaterial({ color: 0xff0000 })
        )
        debugMesh.position.copy(point)
        debugMeshes.push(debugMesh)
        scene.add(debugMesh)
      }
    }
  }
  console.log(count)
})

updateFuncs.push(() => {
  controls.update()
  renderer.setSize(window.innerWidth, window.innerHeight, false)
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.render(scene, camera)
})
