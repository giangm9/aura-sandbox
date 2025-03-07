import { OrthographicCamera, PerspectiveCamera } from "three"
import { ShaderNode } from "./ShaderNode"

export class DebugTextureNode extends ShaderNode {
  camera: OrthographicCamera | PerspectiveCamera = null
  isDepth: boolean = false

  initialize() {
    super.initialize()
    this.build(
      {
        debugTexture: { value: null },
        isDepth: { value: 0 },
        cameraNear: { value: 0 },
        cameraFar: { value: 0 },
      },
      /* glsl */ `
      #include <packing>

      uniform sampler2D debugTexture;
			uniform float cameraNear;
			uniform float cameraFar;
      uniform int isDepth;
      varying vec2 vUv;

			float readDepth( sampler2D depthSampler, vec2 coord ) {
				float fragCoordZ = texture2D( depthSampler, coord ).x;
				float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
				return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
			}

			void main() {

        if ( isDepth == 0 ) {
          gl_FragColor = texture2D( debugTexture, vUv );
          return;
        } else  {
          float depth = readDepth( debugTexture, vUv );

          gl_FragColor.rgb = 1.0 - vec3( depth );
          gl_FragColor.a = 1.0;

        }
			}
    `
    )
  }

  execute() {
    this.getInput("cameraNear").defaultValue = this.camera.near
    this.getInput("cameraFar").defaultValue = this.camera.far
    this.getInput("isDepth").defaultValue = this.isDepth ? 1 : 0
    console.log(
      this.getInput("isDepth").defaultValue,
      this.camera.near,
      this.camera.far
    )
    super.execute()
  }
}
