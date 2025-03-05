import { DataTexture, RGBAFormat } from "three"
import { startAnimationLoop } from "../../lib/animationFrame"
import { WebGLComposer } from "../../lib/composer/WebGLComposer"
import { CanvasNode } from "../../lib/composer/nodes/CanvasNode"

const canvas = document.createElement("canvas")
document.body.appendChild(canvas)
canvas.width = 512
canvas.height = 512

const composer = new WebGLComposer(canvas)
const updateFuncs = startAnimationLoop()

const data = new Uint8Array(4 * 256 * 256)
for (let i = 0; i < data.length; i += 4) {
  const x = (i / 4) % 256
  const y = Math.floor(i / 4 / 256)
  const r = x / 256
  const g = y / 256
  const b = 1.0

  data[i] = r * 255
  data[i + 1] = g * 255
  data[i + 2] = b * 255
  data[i + 3] = 255
}

const texture = new DataTexture(data, 256, 256, RGBAFormat)
texture.needsUpdate = true

const canvasNode = composer.createNode(CanvasNode)
canvasNode.inpColor.defaultValue = texture

updateFuncs.push(() => {
  composer.freshExecute(canvasNode)
})
