import {
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  PCFSoftShadowMap,
  PlaneGeometry,
  Scene,
} from "three"
import { Pane } from "tweakpane"
import { CanvasNode } from "../../lib/composer/nodes/CanvasNode"
import { RenderSceneNode } from "../../lib/composer/nodes/RenderSceneNode"

import { cameraWithControls, setupWithComposer } from "./setup"
import { populateFloors } from "./lib/populator"

const { canvas, composer, updateFuncs, renderer } = setupWithComposer()

renderer.shadowMap.enabled = true
renderer.shadowMap.type = PCFSoftShadowMap
const pane = new Pane()
const scene = new Scene()
const floors = populateFloors({
  count: 10,
  radius: 2,
})
scene.add(...floors)
floors.forEach((floor) => {
  floor.receiveShadow = true
  floor.castShadow = true
})
/** Light */
const light = new DirectionalLight(0xffffff, 1)

light.castShadow = true
light.shadow.mapSize.width = 1024
light.shadow.mapSize.height = 1024

scene.add(light)
const lightHelper = new DirectionalLightHelper(light)
scene.add(lightHelper)
const shadowHelper = new CameraHelper(light.shadow.camera)
scene.add(shadowHelper)
const lightFolder = pane.addFolder({ title: "Light" })
const lightParams = {
  phi: 0,
  theta: Math.PI / 4,
  distance: 10,
  near: 0.1,
  far: 1000,
}
function updateLight() {
  const { phi, theta, distance, near, far } = lightParams
  light.position.set(
    distance * Math.sin(phi) * Math.cos(theta),
    distance * Math.sin(theta),
    distance * Math.cos(phi) * Math.cos(theta)
  )
  light.shadow.camera.near = near
  light.shadow.camera.far = far
  light.shadow.camera.updateProjectionMatrix()
  light.shadow.camera.updateMatrixWorld()
  shadowHelper.update()
}

updateLight()
;[
  lightFolder.addBinding(lightParams, "phi", { min: -Math.PI, max: Math.PI }),
  lightFolder.addBinding(lightParams, "theta", { min: 0, max: Math.PI / 2 }),
  lightFolder.addBinding(lightParams, "distance", { min: 0.1, max: 100 }),
  lightFolder.addBinding(lightParams, "near", { min: 0.1, max: 100 }),
  lightFolder.addBinding(lightParams, "far", { min: 0.1, max: 1000 }),
].forEach((binding) => {
  binding.on("change", updateLight)
  shadowHelper.update()
})
;[
  // lightFolder.addBinding(light.shadow.mapSize, "width", { min: 1, max: 4096 }),
  // lightFolder.addBinding(light.shadow.mapSize, "height", { min: 1, max: 4096 }),
  lightFolder.addBinding(light.shadow.camera, "left", { min: -10, max: 0 }),
  lightFolder.addBinding(light.shadow.camera, "right", { min: 0, max: 10 }),
  lightFolder.addBinding(light.shadow.camera, "top", { min: 0, max: 10 }),
  lightFolder.addBinding(light.shadow.camera, "bottom", { min: -10, max: 0 }),
].forEach((binding) => {
  binding.on("change", () => {
    updateLight()
    shadowHelper.update()
  })
})

const ground = new Mesh(
  new PlaneGeometry(100, 100),
  new MeshStandardMaterial({
    color: 0x888888,
    side: DoubleSide,
    dithering: true,
  })
)
ground.rotation.x = -Math.PI / 2
ground.receiveShadow = true
scene.add(ground)

const { camera, controls } = cameraWithControls(canvas)
camera.position.set(10, 10, 10)
updateFuncs.push(() => {
  controls.update()
})

const sceneNode = composer.createNode(RenderSceneNode)
sceneNode.inpScene.defaultValue = scene
sceneNode.inpCamera.defaultValue = camera

const canvasNode = composer.createNode(CanvasNode)
canvasNode.inpColor.outslot = sceneNode.outColor

updateFuncs.push(() => {
  composer.freshExecute(canvasNode)
})
