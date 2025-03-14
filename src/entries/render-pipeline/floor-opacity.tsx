import GUI from "lil-gui";
import {
  CameraHelper,
  DepthTexture,
  Mesh,
  RepeatWrapping,
  Scene,
  ShadowMaterial,
  Texture,
  TextureLoader,
  WebGLRenderTarget,
} from "three";
import { Blit } from "../../lib/composer/lib/blit";
import { DuplicateRenderTarget } from "../../lib/composer/lib/RenderTarget";
import { CanvasNode } from "../../lib/composer/nodes/CanvasNode";
import { RenderSceneNode } from "../../lib/composer/nodes/RenderSceneNode";
import { WebGLNode } from "../../lib/composer/WebGLComposer";
import { populateScene } from "./lib/populator";
import { cameraWithControls, setupWithComposer } from "./setup";
import { bindDirectionalLight } from "./state-gui/directional-light";
import { animateFloorsWithState, createFloorState } from "./state-gui/floor";

const { composer, updateFuncs, canvas } = setupWithComposer();

const gui = new GUI();
const floorState = createFloorState(gui, { count: 10 });

const populated = populateScene({ floorCount: 10, neighborCount: 30 });
const directionalHelper = new CameraHelper(populated.directional.shadow.camera);
populated.directional.shadow.normalBias = 0.01;
const textureLoader = new TextureLoader();
const hexagonTexture = textureLoader.load("/textures/hexagon.jpg");
hexagonTexture.wrapS = hexagonTexture.wrapT = RepeatWrapping;

bindDirectionalLight(gui, populated.directional, directionalHelper);
{
  const camera = populated.directional.shadow.camera;
  const size = 20;
  camera.left = -size;
  camera.right = size;
  camera.top = size;
  camera.bottom = -size;
  camera.updateProjectionMatrix();
  populated.directional.shadow.mapSize.set(1024, 1024);
  directionalHelper.update();
}

const animate = animateFloorsWithState(floorState, populated.floors);
updateFuncs.push(animate);

const { camera, controls } = cameraWithControls(canvas);
camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

updateFuncs.push(() => {
  camera.aspect = canvas.clientWidth / canvas.clientHeight;
  camera.updateProjectionMatrix();
  controls.update();
});

const mainScene = new Scene();
mainScene.add(...populated.floors);
mainScene.add(populated.ambient, populated.directional);
mainScene.add(...populated.neighbors);
mainScene.add(populated.ground);
mainScene.add(directionalHelper);

const renderMainScene = composer.createNode(RenderSceneNode);
renderMainScene.inpScene.defaultValue = mainScene;
renderMainScene.inpCamera.defaultValue = camera;
renderMainScene.quality = 2;

type BlitUniforms =
  | `t${"Floor" | "Background"}${"Color" | "Depth"}`
  | "fOpacity"
  | "tHexagon"
  | "screenRatio";

class RenderFloorsNode extends WebGLNode {
  outColor = this.createOutput<Texture>();

  floor = new WebGLRenderTarget(1, 1, {
    depthBuffer: true,
    depthTexture: new DepthTexture(1, 1),
  });

  background = new WebGLRenderTarget(1, 1, {
    depthBuffer: true,
    depthTexture: new DepthTexture(1, 1),
  });

  target = new WebGLRenderTarget(1, 1, {
    depthBuffer: true,
    depthTexture: new DepthTexture(1, 1),
  });

  blit: Blit<BlitUniforms>;

  initialize() {
    this.blit = new Blit<BlitUniforms>(
      this.renderer,
      {
        tFloorColor: { value: this.floor.texture },
        tFloorDepth: { value: this.floor.depthTexture },
        tBackgroundColor: { value: this.background.texture },
        tBackgroundDepth: { value: this.background.depthTexture },
        fOpacity: { value: 1 },
        tHexagon: { value: hexagonTexture },
        screenRatio: { value: 1 },
      },
      /* glsl */ `

      uniform sampler2D tFloorColor;
      uniform sampler2D tFloorDepth;
      uniform sampler2D tBackgroundColor;
      uniform sampler2D tBackgroundDepth;
      uniform sampler2D tHexagon;

      uniform float fOpacity;
      uniform float screenRatio;

      varying vec2 vUv;

      void main() {
        vec4 floorColor = texture2D(tFloorColor, vUv);
        float floorDepth = texture2D(tFloorDepth, vUv).r;
        vec4 backgroundColor= texture2D(tBackgroundColor, vUv);
        float backgroundDepth = texture2D(tBackgroundDepth, vUv).r;
        float hexagon = texture2D(tHexagon, vec2(
          vUv.x * screenRatio,
          vUv.y
        ) * 10.).r + 0.5;
        hexagon = clamp(hexagon, 0., 1.);


        if (floorDepth < backgroundDepth) {
          gl_FragColor = mix(backgroundColor, floorColor, floorColor.a * fOpacity) ;
          gl_FragColor.a = backgroundColor.a + floorColor.a;
          gl_FragDepth = floorDepth;

        } else {
          float alpha = backgroundColor.a - 0.8 * (floorColor.a  );
          alpha = clamp(alpha, 0., 1.);
          gl_FragColor = mix(floorColor, backgroundColor,alpha);
          gl_FragColor.a = backgroundColor.a + floorColor.a;
          gl_FragDepth = backgroundDepth;
        }

        // gl_FragColor = vec4(hexagon);

      }
    `
    );

    [this.floor, this.target, this.background].forEach((target) => {
      this.renderer.setRenderTarget(target);
      this.resizeTarget(canvas.clientWidth * 2, canvas.clientHeight * 2);
    });
  }

  execute() {
    const scene = new Scene();

    const floorShadows = populated.floors.map((floor) => {
      const shadow = floor.clone(true);
      shadow.traverse((obj) => {
        obj.castShadow = true;
        obj.receiveShadow = false;

        if (obj instanceof Mesh) {
          obj.material = new ShadowMaterial({
            depthWrite: false,
          });
        }
      });

      return shadow;
    });
    scene.add(...floorShadows);
    scene.add(populated.ambient);
    scene.add(populated.directional);
    scene.add(...populated.neighbors);
    scene.add(populated.ground);

    this.renderer.setRenderTarget(this.background);
    this.renderer.render(scene, camera);
    // DuplicateRenderTarget(this.renderer, this.background, this.target);

    const count = populated.floors.length;
    for (let i = 0; i < count; i++) {
      const floorScene = new Scene();
      floorScene.add(populated.ambient);
      floorScene.add(populated.directional);
      floorScene.add(populated.floors[i]);
      this.renderer.setRenderTarget(this.floor);

      this.renderer.render(floorScene, camera);

      this.renderer.setRenderTarget(this.target);
      this.blit.setUniform("tFloorColor", this.floor.texture);
      this.blit.setUniform("tFloorDepth", this.floor.depthTexture);

      this.blit.setUniform("tBackgroundColor", this.background.texture);
      this.blit.setUniform("tBackgroundDepth", this.background.depthTexture);
      this.blit.setUniform("fOpacity", opacityMap[i]);
      this.blit.setUniform("tHexagon", hexagonTexture);
      this.blit.setUniform("screenRatio", canvas.width / canvas.height);
      this.blit.render();
      DuplicateRenderTarget(this.renderer, this.target, this.background);
    }

    this.renderer.setRenderTarget(this.target);
    this.outColor.value = this.target.texture;
  }
}

const opacityFolder = gui.addFolder("Floor Opacity");

const opacityMap = populated.floors.map(() => 1);
opacityMap.forEach((_, i) => {
  opacityFolder.add(opacityMap, i, 0, 1, 0.01).name(`Floor ${i}`);
});

const renderFloors = composer.createNode(RenderFloorsNode);
renderFloors.name = "RenderFloors";

const canvasNode = composer.createNode(CanvasNode);
canvasNode.name = "Canvas";
canvasNode.inpColor.outslot = renderFloors.outColor;

updateFuncs.push(() => {
  composer.freshExecute(canvasNode);
});
