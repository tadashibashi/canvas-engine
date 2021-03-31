import { Transform } from "./Transform";

export class Camera {
  constructor(x = 0, y = 0, z = 0) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }

  position = {
    x: 0,
    y: 0,
    z: 0
  }

  zoom = {
    x: 1,
    y: 1
  };
}