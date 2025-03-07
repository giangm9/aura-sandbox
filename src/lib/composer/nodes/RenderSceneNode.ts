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

  private renderTarget: WebGLRenderTarget | null = null
  quality = 1

  initialize(): void {
    this.renderTarget = new WebGLRenderTarget(1, 1, {
      depthBuffer: true,
      depthTexture: new DepthTexture(1, 1),
    })
    this.resizeTarget(this.canvas.clientWidth, this.canvas.clientHeight)
    this.outColor.value = this.renderTarget.texture
    this.outDepth.value = this.renderTarget.depthTexture
  }

  execute() {
    const { inpScene, inpCamera } = this
    const { renderer, renderTarget } = this
    const width = this.canvas.clientWidth * this.quality
    const height = this.canvas.clientHeight * this.quality

    if (inpCamera.value instanceof PerspectiveCamera) {
      inpCamera.value.aspect = width / height
      inpCamera.value.updateProjectionMatrix()
    } else {
      // TODO
    }

    renderer.setRenderTarget(this.renderTarget)
    this.resizeTarget(width, height)

    if (inpScene.value && inpCamera.value) {
      renderer.render(inpScene.value, inpCamera.value)
      if (renderTarget) {
        this.outColor.value = renderTarget.texture
        this.outDepth.value = renderTarget.depthTexture
      }
    }
  }
}
