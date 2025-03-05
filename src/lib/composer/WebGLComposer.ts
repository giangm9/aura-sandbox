import { PCFSoftShadowMap, WebGLRenderer } from "three"
import { Composer, Node } from "./Composer"

export class WebGLComposer extends Composer {
  renderer: WebGLRenderer

  constructor(public canvas: HTMLCanvasElement) {
    super()
    this.renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true })
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = PCFSoftShadowMap
  }
}

export abstract class WebGLNode extends Node {
  declare composer: WebGLComposer

  protected get canvas() {
    return this.composer.canvas
  }
  protected get renderer() {
    return this.composer.renderer
  }
}
