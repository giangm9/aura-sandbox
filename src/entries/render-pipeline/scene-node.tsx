import {
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
} from "three"
import { CanvasNode } from "../../lib/composer/nodes/CanvasNode"
import { RenderSceneNode } from "../../lib/composer/nodes/RenderSceneNode"
import { setupWithComposer } from "./setup"
import { OrbitControls } from "three/examples/jsm/Addons.js"

const { canvas, composer, updateFuncs } = setupWithComposer()

const scene = new Scene()
const camera = new PerspectiveCamera(75, 1, 0.1, 1000)
camera.position.z = 5
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
updateFuncs.push(() => {
  controls.update()
})

for (let i = 0; i < 10; i++) {
  const mesh = new Mesh(
    new IcosahedronGeometry(1, 0),
    new MeshBasicMaterial({ color: 0x00ff00 })
  )
  mesh.position.x = Math.random() * 10 - 5
  mesh.position.y = Math.random() * 10 - 5
  mesh.position.z = Math.random() * 10 - 5
  scene.add(mesh)
}

const sceneNode = composer.createNode(RenderSceneNode)
sceneNode.inpScene.defaultValue = scene
sceneNode.inpCamera.defaultValue = camera

const canvasNode = composer.createNode(CanvasNode)
canvasNode.inpColor.outslot = sceneNode.outColor

updateFuncs.push(() => {
  composer.freshExecute(canvasNode)
})
