import {
  Camera,
  DepthTexture,
  PerspectiveCamera,
  Scene,
  Texture,
  WebGLRenderTarget,
} from "three"
import { WebGLNode } from "../WebGLComposer"

export class RenderSceneNode extends WebGLNode {
  inpScene = this.createInput(null as Scene | null)
  inpCamera = this.createInput(null as Camera | null)

  outColor = this.createOutput<Texture>()
  outDepth = this.createOutput<Texture>()

  private renderTarget = new WebGLRenderTarget(1, 1, {
    depthBuffer: true,
    depthTexture: new DepthTexture(1, 1),
  })

  initialize(): void {
    this.outColor.value = this.renderTarget.texture
    this.outDepth.value = this.renderTarget.depthTexture
  }
  execute(): void {
    const { inpScene, inpCamera } = this
    const { renderer, renderTarget } = this
    const width = this.renderer.domElement.clientWidth
    const height = this.renderer.domElement.clientHeight

    this.renderTarget.setSize(width, height)

    if (inpCamera.value instanceof PerspectiveCamera) {
      inpCamera.value.aspect = this.canvas.width / this.canvas.height
      inpCamera.value.updateProjectionMatrix()
    }

    renderer.setRenderTarget(this.renderTarget)
    renderer.setSize(width, height, false)
    renderTarget.setSize(width, height)

    if (inpScene.value && inpCamera.value) {
      renderer.render(inpScene.value, inpCamera.value)
    }
  }
}
