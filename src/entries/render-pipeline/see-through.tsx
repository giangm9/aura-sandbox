import GUI from "lil-gui"
import { GridHelper, MeshStandardMaterial, Scene } from "three"
import { CanvasNode } from "../../lib/composer/nodes/CanvasNode"
import { RenderSceneNode } from "../../lib/composer/nodes/RenderSceneNode"
import { ShaderNode } from "../../lib/composer/nodes/ShaderNode"
import { bindDirectionalLight } from "./state-gui/directional-light"
import { populateFloors, populateLights } from "./lib/populator"
import { cameraWithControls, setupWithComposer } from "./setup"

const { canvas, composer, updateFuncs } = setupWithComposer()
const { camera, controls } = cameraWithControls(canvas)

camera.far = 300
camera.position.z = 5

const gui = new GUI()
const FLOOR_COUNT = 10
const state = {
  focusFloor: -1,
}
gui.add(state, "focusFloor", -1, FLOOR_COUNT, 1)

const floors = populateFloors({ count: FLOOR_COUNT, radius: 0 })
floors.forEach((floor) => {
  floor.receiveShadow = true
  floor.castShadow = true
  const material = new MeshStandardMaterial({
    color: 0xaaaaaa + Math.random() * 0x555555,
    transparent: true,
  })
  floor.material = material
  gui.add(material, "opacity", 0, 1, 0.01).name(floor.name)
})

const { directional, lights } = populateLights()
bindDirectionalLight(gui, directional.light, directional.shadowHelper)

const renderBaseNode = composer.createNode(RenderSceneNode)
renderBaseNode.inpScene.defaultValue = () => {
  const scene = new Scene()
  scene.add(new GridHelper(10, 10))
  for (let i = 0; i < FLOOR_COUNT; i++) {
    const floor = floors[i]
    floor.receiveShadow = false
    floor.castShadow = true
    // if (i > state.focusFloor) {
    //   floor.receiveShadow = false
    //   floor.material = new ShadowMaterial()
    // }

    scene.add(floor)
  }
  directional.helper.update()

  lights.forEach((light) => scene.add(light))

  scene.add(directional.helper)
  scene.add(directional.shadowHelper)

  return scene
}
renderBaseNode.inpCamera.defaultValue = camera

const renderAboveNode = composer.createNode(RenderSceneNode)
renderAboveNode.inpScene.defaultValue = () => {
  const scene = new Scene()
  lights.forEach((light) => scene.add(light))
  for (let i = state.focusFloor + 1; i < FLOOR_COUNT; i++) {
    const floor = floors[i].clone()
    // floor.material = new MeshStandardMaterial({
    //   transparent: true,
    //   opacity: 0.5,
    //   color: floor.material.color,
    // })
    floor.receiveShadow = true

    floor.castShadow = true
    scene.add(floor)
  }

  return scene
}

const mixed = composer.createNode(ShaderNode)
mixed.build(
  {
    tBaseColor: { value: renderBaseNode.outColor },
    tBaseDepth: { value: renderBaseNode.outDepth },
    tAboveColor: { value: renderAboveNode.outColor },
    tAboveDepth: { value: renderAboveNode.outDepth },
  },
  /* glsl */ `
  uniform sampler2D tBaseColor;
  uniform sampler2D tBaseDepth;
  uniform sampler2D tAboveColor;
  uniform sampler2D tAboveDepth;
  varying vec2 vUv;

  void main() {
    vec4 baseColor = texture2D(tBaseColor, vUv);
    float baseDepth = texture2D(tBaseDepth, vUv).r;

    vec4 aboveColor = texture2D(tAboveColor, vUv);
    float aboveDepth = texture2D(tAboveDepth, vUv).r;


    if (aboveDepth < baseDepth) {
      gl_FragColor = aboveColor;
    } else {
      gl_FragColor = baseColor;
    }
    gl_FragColor= mix(baseColor, aboveColor, aboveColor.a);
    float alpha = 0.;
    if (aboveColor.a > 0.0) {
      if (baseColor.a > 0.0) {
        alpha = 0.1;
      } else  {
        alpha = 1.0;
      }
    }
    gl_FragColor = mix(baseColor, aboveColor, alpha);
    // gl_FragColor = aboveColor;


  }

`
)
mixed.getInput("tBaseColor").outslot = renderBaseNode.outColor
mixed.getInput("tBaseDepth").outslot = renderBaseNode.outDepth
mixed.getInput("tAboveColor").outslot = renderAboveNode.outColor
mixed.getInput("tAboveDepth").outslot = renderAboveNode.outDepth

renderAboveNode.inpCamera.defaultValue = camera
const canvasNode = composer.createNode(CanvasNode)
canvasNode.inpColor.outslot = renderBaseNode.outColor

updateFuncs.push(() => {
  controls.update()
  composer.freshExecute(canvasNode)
})
