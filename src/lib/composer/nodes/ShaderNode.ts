import {
  IUniform,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Texture,
  WebGLRenderTarget,
} from "three"
import { InputSlot } from "../Composer"
import { WebGLNode } from "../WebGLComposer"

const vs = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

export class ShaderNode extends WebGLNode {
  outColor = this.createOutput<Texture>()

  private _scene = new Scene()
  private _camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2)
  private plane = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial())

  private renderTarget = new WebGLRenderTarget(1, 1)
  protected get material() {
    return this.plane.material as ShaderMaterial
  }

  initialize(): void {
    this._camera.position.z = 1
    // this.plane.rotation.x = Math.PI / 2
    this._scene.add(this.plane)
    this._camera.lookAt(0, 0, 0)
    this.outColor.value = this.renderTarget.texture
    // new OrbitControls(this.camera, this.canvas)
  }
  uniformInputs = [] as { name: string; input: InputSlot<unknown> }[]

  build(uniforms: Record<string, IUniform>, shader: string) {
    this.uniformInputs = []

    for (const key in uniforms) {
      this.uniformInputs.push({
        name: key,
        input: this.createInput(uniforms[key].value),
      })
    }

    this.plane.material = new ShaderMaterial({
      uniforms,
      vertexShader: vs,
      fragmentShader: shader,
    })
  }

  getInput(name: string) {
    const item = this.uniformInputs.find((i) => i.name === name)
    if (!item) {
      throw new Error(`Input ${name} not found`)
    } else {
      return item.input
    }
  }

  execute() {
    for (const item of this.uniformInputs) {
      const { name, input } = item
      this.plane.material.uniforms[name].value = input.value
      this.plane.material.needsUpdate = true
    }

    this.renderer.setRenderTarget(this.renderTarget)
    this.resizeTarget(this.canvas.clientWidth, this.canvas.clientHeight)

    this.renderer.render(this._scene, this._camera)
    this.outColor.value = this.renderTarget.texture
  }
}
