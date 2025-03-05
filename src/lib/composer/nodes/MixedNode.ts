import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  WebGLRenderTarget,
} from "three";
import { WebGLNode } from "../WebGLComposer";

export class MixedNode extends WebGLNode {
  inpslots = {
    aColor: this.createInput(null as Texture | null),
    aDepth: this.createInput(null as Texture | null),
    bColor: this.createInput(null as Texture | null),
    bDepth: this.createInput(null as Texture | null),
  };

  outslots = {
    color: this.createOutput<Texture>(),
  };

  private scene = new Scene();
  private material = new ShaderMaterial({
    uniforms: {
      aColor: { value: this.inpslots.aColor.value },
      aDepth: { value: this.inpslots.aDepth.value },
      bColor: { value: this.inpslots.bColor.value },
      bDepth: { value: this.inpslots.bDepth.value },
    },
    vertexShader: vs,
    fragmentShader: fs,
  });

  private mesh = new Mesh(new PlaneGeometry(2, 2), this.material);
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 100);
  private rendertarget = new WebGLRenderTarget(1, 1);

  initialize(): void {
    this.scene.add(this.mesh);
    this.camera.position.z = 1;
  }

  execute() {
    const { renderer, scene, camera } = this;
    this.rendertarget.setSize(
      this.renderer.domElement.width,
      this.renderer.domElement.height
    );
    this.renderer.setRenderTarget(this.rendertarget);

    this.material.uniforms.aColor.value = this.inpslots.aColor.value;
    this.material.uniforms.aDepth.value = this.inpslots.aDepth.value;
    this.material.uniforms.bColor.value = this.inpslots.bColor.value;
    this.material.uniforms.bDepth.value = this.inpslots.bDepth.value;
    this.outslots.color.value = this.rendertarget.texture;

    renderer.render(scene, camera);
  }
}

export const vs = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fs = /* glsl */ `
  precision highp float;
  uniform sampler2D aColor;
  uniform sampler2D aDepth;
  uniform sampler2D bColor;
  uniform sampler2D bDepth;

  varying vec2 vUv;
  void main() {
    vec4 a = texture2D(aColor, vUv);
    vec4 b = texture2D(bColor, vUv);
    float aDepth = texture2D(aDepth, vUv).r;
    float bDepth = texture2D(bDepth, vUv).r;
    if (aDepth < bDepth) {
      gl_FragColor.rgb = a.rgb;//ec4(1.0, 0.0, 0.0, 1.0);
    } else {
      gl_FragColor.rgb = b.rgb;//vec4(0.0, 1.0, 0.0, 1.0);
    }

    gl_FragColor.a = max(a.a, b.a);

  }

`;
