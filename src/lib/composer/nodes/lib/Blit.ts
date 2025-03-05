import {
  Material,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";

export class Blit {
  scene = new Scene();

  renderTarget: WebGLRenderTarget;

  get canvas() {
    return this.renderer.domElement;
  }

  get texture() {
    return this.renderTarget.texture;
  }
  get depthTexture() {
    return this.renderTarget.depthTexture;
  }

  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 100);
  private plane = new PlaneGeometry(2, 2);
  private mesh: Mesh;

  constructor(public renderer: WebGLRenderer, material: Material) {
    this.mesh = new Mesh(this.plane, material);
    this.scene.add(this.mesh);

    this.renderTarget = new WebGLRenderTarget(1, 1);
    this.camera.position.z = 1;
  }

  render(tocanvas = false) {
    const { renderer, scene, camera } = this;
    this.renderTarget.setSize(this.canvas.width, this.canvas.height);
    if (tocanvas) {
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    } else {
      renderer.setRenderTarget(this.renderTarget);
      renderer.render(scene, camera);
    }
  }
}
