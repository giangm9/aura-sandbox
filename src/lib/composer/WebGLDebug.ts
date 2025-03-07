var count = 0

const frameBufferList = []

export function DebugWebGL(gl: WebGL2RenderingContext | WebGLRenderingContext) {
  const ext = gl.getExtension("WEBGL_debug_renderer_info")
  gl.drawElements = new Proxy(gl.drawElements, {
    apply(target, thisArg, args) {
      // console.log("drawCount", count++)
      console.log("drawElements", args)

      return target.apply(thisArg, args)
    },
  })

  gl.viewport = new Proxy(gl.viewport, {
    apply(target, thisArg, args) {
      console.log("viewport", args)
      return target.apply(thisArg, args)
    },
  })

  // gl.bindBuffer = new Proxy(gl.bindBuffer, {
  //   apply(target, thisArg, args) {
  //     console.trace("bindBuffer", args)
  //     return target.apply(thisArg, args)
  //   },
  // })
  gl.createFramebuffer = new Proxy(gl.createFramebuffer, {
    apply(target, thisArg, args) {
      const framebuffer = target.apply(thisArg, args)
      frameBufferList.push(framebuffer)
      console.log("createFramebuffer", args)
      console.log("frameBufferList", frameBufferList)
      return framebuffer
    },
  })

  gl.bindFramebuffer = new Proxy(gl.bindFramebuffer, {
    apply(target, thisArg, args) {
      console.log("bindFramebuffer", args, frameBufferList.indexOf(args[1]))

      const result = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
      if (result !== gl.FRAMEBUFFER_COMPLETE) {
        for (const key in gl) {
          if (typeof gl[key] === "number" && gl[key] === result) {
            console.error("framebuffer error", key)
          }
        }
      }

      return target.apply(thisArg, args)
    },
  })

  // for (const key in gl) {
  //   if (typeof gl[key] === "function") {
  //     gl[key] = new Proxy(gl[key], {
  //       apply(target, thisArg, args) {
  //         console.trace(key, args)
  //         return target.apply(thisArg, args)
  //       },
  //     })
  //   }
  // }
}
