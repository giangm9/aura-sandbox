import Stats from "stats.js"
export function startAnimationLoop() {
  const stats = new Stats()
  document.body.appendChild(stats.dom)
  const updateFuncs: (() => void)[] = []

  function update() {
    requestAnimationFrame(update)
    stats.begin()
    updateFuncs.forEach((func) => func())
    stats.end()
  }

  update()
  return updateFuncs
}
