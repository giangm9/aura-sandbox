export function startAnimationLoop() {
  const updateFuncs: Function[] = []

  function update() {
    updateFuncs.forEach((func) => func())
    requestAnimationFrame(update)
  }

  update()
  return updateFuncs
}
