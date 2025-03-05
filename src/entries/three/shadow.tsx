import {
  DirectionalLight,
  DirectionalLightHelper,
  DoubleSide,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
} from "three"
import { setupBasic } from "../render-pipeline/setup"

const { renderer, canvas, scene, camera, controls, updateFuncs } = setupBasic()
camera.position.set(10, 10, 10)

for (let i = 0; i < 10; i++) {
  const mesh = new Mesh(
    new IcosahedronGeometry(1, 0),
    new MeshBasicMaterial({ color: 0x00ff00 })
  )
  mesh.position.x = Math.random() * 10 - 5
  mesh.position.y = Math.random() * 5
  mesh.position.z = Math.random() * 10 - 5
  scene.add(mesh)
}

const ground = new Mesh(
  new PlaneGeometry(10, 10),
  new MeshBasicMaterial({ color: 0x00ff00, side: DoubleSide, dithering: true })
)
ground.rotation.x = -Math.PI / 2
scene.add(ground)

const light = new DirectionalLight(0xffffff, 1)
light.position.set(0, 10, 10)
scene.add(light)
const helper = new DirectionalLightHelper(light)
scene.add(light, helper)

updateFuncs.push(() => {
  controls.update()
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
  camera.aspect = canvas.clientWidth / canvas.clientHeight
  camera.updateProjectionMatrix()

  renderer.setRenderTarget(null)
  renderer.render(scene, camera)
})
