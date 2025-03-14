import { createRoot } from "react-dom/client"
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CameraHelper,
  DirectionalLight,
  GridHelper,
  Line,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three"
import { LineMaterial, OrbitControls } from "three/examples/jsm/Addons.js"
import { Panel } from "../../components/panel"
import { Button } from "../../components/button"
import { mat4, vec3 } from "gl-matrix"
const scene = new Scene()

type State = {
  position: vec3
  lookAt: vec3
}

const target: State = {
  position: [0, 0, 0] as vec3,
  lookAt: [0, 0, 0],
}
const fixed: State = {
  position: [0, 0, 0],
  lookAt: [0, 0, 0],
}
function createHelper() {
  const position = new Mesh(
    new SphereGeometry(0.1),
    new MeshBasicMaterial({ color: 0x0000ff })
  )
  const lookAt = new Mesh(
    new SphereGeometry(0.1),
    new MeshBasicMaterial({ color: 0x00ffff })
  )

  const line = new Line(
    new BufferGeometry(),
    new LineMaterial({ color: 0xff0000 })
  )

  line.frustumCulled = false

  scene.add(position, lookAt, line)

  return () => {
    position.position.set(
      target.position[0],
      target.position[1],
      target.position[2]
    )
    lookAt.position.set(target.lookAt[0], target.lookAt[1], target.lookAt[2])

    line.geometry.setFromPoints([
      new Vector3(target.position[0], target.position[1], target.position[2]),
      new Vector3(target.lookAt[0], target.lookAt[1], target.lookAt[2]),
    ])
    line.geometry.computeBoundingSphere()
  }
}
const updateHelper = createHelper()

const targets = [] as State[]

for (var i = 0; i < 3; i++) {
  const radius = 10
  const position = [
    Math.random() * radius - radius / 2,
    Math.random() * radius - radius / 2,
    Math.random() * radius - radius / 2,
  ] as vec3
  const lookAt = [
    Math.random() * radius - radius / 2,
    Math.random() * radius - radius / 2,
    Math.random() * radius - radius / 2,
  ] as vec3

  targets.push({ position, lookAt })

  const camera = new PerspectiveCamera(35, 2, 5 - 0.1, 5)
  camera.position.set(position[0], position[1], position[2])

  camera.lookAt(lookAt[0], lookAt[1], lookAt[2])

  scene.add(camera)
  const helper = new CameraHelper(camera)
  scene.add(helper)
  const targetHelper = new Mesh(
    new BoxGeometry(1, 1, 1),
    new MeshStandardMaterial({ color: 0xff0000 })
  )
  targetHelper.position.set(lookAt[0], lookAt[1], lookAt[2])
  scene.add(targetHelper)
}

scene.add(new GridHelper(10, 10))
const light = new DirectionalLight(0xffffff, 1)
light.position.set(10, -10, 10)
scene.add(light)
scene.add(new AmbientLight(0x404040))
function initMain(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ canvas })
  const camera = new PerspectiveCamera(35, 2, 0.1, 10)
  camera.add(
    new Mesh(
      new SphereGeometry(0.1),
      new MeshBasicMaterial({ color: 0xffff00 })
    )
  )

  scene.add(camera)
  const helper = new CameraHelper(camera)

  scene.add(helper)

  const grid = new GridHelper(2, 10)
  scene.add(grid)

  var down = false

  canvas.addEventListener("mousedown", function () {
    down = true
  })

  window.addEventListener("mouseup", function () {
    down = false
  })
  window.addEventListener("wheel", function (event) {
    const direction = vec3.sub([0, 0, 0], target.position, target.lookAt)
    const length = vec3.length(direction)

    vec3.normalize(direction, direction)
    vec3.scale(direction, direction, length + event.deltaY * 0.001)

    vec3.add(target.position, target.lookAt, direction)
  })

  canvas.addEventListener("mousemove", function (event) {
    if (down) {
      const dx = event.movementX
      const dy = event.movementY

      const x = target.position[0] - target.lookAt[0]
      const y = target.position[1] - target.lookAt[1]
      const z = target.position[2] - target.lookAt[2]

      const up = [0, 1, 0] as vec3
      const position = [x, y, z] as vec3
      const rotate = mat4.identity(mat4.create())

      mat4.rotate(rotate, rotate, -dx * 0.01, up)

      const right = vec3.cross([0, 0, 0], up, position)
      mat4.rotate(rotate, rotate, -dy * 0.01, right)

      vec3.transformMat4(position, position, rotate)
      vec3.add(position, position, target.lookAt)

      target.position = position
    }
  })

  function update() {
    requestAnimationFrame(update)

    fixed.lookAt = vec3.lerp([0, 0, 0], fixed.lookAt, target.lookAt, 0.1)
    if (!down) {
      fixed.position = vec3.lerp(
        [0, 0, 0],
        fixed.position,
        target.position,
        0.1
      )
    } else {
      const fixedDirection = vec3.sub([0, 0, 0], fixed.position, fixed.lookAt)
      const distance = vec3.distance(fixed.position, fixed.lookAt)
      vec3.normalize(fixedDirection, fixedDirection)
      const targetDirection = vec3.sub(
        [0, 0, 0],
        target.position,
        target.lookAt
      )
      vec3.normalize(targetDirection, targetDirection)

      const axis = vec3.cross([0, 0, 0], fixedDirection, targetDirection)
      const angle = vec3.angle(fixedDirection, targetDirection)

      const rotate = mat4.identity(mat4.create())
      mat4.rotate(rotate, rotate, angle * 0.1, axis)

      vec3.transformMat4(fixedDirection, fixedDirection, rotate)
      vec3.scale(fixedDirection, fixedDirection, distance)
      vec3.add(fixed.position, fixedDirection, fixed.lookAt)
    }

    camera.position.set(fixed.position[0], fixed.position[1], fixed.position[2])
    camera.lookAt(fixed.lookAt[0], fixed.lookAt[1], fixed.lookAt[2])
    camera.updateMatrixWorld()
    camera.updateMatrix()
    helper.update()

    renderer.setSize(window.innerWidth, window.innerHeight)
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    updateHelper()
    renderer.render(scene, camera)
  }

  update()
}
function initDebug(canvas: HTMLCanvasElement) {
  const renderer = new WebGLRenderer({ canvas })

  const camera = new PerspectiveCamera(75, 2, 0.1, 1000)
  camera.position.set(10, 10, 10)
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  requestAnimationFrame(function update() {
    requestAnimationFrame(update)

    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false)
    controls.update()
    renderer.render(scene, camera)
  })
}

function App() {
  const focusButtons = targets.map((item, index) => {
    return (
      <Button
        key={index}
        onClick={() => {
          target.position = item.position
          target.lookAt = item.lookAt
        }}
      >
        {index}
      </Button>
    )
  })

  return (
    <>
      <canvas
        style={{
          border: "1px solid lightgray",
          boxSizing: "border-box",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }}
        ref={initMain}
      />
      <canvas
        style={{
          border: "1px solid lightgray",
          boxSizing: "border-box",
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "400px",
          height: "300px",
        }}
        ref={initDebug}
      />
      <Panel>{focusButtons}</Panel>
    </>
  )
}

const root = document.getElementById("root")
createRoot(root!).render(<App />)
