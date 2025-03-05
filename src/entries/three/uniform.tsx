import { BoxGeometry, GridHelper, Mesh, ShaderMaterial } from "three"
import { setupBasic } from "../render-pipeline/setup"

const { scene, renderer, updateFuncs, camera, controls, canvas } = setupBasic()

scene.add(new GridHelper(10, 10))
camera.position.set(10, 10, 10)

const material = new ShaderMaterial({
  uniforms: {},
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

    }
   
  `,
  fragmentShader: /* glsl */ `
    varying vec2 vUv;
    uniform float u_time;
    void main() {
      gl_FragColor = vec4(vec3(sin(u_time), 1.0));
    }
  `,
})

const box = new Mesh(new BoxGeometry(), material)
scene.add(box)

updateFuncs.push(() => {
  material.uniforms.u_time = { value: performance.now() / 1000 }
  renderer.setSize(canvas.clientWidth, canvas.clientHeight)
  controls.update()

  renderer.render(scene, camera)
})
