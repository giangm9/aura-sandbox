import {
  ACESFilmicToneMapping,
  DepthTexture,
  PCFSoftShadowMap,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three"
import { Composer, Node } from "./Composer"

export class WebGLComposer extends Composer {
  renderer: WebGLRenderer

  renderTarget: WebGLRenderTarget | null = null

  constructor(public canvas: HTMLCanvasElement) {
    super()

    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      depth: true,
    })
    // const gl = this.renderer.getContext()
    // DebugWebGL(gl)

    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 2.0

    // this.renderer.setPixelRatio(window.devicePixelRatio || 1)
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap
  }
}

export abstract class WebGLNode extends Node {
  declare composer: WebGLComposer

  protected resizeTarget(width: number, height: number) {
    const renderer = this.renderer
    const target = this.renderer.getRenderTarget()
    if (!target) {
      renderer.setSize(width, height, false)
      return
    } else if (target.width !== width || target.height !== height) {
      renderer.setSize(width, height, false)
      target.depthTexture?.dispose()
      target.setSize(width, height)
      target.depthTexture = new DepthTexture(width, height)
    }
  }

  protected get canvas() {
    return this.composer.canvas
  }
  protected get renderer() {
    return this.composer.renderer
  }
}
