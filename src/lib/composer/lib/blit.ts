import {
  DoubleSide,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
} from "three"
import { IUniform } from "three/src/renderers/shaders/UniformsLib.js"
import { WebGLRenderer } from "three"

export class Blit<T extends string> {
  private mesh = new Mesh(new PlaneGeometry(2, 2))
  private scene = new Scene()
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2)

  constructor(
    private renderer: WebGLRenderer,
    uniforms: Partial<Record<T, IUniform>>,
    fragmentShader: string
  ) {
    this.scene.add(this.mesh)
    this.camera.position.z = 1
    this.camera.lookAt(0, 0, 0)
    this.mesh.material = new ShaderMaterial({
      side: DoubleSide,
      uniforms,
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader,
    })
  }

  private get material() {
    return this.mesh.material as ShaderMaterial
  }

  setUniform<K extends T>(key: K, value: unknown) {
    this.material.uniforms[key].value = value
    this.material.needsUpdate = true
  }

  render() {
    // console.log("render")
    this.renderer.render(this.scene, this.camera)
  }
}
