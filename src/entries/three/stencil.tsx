import { MeshStandardMaterial } from "three"
import {
  populateFloors,
  populateLights,
} from "../render-pipeline/lib/populator"
import { setupBasic } from "../render-pipeline/setup"

const { renderer, canvas, scene, camera, controls, updateFuncs } = setupBasic()

camera.position.set(10, 10, 10)

const floors = populateFloors({ count: 10, radius: 0 })
floors.forEach((floor) => {
  floor.receiveShadow = true
  floor.castShadow = true
  const material = new MeshStandardMaterial({
    color: 0xaaaaaa + Math.random() * 0x555555,
  })
  floor.material = material
  scene.add(floor)
})

const light = populateLights()
light.lights.forEach((light) => scene.add(light))

updateFuncs.push(() => {
  controls.update()
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
  camera.aspect = canvas.clientWidth / canvas.clientHeight
  camera.updateProjectionMatrix()

  renderer.render(scene, camera)
})
