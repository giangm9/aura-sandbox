import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  Texture,
} from "three"
import { WebGLNode } from "../WebGLComposer"

export class CanvasNode extends WebGLNode {
  public inpColor = this.createInput(null as Texture | null)

  private scene = new Scene()
  private plane = new Mesh(
    new PlaneGeometry(2, 2),
    new MeshBasicMaterial({ map: this.inpColor.value, transparent: true })
  )
  private camera = new OrthographicCamera(-1, 1, 1, -1, 0, 2)

  initialize(): void {
    this.scene.add(this.plane)
    this.scene.background = null
    this.camera.position.z = 1
    this.camera.lookAt(this.scene.position)
  }
  execute(): void {
    this.plane.material.map = this.inpColor.value
    this.plane.material.needsUpdate = true
    this.renderer.setRenderTarget(null)
    this.renderer.setSize(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      false
    )
    this.renderer.render(this.scene, this.camera)
  }
}
