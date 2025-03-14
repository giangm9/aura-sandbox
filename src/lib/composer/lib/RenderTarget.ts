import { WebGLRenderer, WebGLRenderTarget } from "three";
import { Blit } from "./blit";

export function DuplicateRenderTarget(
  renderer: WebGLRenderer,
  from: WebGLRenderTarget,
  to: WebGLRenderTarget
) {
  const blit = new Blit(
    renderer,
    {
      tFromColor: { value: from.texture },
      tFromDepth: { value: from.depthTexture },
    },
    /* glsl */ `
    uniform sampler2D tFromColor;
    uniform sampler2D tFromDepth;
    varying vec2 vUv;
    void main() {
      gl_FragColor = texture2D(tFromColor, vUv);
      gl_FragDepth = texture2D(tFromDepth, vUv).r;
    }
    `
  );

  renderer.setRenderTarget(to);
  blit.render();
}
