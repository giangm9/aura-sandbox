import {
  AmbientLight,
  BoxGeometry,
  CameraHelper,
  DirectionalLight,
  DirectionalLightHelper,
  Light,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PlaneGeometry,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/Addons.js";
import { Group } from "three/src/Three.WebGPU.Nodes.js";

const geometry = new BoxGeometry(5, 1, 5);
export type PopulateFloorOptions = {
  count: number;
  radius?: number;
  margin?: number;
};
export function populateFloors({
  count = 10,
  radius = 10,
  margin = 0.5,
}: PopulateFloorOptions) {
  const floors = [] as Mesh[];
  for (let i = 0; i < count; i++) {
    const mesh = new Mesh(
      geometry,
      new MeshStandardMaterial({
        color: 0xaaaaaa + Math.random() * 0x555555,
        transparent: true,
      })
    );

    mesh.position.y = 1 * i + margin * i;
    mesh.position.x = Math.random() * radius - radius / 2;
    mesh.position.z = Math.random() * radius - radius / 2;
    mesh.name = "floor_" + i;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    floors.push(mesh);
  }
  return floors;
}

export function populateLights() {
  const lights = [] as Light[];

  lights.push(new AmbientLight(0xffffff, 1));

  const directional = (() => {
    const light = new DirectionalLight(0xffffff, 2);
    light.castShadow = true;

    const helper = new DirectionalLightHelper(light);
    const shadowHelper = new CameraHelper(light.shadow.camera);

    light.position.set(10, 10, 10);

    return {
      light,
      helper,
      shadowHelper,
    };
  })();
  lights.push(directional.light);

  return {
    lights,
    directional,
  };
}

export type PopulateSceneOptions = {
  floorCount?: number;
  neighborCount?: number;
  neighborRadius?: number;
};
const FLOOR_SIZE = 5;
export const FLOOR_HEIGHT = 2;

export function populateScene({
  floorCount = 10,
  neighborCount = 20,
  neighborRadius = 40,
}: PopulateSceneOptions) {
  const floors = [] as Object3D[];

  for (let i = 0; i < floorCount; i++) {
    const group = new Group();
    group.name = "floor_" + i;
    group.position.y = (i + 0.5) * FLOOR_HEIGHT;
    const count = 4;
    const unit = FLOOR_SIZE / count;

    for (let x = -FLOOR_SIZE / 2 + unit / 2; x < FLOOR_SIZE / 2; x += unit) {
      for (let z = -FLOOR_SIZE / 2 + unit / 2; z < FLOOR_SIZE / 2; z += unit) {
        const alpha = 0.2;
        const height = (alpha + Math.random() * (1 - alpha)) * FLOOR_HEIGHT;
        const mesh = new Mesh(
          new RoundedBoxGeometry(
            FLOOR_SIZE / count,
            height,
            FLOOR_SIZE / count,
            5,
            0.05
          ),
          new MeshStandardMaterial({
            color: 0xaaaaaa + Math.random() * 0x555555,
            transparent: true,
            dithering: false,
            opacity: 0.8 + Math.random() * 0.2,
            metalness: Math.random(),
            roughness: Math.random(),
          })
        );

        mesh.position.set(x, height / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        group.add(mesh);
      }
    }

    floors.push(group);
  }

  const ambient = new AmbientLight(0xffffff, 1);
  const directional = new DirectionalLight(0xffffff, 2);
  directional.castShadow = true;
  directional.position.set(10, 10, 10);

  const neighbors = [] as Mesh[];

  for (let i = 0; i < neighborCount; i++) {
    const width = Math.random() * 4 + 1;
    const height = Math.random() * 30 + 1;
    const depth = Math.random() * 4 + 1;
    const color = 0xcccccc; // 0xaaaaaa + Math.random() * 0x555555;
    const mesh = new Mesh(
      new RoundedBoxGeometry(width, height, depth, 5, 0.05),
      new MeshStandardMaterial({ color })
    );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    neighbors.push(mesh);

    for (let j = 0; j < 20; j++) {
      mesh.position.x = Math.random() * neighborRadius - neighborRadius / 2;
      mesh.position.y = height / 2;
      mesh.position.z = Math.random() * neighborRadius - neighborRadius / 2;
      let intersects = false;

      for (const floor of floors) {
        if (floor.position.distanceTo(mesh.position) < 5) {
          intersects = true;
        }
      }

      for (const neighbor of neighbors) {
        if (
          neighbor != mesh &&
          neighbor.position.distanceTo(mesh.position) < 3
        ) {
          intersects = true;
        }
      }

      if (!intersects) {
        break;
      }
    }
  }

  const ground = new Mesh(
    new PlaneGeometry(neighborRadius * 2, neighborRadius * 2),
    new MeshStandardMaterial({ color: 0x888888 })
  );

  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  return {
    floors,
    ambient,
    directional,
    neighbors,
    ground,
  };
}
