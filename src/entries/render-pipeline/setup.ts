import { OrbitControls } from "three/examples/jsm/Addons.js";
import { startAnimationLoop } from "../../lib/animationFrame";
import { WebGLComposer } from "../../lib/composer/WebGLComposer";
import {
  PCFSoftShadowMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";

function createCanvas() {
  const canvas = document.createElement("canvas");
  document.body.appendChild(canvas);
  Object.assign(canvas.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  } as CSSStyleDeclaration);
  return canvas;
}
export function createRenderer(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFSoftShadowMap;
  return renderer;
}
export function setupBasic() {
  const canvas = createCanvas();
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true });
  const scene = new Scene();
  const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
  const controls = new OrbitControls(camera, canvas);
  camera.position.set(10, 10, 10);
  controls.update();
  controls.enableDamping = true;

  const updateFuncs = startAnimationLoop();

  return { canvas, scene, camera, controls, updateFuncs, renderer };
}
export function setupWithComposer() {
  const canvas = createCanvas();
  const composer = new WebGLComposer(canvas);
  const updateFuncs = startAnimationLoop();

  return { canvas, composer, updateFuncs, renderer: composer.renderer };
}

export function cameraWithControls(canvas: HTMLCanvasElement) {
  const camera = new PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.z = 5;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  return { camera, controls };
}
