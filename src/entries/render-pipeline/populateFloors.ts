import { BoxGeometry, Mesh, MeshStandardMaterial } from "three"

const geometry = new BoxGeometry(5, 1, 5)
export function populateFloors() {
  const floors = [] as Mesh[]
  for (let i = 0; i < 10; i++) {
    const mesh = new Mesh(
      geometry,
      new MeshStandardMaterial({ color: 0xffffff })
    )

    mesh.position.y = 1.5 * i
    mesh.position.x = Math.random() * 10 - 5
    mesh.name = "floor_" + i
    floors.push(mesh)
  }
  return floors
}
