import GUI from "lil-gui"
import Stats from "stats.js"
import {
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshNormalMaterial,
  MeshStandardMaterial,
  Scene,
} from "three"
import { GLTFLoader } from "three/examples/jsm/Addons.js"

import { CanvasNode } from "../../lib/composer/nodes/CanvasNode"
import { RenderSceneNode } from "../../lib/composer/nodes/RenderSceneNode"
import { ShaderNode } from "../../lib/composer/nodes/ShaderNode"
import { bindDirectionalLight } from "../../lib/pane/DirectionalLight"
import { cameraWithControls, setupWithComposer } from "./setup"

const loader = new GLTFLoader()
const gui = new GUI()

const { canvas, composer, updateFuncs } = setupWithComposer()
const { camera, controls } = cameraWithControls(canvas)
camera.far = 300

const scene = new Scene()
scene.add(camera)
const stats = new Stats()
document.body.appendChild(stats.dom)
updateFuncs.unshift(() => {
  stats.begin()
})

loader.load("public/glb/small_houses.glb", (gltf) => {
  scene.add(gltf.scene)
  gltf.scene.traverse((child) => {
    if (child instanceof Mesh) {
      child.castShadow = true
      child.receiveShadow = true
      const material = child.material as MeshStandardMaterial
      material.dithering = true
    }
  })
  houseSelect.options([
    "NONE",
    ...gltf.scene.children.map((child) => child.name),
  ])
})

const light = new DirectionalLight(0xffffff, 1)
light.position.set(0, 10, 10)
light.castShadow = true
light.shadow.mapSize.width = 1024
light.shadow.mapSize.height = 1024
const viewSize = 15
light.shadow.camera.left = -viewSize
light.shadow.camera.right = viewSize
light.shadow.camera.top = viewSize
light.shadow.camera.bottom = -viewSize
light.shadow.normalBias = 0.1

scene.add(light)

// const shadowHelper = new CameraHelper(light.shadow.camera)
// scene.add(shadowHelper)

scene.add(new AmbientLight(0xffffff, 0.5))
bindDirectionalLight(gui, light)

const state = {
  house: "NONE",
  alpha: 0.5,
}
const houseSelect = gui.add(state, "house")
gui.add(state, "alpha", 0, 1, 0.01)

const sceneNode = composer.createNode(RenderSceneNode)

sceneNode.inpScene.defaultValue = scene
sceneNode.inpCamera.defaultValue = camera
sceneNode.name = "Scene"
camera.position.set(0, 5, 10)

const focusNode = composer.createNode(RenderSceneNode)
focusNode.inpScene.defaultValue = () => {
  const focus = new Scene()
  const object = scene.getObjectByName(state.house)
  if (object) {
    focus.add(object.clone())
  }

  return focus
}
focusNode.inpCamera.defaultValue = camera

const nonFocusSceneDepth = composer.createNode(RenderSceneNode)
nonFocusSceneDepth.inpScene.defaultValue = () => {
  const nonFocus = scene.clone(false)
  const focusObject = nonFocus.getObjectByName(state.house)

  if (focusObject) {
    // nonFocus.remove(focusObject)
    focusObject.removeFromParent()
  }

  nonFocus.overrideMaterial = new MeshNormalMaterial()

  return nonFocus
}
nonFocusSceneDepth.inpCamera.defaultValue = camera

const highLightNode = composer.createNode(ShaderNode)
highLightNode.build(
  {
    u_diffuse: { value: null },
    u_color: { value: [1, 0, 0] },
    u_alpha: { value: 0.5 },
  },
  /* glsl */ `
  uniform sampler2D u_diffuse;
  uniform vec3 u_color;
  uniform float u_alpha;

  varying vec2 vUv;
  void main() {
    gl_FragColor.rgb = u_color;
    gl_FragColor.a = u_alpha * texture2D(u_diffuse, vUv).a;

  }
`
)
highLightNode.getInput("u_diffuse").outslot = focusNode.outColor
highLightNode.getInput("u_color").defaultValue = [0.1, 0, 1]
highLightNode.getInput("u_alpha").defaultValue = () => state.alpha
highLightNode.name = "Highlight"

const combineNode = composer.createNode(ShaderNode)
combineNode.build(
  {
    u_scene: { value: null },
    u_sceneDepth: { value: null },
    u_highlight: { value: null },
    u_highlightDepth: { value: null },
  },
  /* glsl */ `
  uniform sampler2D u_scene;
  uniform sampler2D u_highlight;
  uniform sampler2D u_sceneDepth;
  uniform sampler2D u_highlightDepth;

  varying vec2 vUv;
  void main() {
    vec4 scene = texture2D(u_scene, vUv);
    float sceneDepth = texture2D(u_sceneDepth, vUv).r;
    vec4 highlight = texture2D(u_highlight, vUv);
    float highlightDepth = texture2D(u_highlightDepth, vUv).r;
    if (highlightDepth > sceneDepth) {

      gl_FragColor.rgb = mix(scene.rgb, highlight.rgb, highlight.a * 0.3);


    } else {
      gl_FragColor.rgb = mix(scene.rgb, highlight.rgb, highlight.a);
    }




    // gl_FragColor = texture2D(u_highlight, vUv);
    gl_FragColor.a = scene.a;
  }
  `
)

const depthDebug = composer.createNode(ShaderNode)
depthDebug.build(
  {
    tDepth: { value: null },
    cameraNear: { value: camera.near },
    cameraFar: { value: camera.far },
  },
  /* glsl */ `
  #include <packing>

			varying vec2 vUv;
			uniform sampler2D tDepth;
			uniform float cameraNear;
			uniform float cameraFar;


			float readDepth( sampler2D depthSampler, vec2 coord ) {
				float fragCoordZ = texture2D( depthSampler, coord ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			}

			void main() {

				float depth = readDepth( tDepth, vUv );

				gl_FragColor.rgb = 1.0 - vec3( depth );
				gl_FragColor.a = 1.0;

			}
  `
)
depthDebug.getInput("tDepth").outslot = sceneNode.outDepth
depthDebug.getInput("cameraNear").defaultValue = () => {
  return camera.near
}
depthDebug.getInput("cameraFar").defaultValue = () => {
  return camera.far
}
depthDebug.name = "Debug"

combineNode.getInput("u_scene").outslot = sceneNode.outColor
combineNode.getInput("u_sceneDepth").outslot = nonFocusSceneDepth.outDepth

combineNode.getInput("u_highlight").outslot = highLightNode.outColor
combineNode.getInput("u_highlightDepth").outslot = focusNode.outDepth

const canvasNode = composer.createNode(CanvasNode)
canvasNode.name = "Canvas"
canvasNode.inpColor.outslot = depthDebug.outColor

updateFuncs.push(() => {
  controls.update()
  composer.freshExecute(canvasNode)
})

updateFuncs.push(() => {
  console.log(nonFocusSceneDepth.outDepth.value)
  stats.end()
})
